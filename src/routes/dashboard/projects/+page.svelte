<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte"
	import ProjectDialog from "$lib/components/project-dialog.svelte"
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js"
	import { Plus, Clock, ArrowUpRight, Blocks } from "lucide-svelte"

	import { invalidateAll } from "$app/navigation"
	import { loaderStore } from "$lib/stores/loader"

	import { formatHours, getHackatimeProjects } from "$lib/utils"
	import { toast } from "svelte-sonner"
	import type { AirtableProject } from "$lib/types"

	let { data } = $props()

	type HackatimeProject = {
		name?: string
		project_name?: string
		project?: string
		total_seconds?: number
	}

	let projects: AirtableProject[] = $state(data?.projects ?? [])

	$effect(() => {
		projects = data?.projects ?? []
	})

	let projectBeingUpdated: AirtableProject | null = $state(null)

	let newProjWindowOpened = $state(false)
	let updateProjWindowOpened = $state(false)

	let showRotator = $state(false)

	let hacks: HackatimeProject[] = $derived(getHackatimeProjects(data?.hacks))

	let usedHackatimes = $derived(
		new Set(
			projects
				.flatMap(project => project.fields.hackatime?.split(",") ?? [])
				.map(name => name.trim())
				.filter(Boolean)
		)
	)

	let availableHacks = $derived(
		hacks.filter(hack => {
			const hackName = hack.name ?? hack.project_name ?? hack.project ?? ""

			return Boolean(hackName) && !usedHackatimes.has(hackName)
		})
	)

	let hackSecondsByName = $derived(
		new Map(
			hacks.map(hack => [
				hack.name ?? hack.project_name ?? hack.project ?? "",
				hack.total_seconds ?? 0,
			])
		)
	)

	function openUpdateProjWindow(project: AirtableProject) {
		projectBeingUpdated = project
		updateProjWindowOpened = true
	}

	function applyBadge(project: AirtableProject) {
		const status = project.fields.status?.toLowerCase() ?? ""
		if (status.startsWith("pending")) {
			return {
				dot: "bg-foreground",
				text: "text-foreground",
				title: "pending",
			}
		}
		if (status.startsWith("rejected")) {
			return {
				dot: "bg-red-500",
				text: "text-red-400",
				title: "changes needed",
			}
		}
		if (status.startsWith("accepted_t2")) {
			return {
				dot: "bg-emerald-500",
				text: "text-emerald-400",
				title: "approved",
			}
		} else if (status.startsWith("accepted")) {
			return {
				dot: "bg-yellow-500",
				text: "text-yellow-400",
				title: "under review",
			}
		}
		return {
			dot: "bg-blue-500",
			text: "text-blue-400",
			title: "unshipped",
		}
	}

	async function invalidater() {
		loaderStore.set(true)
		try {
			await invalidateAll()
		} finally {
			loaderStore.set(false)
		}
	}

	async function shipProject(changelog: string) {
		if (changelog.trim().length < 20) {
			toast.error("Please provide a changelog before shipping.")
			return
		}

		const project = projectBeingUpdated
		if (!project) return

		showRotator = true

		try {
			const response = await fetch("/dashboard/projects/ship", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					recordId: project.id,
					changelog,
				}),
				credentials: "include",
			})

			toast(
				response.ok
					? "Project shipped successfully!"
					: `${await response.text()}. Code: ${response.status}`
			)

			const responseData = await response.json()

			if (projectBeingUpdated) {
				const updatedProject = {
					...projectBeingUpdated,
					fields: {
						...projectBeingUpdated.fields,
						...(responseData.newLog
							? { log: JSON.stringify(responseData.newLog) }
							: {}),
						...(responseData.newStatus
							? { status: responseData.newStatus }
							: {}),
					},
				}

				projectBeingUpdated = updatedProject
				projects = projects.map(p =>
					p.id === updatedProject.id ? updatedProject : p
				)
			}

			await invalidateAll()
		} finally {
			showRotator = false
		}
	}
	let isDeleteDialogOpen = $state(false)
	const onDelete = () => {
		isDeleteDialogOpen = true
	}
	const deleteProject = async () => {
		if (!projectBeingUpdated) return

		showRotator = true

		try {
			const response = await fetch("/dashboard/projects/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					recordId: projectBeingUpdated.id,
				}),
				credentials: "include",
			})

			toast(
				response.ok
					? "Project deleted successfully!"
					: `${await response.text()}. Code: ${response.status} `
			)

			if (response.ok) {
				projects = projects.filter(p => p.id !== projectBeingUpdated?.id)
				projectBeingUpdated = null
				updateProjWindowOpened = false
			}

			await invalidateAll()
		} finally {
			showRotator = false
			isDeleteDialogOpen = false
		}
	}
</script>

<svelte:head>
	<title>Alchemize | Projects</title>
	<meta name="description" content="Alchemize projects" />
	<meta property="og:title" content="Alchemize | Projects" />
</svelte:head>

<div class="abosulte z-90">
	<AlertDialog.Root
		open={isDeleteDialogOpen}
		onOpenChange={open => (isDeleteDialogOpen = open)}
	>
		<AlertDialog.Content class="z-60 backdrop:blur-lg">
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. This will permanently delete your
					Project and remove the project from our servers.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action>
					<button onclick={deleteProject}>Continue</button>
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>

<main class="h-full overflow-y-auto w-full py-6 px-10 flex flex-col gap-8">
	<div
		class="flex items-end justify-between border-b-2 py-3 px-8 border-border"
	>
		<div class="flex items-center gap-3 text-foreground">
			<Blocks class="size-5" />
			<h1
				class="text-2xl font-display font-black uppercase tracking-wider line-clamp-1"
			>
				Your Mixes
			</h1>
		</div>

		<Button
			size="sm"
			variant="outline"
			onclick={() => (newProjWindowOpened = true)}
		>
			<Plus class="size-4 mr-1 stroke-3" />
			<span>New Mix</span>
		</Button>
	</div>

	<div class="flex flex-col gap-6 px-15 py-5">
		{#if projects.length}
			{#each projects as project}
				<button
					class="w-full h-[28vh] bg-card border-2 border-border rounded-md rounded-tl-2xl rounded-br-2xl overflow-hidden flex items-center gap-5 p-2 py-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition text-card-foreground"
					onclick={() => openUpdateProjWindow(project)}
				>
					<div class="w-[35%] h-full shrink-0 overflow-hidden">
						{#if project.fields.screenshot}
							<img
								src={project.fields.screenshot}
								alt=""
								class="w-full h-full object-cover rounded-xl border"
							/>
						{:else}
							<div
								class="w-full h-full flex items-center justify-center border rounded-xl"
							>
								No Image
							</div>
						{/if}
					</div>

					<div
						class="h-full w-full p-2 flex flex-col justify-between gap-4 min-h-0 min-w-0"
					>
						<div class=" flex flex-col gap-2 items-end">
							<h2 class="text-3xl font-display font-bold truncate">
								{project.fields.Name || "Untitled Mix"}
							</h2>

							<p class="text-muted-foreground line-clamp-5">
								{project.fields.description || "No description."}
							</p>
						</div>

						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 uppercase text-xs font-body">
								<span class={`h-2 w-2 rounded-full ${applyBadge(project).dot}`}
								></span>

								<span class={`font-semibold ${applyBadge(project).text}`}>
									{applyBadge(project).title}
								</span>
							</div>

							<div
								class="flex items-center gap-5 text-sm text-muted-foreground"
							>
								<span class="flex items-center gap-1">
									<Clock class="size-4" />
									{formatHours(
										hackSecondsByName.get(project.fields.hackatime ?? "") ?? 0
									)}
								</span>

								<ArrowUpRight
									class="size-5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								/>
							</div>
						</div>
					</div>
				</button>
			{/each}
		{:else}
			<div class="flex flex-col items-center justify-center py-24 gap-6">
				<p class="text-secondary-foreground">No mixes yet.</p>

				<Button onclick={() => (newProjWindowOpened = true)}>
					<Plus class="size-4 mr-2" />
					Create your first mix
				</Button>
			</div>
		{/if}
	</div>
</main>

<ProjectDialog
	bind:open={newProjWindowOpened}
	mode="create"
	{availableHacks}
	{invalidater}
	onship={() => {}}
	onDelete={() => {}}
/>

<ProjectDialog
	bind:open={updateProjWindowOpened}
	mode="update"
	project={projectBeingUpdated}
	{availableHacks}
	onship={shipProject}
	{showRotator}
	{invalidater}
	{onDelete}
/>
