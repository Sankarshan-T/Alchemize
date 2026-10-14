import { redirect, type RequestHandler } from "@sveltejs/kit"
import { BOT_AUTH } from "$env/static/private"
import { START_DATE } from "$env/static/private"
import { hackatimeAuthUrl } from "$lib/utils"
import type { Log } from "$lib/types"
import { env } from "$env/dynamic/private"
import { findHackatimeConflicts, getHackatimeTokenByEmail, getProjectById, patchProjectForShip, patchUserHackatime } from "$lib/db"
import { fetchHackatimeProjects } from "$lib/server/hackatime"
import { getShippingWindowState } from "$lib/server/shippingWindow"
import { requireUserApi } from "$lib/server/auth"
import { applyShip, calculateShipDelta } from "$lib/server/projectLog"
import { isHttpUrl } from "$lib/urls"
/* REQUEST BODY
	-Record ID
	-Changelog
	(the user is identified from the session cookie, the Hackatime token from the DB)
*/

const MAX_CHANGELOG_LENGTH = 2000

function parseLog(logJson: string): Log[] {
	try {
		return JSON.parse(logJson) as Log[]
	} catch (error) {
		console.error("Invalid log JSON:", error)
		// throw new Error("Failed to parse log data")
		return [] as Log[]
	}
}
const isUserIdv = async (email: string): Promise<boolean> => {
	// Encoded: an email like "jane+alchemize@gmail.com" otherwise arrives as "jane alchemize@gmail.com"
	const fetchRes = await fetch(`https://auth.hackclub.com/api/external/check?email=${encodeURIComponent(email)}`)
	const data = await fetchRes.json()
	return data.result === "verified_eligible"
}
export const POST: RequestHandler = async ({ request, locals }) => {
	// Season window from SHIPPING_OPENS_AT / SHIPPING_CLOSES_AT (closed unless configured)
	const shippingWindow = getShippingWindowState({ SHIPPING_OPENS_AT: env.SHIPPING_OPENS_AT, SHIPPING_CLOSES_AT: env.SHIPPING_CLOSES_AT })
	if (!shippingWindow.open) {
		return new Response(shippingWindow.message, { status: 403 })
	}
	const userData = requireUserApi(locals)

	const { recordId, changelog } = await request.json()
	if (!recordId || !Number.isSafeInteger(Number(recordId))) {
		return new Response("Missing required fields", { status: 400 })
	}
	if (typeof changelog !== "string" || changelog.trim() === "") {
		return new Response("Please describe what changed in this ship", { status: 400 })
	}
	if (changelog.length > MAX_CHANGELOG_LENGTH) {
		return new Response(`The changelog must be at most ${MAX_CHANGELOG_LENGTH} characters`, { status: 400 })
	}

	// Ownership first: nothing about someone else's project (or their account) is checked or revealed
	const projectResponse = await getProjectById(String(recordId))
	if (!projectResponse.ok) {
		return new Response("Project not found", { status: 404 })
	}
	const projectData = await projectResponse.json()
	if (!projectData.fields?.owner || projectData.fields.owner !== userData.email) {
		return new Response("Project not found", { status: 404 })
	}

	//Check if the project's all fields are filled, if not return 400
	if (
		!projectData.fields.Name ||
		!projectData.fields.description ||
		!projectData.fields.Theme ||
		!projectData.fields.type ||
		!projectData.fields.code ||
		!projectData.fields.demo ||
		!projectData.fields.screenshot ||
		!projectData.fields.hackatime ||
		!projectData.fields.screenshot2
	) {
		return new Response("All project fields are required", { status: 400 })
	}
	if (!isHttpUrl(projectData.fields.code) || !isHttpUrl(projectData.fields.demo)) {
		return new Response("The demo and repository links must be http(s) URLs, please edit the project", { status: 400 })
	}
	// One Hackatime project backs one Alchemize project. If several projects share one (created before
	// this rule existed), only the oldest of them may keep shipping.
	const conflicts = await findHackatimeConflicts(userData.email, projectData.fields.hackatime, projectData.fields.id)
	const olderConflict = conflicts.filter(project => project.id < projectData.fields.id).sort((a, b) => a.id - b.id)[0]
	if (olderConflict) {
		return new Response(
			`This Hackatime project is already linked to your project "${olderConflict.Name}". Each Hackatime project can only be submitted under one Alchemize project, ask in #alchemize-help if this is a mistake.`,
			{ status: 400 }
		)
	}

	const [htToken, idv] = await Promise.all([
		getHackatimeTokenByEmail(userData.email),
		isUserIdv(userData.email)
	])
	if (!idv) {
		return new Response("Your account is not verified or you are over 18, please contact #identity-help", { status: 403 })
	}
	if (!htToken) {
		throw redirect(303, hackatimeAuthUrl)
	}
	if (projectData.fields.address === "null" || !projectData.fields.address) {
		return new Response("Your Address is missing, please add it on auth.hackclub.com", { status: 400 })
	}
	const hackatime = await fetchHackatimeProjects(htToken, START_DATE)
	if (!hackatime.ok) {
		if (hackatime.reason === "unauthorized") {
			// Revoked or expired token: forget it, the dashboard will ask the user to connect Hackatime again
			await patchUserHackatime(userData.email, "")
			return new Response("Your Hackatime connection has expired, please reload the dashboard and connect Hackatime again", { status: 400 })
		}
		return new Response("Hackatime is not responding right now, please try again in a few minutes", { status: 503 })
	}
	const hackatimeProject = hackatime.projects.find(project => project.name === projectData.fields.hackatime)
	if (!hackatimeProject) {
		return new Response(`Couldn't find the Hackatime project "${projectData.fields.hackatime}" on your Hackatime account`, { status: 400 })
	}
	const previousLogs = parseLog(projectData.fields.log || "[]")
	const hackatimeTime = Math.floor(hackatimeProject.total_seconds / 60)
	const deltaTime = calculateShipDelta(hackatimeTime, previousLogs)
	// A zero delta is allowed (shipping an update without new time); a negative one means Hackatime now
	// shows less than was already recorded, which reviewers could neither approve nor reject
	if (deltaTime < 0) {
		return new Response("Hackatime shows less time on this project than was already recorded, please ask in #alchemize-help", { status: 400 })
	}

	const currentTime = Date.now()
	const updatedLog = applyShip(previousLogs, deltaTime, changelog.trim())
	const response = await patchProjectForShip(String(recordId), projectData.fields.log, updatedLog, `pending_${currentTime}`)
	if (!response.ok) {
		console.error(`Failed to update project ${recordId}:`, {
			status: response.status,
			statusText: await response.text(),
			timestamp: new Date().toISOString(),
			slackId: userData.slack_id,
			projectName: projectData.fields.Name,
			projectLink: projectData.fields.code,
		})
		// 409 = the log changed since it was read (e.g. a review landed); ask the user to retry
		if (response.status === 409) {
			return new Response("Your project was just updated by a reviewer, please refresh and ship again", { status: 409 })
		}
		return new Response("Failed to ship Project", { status: 500 })
	}
	// Notify only after the write has committed
	const botResponse = await fetch("https://notifications.alchemize.hackclub.com/ship", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${BOT_AUTH}`,
			},
			body: JSON.stringify({
				user_id: userData.slack_id,
				project_name: projectData.fields.Name,
				project_link: projectData.fields.code,
			}),
		})

	if (!botResponse.ok) {
		console.warn(`Failed to send notification to bot for record ${recordId}:`, {
			status: botResponse.status,
			statusText: botResponse.statusText,
			timestamp: new Date().toISOString(),
			slackId: userData.slack_id,
			projectName: projectData.fields.Name,
			projectLink: projectData.fields.code,
		})
		return new Response("Project shipped but failed to send notification", {
			status: 207,
		})
	}
	return new Response(
		JSON.stringify({
			message: "Project shipped successfully!",
			newLog: updatedLog,
			newStatus: `pending_${currentTime}`,
		}),
		{ status: 201 }
	)
}
export const GET: RequestHandler = async () => {
	return new Response("You should not be here! go away", { status: 401 })
}
