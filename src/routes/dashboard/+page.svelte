<script lang="ts">
	//@ts-ignore
	import looseJson from "loose-json"
	const { data } = $props()
	import { CircleQuestionMark } from "@lucide/svelte"
	import { Button } from "$lib/components/ui/button"
	type HackatimeProject = {
		name?: string
		project_name?: string
		project?: string
		total_seconds?: number
	}

	interface Project {
		id: string
		createdTime: string
		fields: {
			Name: string
			description: string
			code?: string
			demo?: string
			type: string
			update?: boolean
			hackatime: string
			journals: ""
			languages: ""
			log: ""
			owner: string
			status: string
			Theme: string
		}
	}

	import type { UserCurrency } from "$lib/types"
	import { formatHours, getHackatimeProjects } from "$lib/utils"
	import {
		ArrowRightLeft,
		Blocks,
		ShieldUser,
		ShoppingBasket,
		Users,
		Clock,
		Newspaper,
		User as UserIcon,
	} from "lucide-svelte"

	let hacks: HackatimeProject[] = $derived(getHackatimeProjects(data?.hacks))

	let projects: Project[] = $derived(data?.projects ?? [])
	let hackSecondsByName = $derived(
		new Map(
			hacks.map(hack => [
				hack.name ?? hack.project_name ?? hack.project ?? "",
				hack.total_seconds ?? 0,
			])
		)
	)
	let userCurrencies = $derived(
		looseJson(data.user?.currency ?? "{}")
	) as UserCurrency

	const renderBadge = (text: string) => {
		switch (text?.toLowerCase()) {
			case "endless":
				return "<img src='/alch-aquaregia.png' alt='Aqua Regia' class='w-4 h-4 object-contain' /> Endless"
			case "no-internet":
				return "<img src='/alch-glowstone.png' alt='Glowstone' class='w-4 h-4 object-contain' /> No Internet"
			case "indie-gamedev":
				return "<img src='/alch-redstone.png' alt='Redstone' class='w-4 h-4 object-contain' /> Indie Game Dev"
			case "potion mix":
				return "<img src='/Alchemize.png' alt='Potion Mix' class='w-4 h-4 object-contain' /> Potion Mix"
			default:
				return null
		}
	}

	const navItems = [
		{ href: "/dashboard/projects", label: "Projects", icon: Blocks },
		{ href: "/refer", label: "Refer!", icon: Users },
		{ href: "/docs", label: "Docs", icon: Newspaper },
	]
</script>

<svelte:head>
	<title>Alchemize | Dashboard</title>
	<meta name="description" content="Alchemize dashboard" />
	<meta property="og:title" content="Alchemize | Dashboard" />
</svelte:head>

<main class="h-full w-full flex gap-6 p-7">
	<!-- <div class="flex items-center gap-3 p-1">
		<div
			class="bg-primary/10 rounded-tl-2xl rounded-br-2xl rounded-md text-primary border border-primary"
		>
			<img
				src={data.pfp}
				alt={data?.name}
				class="h-10 w-10 rounded-tl-2xl rounded-br-2xl rounded-md"
			/>
		</div>
		<div class="flex flex-col min-w-0">
			{#if !!data.admin}
				<a
					href="/admin"
					class="flex gap-1 items-center w-full mt-auto text-card-foreground hover:underline"
				>
					<ShieldUser class="w-3 h-3 stroke-2" />
					<span class="text-xs tracking-wider inline"> Admin </span>
				</a>
			{/if}
			<p
				class="text-card-foreground text-xs font-bold uppercase tracking-widest"
			>
				{data?.name}
			</p>
			<span
				class="font-body font-bold text-xs tracking-wide text-muted-foreground truncate"
			>
				{data?.email}
			</span>
		</div>
	</div> -->

	<div class="flex flex-col gap-6 flex-1 min-h-0">
		<div class="w-full flex items-center justify-start gap-4">
			<div
				class="shadow-primary hover:shadow-sm transition w-64 shrink-0 bg-card border-2 border-border px-3 p-2 rounded-tl-2xl rounded-br-2xl rounded-md flex flex-col gap-4 font-note"
			>
				<div class="flex items-center gap-3">
					<img
						src={data.pfp}
						alt={data.name}
						class="size-12 rounded-tl-2xl rounded-br-2xl rounded-md border border-primary"
					/>

					<div class="min-w-0 flex-1">
						<h2
							class="font-display text-card-foreground font-black uppercase tracking-wider leading-none"
						>
							{data.name}
						</h2>

						<p class="text-xs text-muted-foreground truncate mt-1">
							{data.email}
						</p>
					</div>
				</div>

				<div class="border-t border-border/50"></div>

				<div class="flex items-center justify-between">
					<div class="flex flex-col">
						<span
							class="text-[10px] uppercase tracking-widest font-medium text-card-foreground"
						>
							Account
						</span>

						<span class="font-bold text-xs text-muted-foreground">
							{data.admin ? "Admin" : "Member"}
						</span>
					</div>

					{#if data.admin}
						<a href="/admin">
							<Button variant="secondary" size="xs">
								<ShieldUser />
								Admin
							</Button>
						</a>
					{/if}
				</div>
			</div>
			<div
				class="shadow-primary hover:shadow-sm transition w-full flex flex-col gap-3 bg-card border-2 border-border p-4 rounded-tl-2xl rounded-br-2xl rounded-md"
			>
				<div class="flex items-center justify-between">
					<h1
						class="font-display font-black text-card-foreground text-md uppercase tracking-wider"
					>
						Your Inventory
					</h1>
					<Button variant="primary" size="sm">
						<ArrowRightLeft class="w-3 h-3 stroke-2" />
						Trade Station
					</Button>
				</div>
				<div class="gap-3 grid grid-cols-2 sm:grid-cols-4">
					<div
						class="flex items-center gap-2 bg-secondary/80 border border-border p-2 rounded-tl-2xl rounded-br-2xl rounded-md"
					>
						<div class="p-1 shrink-0 rounded">
							<img
								src="/alch-redstone.png"
								alt="Redstone"
								class="w-5 h-5 object-contain"
							/>
						</div>
						<div class="min-w-0">
							<p
								class="text-secondary-foreground text-[9px] uppercase font-bold tracking-wider truncate"
							>
								Redstone
							</p>
							<p
								class="font-body font-black text-muted-foreground text-base leading-none mt-0.5"
							>
								{userCurrencies.redstone ?? 0}
							</p>
						</div>
					</div>

					<div
						class="flex items-center gap-2 bg-secondary/80 border border-border p-2 rounded-tl-2xl rounded-br-2xl rounded-md"
					>
						<div class="p-1 shrink-0 rounded">
							<img
								src="/alch-glowstone.png"
								alt="Glowstone"
								class="w-5 h-5 object-contain"
							/>
						</div>
						<div class="min-w-0">
							<p
								class="text-secondary-foreground text-[9px] uppercase font-bold tracking-wider truncate"
							>
								Glowstone
							</p>
							<p
								class="font-body font-black text-muted-foreground text-base leading-none mt-0.5"
							>
								{userCurrencies.glowstone ?? 0}
							</p>
						</div>
					</div>

					<div
						class="flex items-center gap-2 bg-secondary/80 border border-border p-2 rounded-tl-2xl rounded-br-2xl rounded-md"
					>
						<div class="p-1 shrink-0 rounded">
							<img
								src="/alch-aquaregia.png"
								alt="Aqua Regia"
								class="w-5 h-5 object-contain"
							/>
						</div>
						<div class="min-w-0">
							<p
								class="text-secondary-foreground text-[9px] uppercase font-bold tracking-wider truncate"
							>
								Aqua Regia
							</p>
							<p
								class="font-body font-black text-muted-foreground text-base leading-none mt-0.5"
							>
								{userCurrencies.aqua_regia ?? 0}
							</p>
						</div>
					</div>

					<div
						class="flex items-center gap-2 bg-secondary/80 border border-border p-2 rounded-tl-2xl rounded-br-2xl rounded-md"
					>
						<div class="p-1 shrink-0 rounded">
							<img
								src="/Alchemize.png"
								alt="Potion Mix"
								class="w-5 h-5 object-contain"
							/>
						</div>
						<div class="min-w-0">
							<p
								class="text-secondary-foreground text-[9px] uppercase font-bold tracking-wider truncate"
							>
								Potion Mix
							</p>
							<p
								class="font-body font-black text-muted-foreground text-base leading-none mt-0.5"
							>
								{userCurrencies.potion_mix ?? 0}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
			<div class="flex flex-col gap-4 flex-1 min-h-0">
				<div
					class="shadow-primary hover:shadow-sm transition flex flex-col bg-card border-2 border-border p-5 rounded-tl-2xl rounded-br-2xl rounded-md w-full flex-2 min-h-0"
				>
					<div
						class="flex items-center gap-2 pb-3 shrink-0 border-b border-border/50 mb-3"
					>
						<Blocks class="w-5 h-5 text-card-foreground" />
						<h2
							class="font-display font-black text-card-foreground text-lg uppercase tracking-wider"
						>
							Your Mixes
						</h2>
					</div>

					<div
						class="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 no-scrollbar"
					>
						{#if projects && projects.length > 0}
							{#each projects as project}
								<div
									class="bg-secondary/40 p-4 text-secondary-foreground rounded-tl-2xl rounded-br-2xl rounded-md border border-border hover:border-border/70 transition-colors cursor-pointer flex flex-col justify-between gap-2 group/item shrink-0"
								>
									<div class="flex justify-between items-start gap-4">
										<p
											class="font-alchemize font-bold text-secondary-foreground text-md tracking-wide group-hover/item:text-secondary-foreground/80 transition-colors"
										>
											{project.fields.Name || "Untitled Project"}
										</p>
										<span
											class="text-xs font-bold flex items-center gap-1 shrink-0"
										>
											<Clock class="size-3.5 text-primary" />
											{formatHours(
												hackSecondsByName.get(project.fields.hackatime ?? "") ??
													0
											)}h
										</span>
									</div>
									<p
										class=" text-xs font-body tracking-normal line-clamp-1 flex gap-2"
									>
										{@html renderBadge(project.fields.Theme)}
									</p>
								</div>
							{/each}
						{:else}
							<div class="text-sm py-4">No projects yet.....</div>
						{/if}
					</div>

					<a
						href="/dashboard/projects"
						class="self-end text-card-foreground font-bold text-xs uppercase tracking-widest hover:underline pt-3 flex items-center gap-1 shrink-0"
					>
						View all mixes →
					</a>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
					<div
						class="shadow-primary hover:shadow-sm transition flex flex-col gap-2 bg-card border-2 border-border p-4 rounded-tl-2xl rounded-br-2xl rounded-md justify-center"
					>
						<div class="flex items-center justify-between">
							<p
								class="text-card-foreground text-xs font-bold uppercase tracking-widest flex items-center"
							>
								HCA Configs
								<a
									href="/docs/issues/hca-configs"
									target="_blank"
									rel="noreferrer"
								>
									<CircleQuestionMark class="ml-1.5 size-3" />
								</a>
							</p>
							{#if data.misconfigured.length > 0}
								<a href="/auth">
									<Button variant="primary">Re-login</Button>
								</a>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<span
								class="h-2 w-2 rounded-full {data.misconfigured.length === 0
									? 'bg-primary'
									: 'bg-red-700'}"
							></span>
							<span
								class="font-body font-bold uppercase text-xs tracking-wider {data
									.misconfigured.length === 0
									? 'text-primary'
									: 'text-red-700'}"
							>
								{data.misconfigured.length === 0
									? "Complete"
									: data.misconfigured.join(", ") + " Misconfigured"}
							</span>
						</div>
					</div>

					<div
						class="shadow-primary hover:shadow-sm transition flex flex-col gap-2 bg-card border-2 border-border p-4 rounded-tl-2xl rounded-br-2xl rounded-md justify-center"
					>
						<p
							class="text-card-foreground text-xs font-bold uppercase tracking-widest"
						>
							YSWS Eligibility
						</p>
						<div class="flex items-center gap-2">
							<span
								class="h-2 w-2 rounded-full {data.eligiblity
									? 'bg-primary'
									: 'bg-red-700'}"
							></span>
							<span
								class="font-body font-bold uppercase text-xs tracking-wider {data.eligiblity
									? 'text-primary'
									: 'text-red-700'}"
							>
								{data.eligiblity ? "Eligible" : "Not Eligible"}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-4 flex-1 min-h-0">
				<div
					class="shadow-primary hover:shadow-sm transition w-full flex flex-col bg-card border-2 border-border p-5 rounded-tl-2xl rounded-br-2xl rounded-md flex-2 min-h-0"
				>
					<div
						class="flex items-center gap-2 pb-3 shrink-0 border-b border-border/50 mb-3"
					>
						<Newspaper class="w-5 h-5 text-card-foreground" />
						<h2
							class="font-display font-black text-card-foreground text-lg uppercase tracking-wider"
						>
							News & Updates
						</h2>
					</div>
					<div class="flex-1 overflow-y-auto pr-1 text-sm no-scrollbar">
						<div class="flex flex-col gap-3">
							<div
								class="border-l-2 border-border bg-secondary/50 p-3 rounded-r-md"
							>
								<span
									class="text-[11px] font-bold text-muted-foreground tracking-widest uppercase"
								>
									August 8th 2026
								</span>
								<h3 class="text-xs font-bold text-secondary-foreground mt-0.5">
									Alchemize Season 2
								</h3>
								<p
									class="text-secondary-foreground text-[11px] font-sans mt-1 leading-relaxed"
								>
									Alchemize season 2 has officially started! Go make new
									projects now!
								</p>
							</div>
						</div>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
					<div class="grid flex-1 grid-rows-[1fr_1fr] gap-4 min-h-0">
						<div
							class="shadow-primary hover:shadow-sm transition flex items-center justify-between bg-secondary border-2 border-border p-5 rounded-tl-2xl rounded-br-2xl rounded-md min-h-0"
						>
							<Users class="size-7 text-secondary-foreground" />
							<a href="/refer">
								<Button variant="primary">Refer people!</Button>
							</a>
						</div>
						<div
							class="shadow-primary hover:shadow-sm transition flex items-center justify-between bg-secondary border-2 border-border p-5 rounded-tl-2xl rounded-br-2xl rounded-md min-h-0"
						>
							<Newspaper class="size-7 text-secondary-foreground" />
							<a href="/docs">
								<Button variant="primary">Read the Docs</Button>
							</a>
						</div>
					</div>
					<div
						class="w-full shadow-primary hover:shadow-sm transition flex flex-col items-center bg-secondary border-2 border-border p-5 rounded-tl-2xl rounded-br-2xl rounded-md min-h-0"
					>
						<ShoppingBasket class="size-20 text-secondary-foreground" />
						<a href="/dashboard/shop">
							<Button variant="primary">Shop now!</Button>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	:global(.no-scrollbar::-webkit-scrollbar) {
		display: none;
	}
	:global(.no-scrollbar) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
