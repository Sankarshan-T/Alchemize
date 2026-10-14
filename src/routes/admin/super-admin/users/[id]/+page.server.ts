import { getAdminByEmail } from '$lib/db'
import type { PageServerLoad } from './$types'
import jwt from "jsonwebtoken"
import { ADMIN_JWT_SECRET, SLACK_BOT_TOKEN } from "$env/static/private"
import { redirect } from "@sveltejs/kit"
import { WebClient } from "@slack/web-api"
import { hasRole } from "$lib/roles"

const slackClient = new WebClient(SLACK_BOT_TOKEN)
async function getUserName(userId: string) {
    try {
        const result = await slackClient.users.info({ user: userId });

        return result.user?.profile?.display_name || "Unknown User";
    } catch (error) {
        return "Unknown User"
    }
}
export const load: PageServerLoad = async ({ params, cookies }) => {
    const adminAccessToken = cookies.get("admin_access_token")
    const adminJwt = cookies.get("admin_jwt")
    if (!adminAccessToken || !adminJwt) {
        throw redirect(303, "/admin/login")
    }
    
    let decoded = jwt.verify(adminJwt, ADMIN_JWT_SECRET );
    //@ts-ignore
    if (!decoded || !decoded.name || !decoded.isSuperAdmin) {
        throw redirect(303, "/admin/login")
    }


        let email = params.id
    let adminRes = await getAdminByEmail(email)
    let adminData = await adminRes.json()
    if (!adminRes.ok || !adminData.records || adminData.records.length === 0) {
        return {
            slackName: "Unknown User",

            slackId: "",
            email: email,
            isReviewer: false,
            isSuperAdmin: false,
            isFulfiller: false,
            isT2Reviewer: false,
            isShopManager: false,
        }
    }
    let roles = adminData.records[0].fields.roles || ""
    return {
        slackName: await getUserName(adminData.records[0].fields.slackId),
        slackId: adminData.records[0].fields.slackId,
        email: adminData.records[0].fields.email,
        isReviewer: hasRole(roles, "reviewer"),
        isSuperAdmin: hasRole(roles, "super_admin"),
        isFulfiller: hasRole(roles, "fulfiller"),
        isT2Reviewer: hasRole(roles, "t2_reviewer"),
        isShopManager: hasRole(roles, "shop_manager"),
        nda: adminData.records[0].fields.nda === "true"
    }
}