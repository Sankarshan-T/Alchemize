<script lang="ts">
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import {
		PUBLIC_HACKCLUB_AUTH,
		PUBLIC_HACKCLUB_REDIRECT,
		PUBLIC_TURNED_OFF,
	} from "$env/static/public"

	let { data } = $props()
	let rsvpCount: number | "Fetching" = $state("Fetching")
	let showRotator = $state(false)
	let shopItems: { itemID: string; name: string; cdnImage: string }[] = $state(
		[]
	)
	let shopItemsError = $state(false)
	const clientId = PUBLIC_HACKCLUB_AUTH
	const uri = encodeURIComponent(PUBLIC_HACKCLUB_REDIRECT)

	let hasaccessToken = $state(
		browser &&
			document.cookie.split("; ").find(row => row.startsWith("slack_id=")) !==
				undefined
	)

	let authUrl = $derived(
		PUBLIC_TURNED_OFF !== "false"
			? `./turned-off`
			: hasaccessToken
				? `./dashboard/projects`
				: `/auth`
	)

	let referUrl = $state(`./refer`)

	const targetDate = new Date("2026-06-21T01:00:00Z").getTime()
	let timeLeft = $state(Math.max(0, targetDate - Date.now()))

	let time = $derived(formatTime(timeLeft))

	$effect(() => {
		const interval = setInterval(() => {
			const difference = targetDate - Date.now()

			if (difference <= 0) {
				timeLeft = 0
				clearInterval(interval)
			} else {
				timeLeft = difference
			}
		}, 1000)

		return () => clearInterval(interval)
	})

	function formatTime(ms: number) {
		if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

		const seconds = Math.floor((ms / 1000) % 60)
		const minutes = Math.floor((ms / 1000 / 60) % 60)
		const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
		const days = Math.floor(ms / (1000 * 60 * 60 * 24))

		return {
			days: days.toString().padStart(2, "0"),
			hours: hours.toString().padStart(2, "0"),
			minutes: minutes.toString().padStart(2, "0"),
			seconds: seconds.toString().padStart(2, "0"),
		}
	}

	onMount(() => {
		const html = document.documentElement
		const wasDark = html.classList.contains("dark")
		html.classList.remove("dark")

		if (data.error) {
			alert(data.error)
		}
		hasaccessToken =
			document.cookie.split("; ").find(row => row.startsWith("slack_id=")) !==
			undefined

		authUrl =
			PUBLIC_TURNED_OFF !== "false"
				? `./turned-off`
				: hasaccessToken
					? `./dashboard`
					: `/auth`
		fetch("/rsvp")
			.then(res => res.json())
			.then(data => (rsvpCount = data.count))

		fetch("/api/shop/items")
			.then(response => {
				if (!response.ok) {
					throw new Error(
						`Shop items request failed with status ${response.status}`
					)
				}
				return response.json()
			})
			.then(items => (shopItems = items))
			.catch(error => {
				console.error("Failed to load homepage shop items", error)
				shopItemsError = true
			})

		referUrl =
			PUBLIC_TURNED_OFF !== "false"
				? `./turned-off`
				: hasaccessToken
					? `./refer`
					: `/auth`
		fetch("/rsvp")
			.then(res => res.json())
			.then(data => (rsvpCount = data.count))

		return () => {
			if (wasDark) html.classList.add("dark")
		}
	})
</script>

<header
	class="fixed inset-x-0 top-0 z-1000 h-16 pointer-events-none"
	id="site-header"
>
	<div class="h-full max-w-full flex items-center justify-end px-10">
		<div class="flex-1"></div>
		<a
			href={authUrl}
			type="button"
			class="pointer-events-auto inline-flex items-center justify-center mt-5 mr-6 py-2.5 px-5 text-sm font-note font-semibold tracking-[0.03em] rounded-sm cursor-pointer bg-chart-3 text-foreground shadow-[0px_4px_0px_0px] shadow-chart-3/20 transition-all duration-300 ease-in-out hover:bg-chart-3/80 active:translate-y-[3px]"
			id="btn-header-oauth"
		>
			Sign in with Hack Club
		</a>
	</div>
</header>

<section
	id="hero"
	class="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background"
>
	<div class="absolute inset-0 pointer-events-none z-0">
		<div class="absolute inset-0 pointer-events-none z-0 bg-background"></div>
		<div class="absolute inset-0 pointer-events-none z-1">
			<div
				class="asset-slot top-[10%] left-0 w-80 h-[480px]"
				aria-hidden="true"
			></div>
			<div
				class="asset-slot top-[5%] right-0 w-[350px] h-[500px]"
				aria-hidden="true"
			></div>
		</div>
		<div class="absolute inset-0 pointer-events-none z-2">
			<div
				class="asset-slot top-[60px] left-20 size-30"
				aria-hidden="true"
			></div>
			<div
				class="asset-slot bottom-20 right-[100px] size-[140px]"
				aria-hidden="true"
			></div>
		</div>
	</div>

	<div
		class="relative z-2 w-full max-w-[1440px] mx-auto min-h-screen grid grid-cols-2 items-center gap-12 pt-[100px] px-12 pb-20"
	>
		<div class="flex flex-col items-start gap-5">
			<img
				src="assets/Alchemize.png"
				alt="Alchemize Logo"
				class="w-[440px] h-[130px] object-contain object-left -mb-8"
			/>

			<p
				class="max-w-[540px] text-[1.15rem] leading-[1.8] text-muted-foreground"
			>
				Make themed projects, get themed prizes! With more mixing this time!
			</p>

			<div class="flex flex-col items-start gap-4">
				<div
					class="flex items-stretch h-[52px] border-2 border-border rounded-sm overflow-hidden"
				>
					<input
						type="email"
						id="hero-email"
						class="w-[300px] px-5 text-[1rem] text-foreground bg-card/35 outline-none placeholder:text-muted-foreground/70"
						placeholder="you@example.com"
						aria-label="Email address"
					/>
					<a
						href={authUrl}
						type="button"
						class="inline-flex items-center justify-center px-7 text-lg tracking-[0.03em] cursor-pointer bg-chart-3 font-semibold text-foreground border-l-2 border-border transition-all duration-300 ease-[ease] hover:bg-chart-3/80 active:translate-y-[2px]"
						id="btn-sign-in">Sign In</a
					>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-center h-full">
			<div
				class="relative w-full max-w-[560px] h-[480px] flex items-center justify-center border-2 border-dashed border-border rounded-lg"
			>
				<div class="asset-slot relative size-full border-none">
					<img alt="pmix" src="/pmix_v2.png" />
				</div>
			</div>
		</div>
	</div>
</section>

<section
	id="how-it-works"
	class="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
>
	<div class="absolute inset-0 pointer-events-none z-0">
		<div class="absolute inset-0 pointer-events-none z-0 bg-background"></div>
		<div class="absolute inset-0 pointer-events-none z-1">
			<div
				class="asset-slot inset-0 size-full border-none"
				aria-hidden="true"
			></div>
		</div>
		<div class="absolute inset-0 pointer-events-none z-2">
			<div class="asset-slot top-10 right-10 size-45" aria-hidden="true"></div>
		</div>
	</div>

	<div class="relative z-2 w-full max-w-content mx-auto px-12 py-12">
		<h2
			class="font-heading text-[3rem] font-bold text-foreground text-center mb-3 tracking-[-0.02em]"
		>
			How does this work?
		</h2>
		<p class="text-[1.15rem] text-muted-foreground text-center mb-12">
			All about Alchemize!!!
		</p>

		<div class="relative max-w-[1100px] h-[1000px] mx-auto grid grid-rows-4">
			<svg
				class="absolute top-0 left-0 size-full pointer-events-none z-0"
				aria-hidden="true"
				viewBox="0 0 1100 1000"
				preserveAspectRatio="none"
			>
				<circle
					class="stroke-border"
					cx="550"
					cy="-80"
					r="280"
					fill="none"
					stroke-width="1"
					opacity="0.25"
				/>
				<circle
					class="stroke-border"
					cx="550"
					cy="-80"
					r="400"
					fill="none"
					stroke-width="1"
					opacity="0.15"
				/>
				<circle
					class="stroke-border"
					cx="550"
					cy="-80"
					r="520"
					fill="none"
					stroke-width="1"
					opacity="0.08"
				/>
			</svg>

			<div class="relative z-2 grid grid-cols-2 items-center gap-12 px-5">
				<div class="w-[380px] ml-auto text-left">
					<div class="flex items-center justify-start gap-3 mb-2">
						<span
							class="inline-flex shrink-0 items-center justify-center size-9 rounded-full bg-primary text-foreground font-extrabold text-[1rem]"
							>1</span
						>
						<h3 class="font-heading text-[1.35rem] font-bold text-foreground">
							Pick a Idea
						</h3>
					</div>
					<p
						class="text-[0.9rem] leading-[1.65] text-muted-foreground max-w-[360px]"
					>
						Got your own idea? Build it. Making something completely crazy. Just
						pick a project youre actually hyped to ship!!
					</p>
				</div>
				<div class="w-full h-[240px] pl-0 pr-6 flex justify-start">
					<img
						src="assets/step 1.png"
						alt="Step 1"
						class="max-h-full w-auto object-contain"
					/>
				</div>
			</div>

			<div class="relative z-2 grid grid-cols-2 items-center gap-12 px-5">
				<div class="w-full h-[240px] pl-6 pr-0 flex justify-end">
					<img
						src="assets/step_2.png"
						alt="Step 2 "
						class="max-h-full w-auto object-contain"
					/>
				</div>
				<div class="w-[380px] text-left">
					<div class="flex items-center justify-start gap-3 mb-2">
						<span
							class="inline-flex shrink-0 items-center justify-center size-9 rounded-full bg-primary text-foreground font-extrabold text-[1rem]"
							>2</span
						>
						<h3 class="font-heading text-[1.35rem] font-bold text-foreground">
							Build the Project
						</h3>
					</div>
					<p
						class="text-[0.9rem] leading-[1.65] text-muted-foreground max-w-[360px]"
					>
						Turn your idea into a real, working project. Code it, design it, and
						ship it-just remember to track your hours as you build.
					</p>
				</div>
			</div>

			<div class="relative z-2 grid grid-cols-2 items-center gap-12 px-5">
				<div class="w-[380px] ml-auto text-left">
					<div class="flex items-center justify-start gap-3 mb-2">
						<span
							class="inline-flex shrink-0 items-center justify-center size-9 rounded-full bg-primary text-foreground font-extrabold text-[1rem]"
							>3</span
						>
						<h3 class="font-heading text-[1.35rem] font-bold text-foreground">
							Submit It for Review
						</h3>
					</div>
					<p
						class="text-[0.9rem] leading-[1.65] text-muted-foreground max-w-[360px]"
					>
						Once your project is ready, submit it with a short description and a
						link to try it out. Our reviewers will check it and approve your
						hours.
					</p>
				</div>
				<div class="w-full h-[240px] pl-0 pr-6 flex justify-start">
					<img
						src="assets/step%203.png"
						alt="Step 3 Illustration"
						class="max-h-full w-auto object-contain"
					/>
				</div>
			</div>

			<div class="relative z-2 grid grid-cols-2 items-center gap-12 px-5">
				<div class="w-full h-[240px] pl-6 pr-0 flex justify-end">
					<img
						src="assets/step%204.png"
						alt="Step 4 Illustration"
						class="max-h-full w-auto object-contain"
					/>
				</div>
				<div class="w-[380px] text-left">
					<div class="flex items-center justify-start gap-3 mb-2">
						<span
							class="inline-flex shrink-0 items-center justify-center size-9 rounded-full bg-primary text-foreground font-extrabold text-[1rem]"
							>4</span
						>
						<h3 class="font-heading text-[1.35rem] font-bold text-foreground">
							Spend Your Potion
						</h3>
					</div>
					<p
						class="text-[0.9rem] leading-[1.65] text-muted-foreground max-w-[360px]"
					>
						Every approved hour fills your potion. Spend it in the shop on
						amazing rewards like hardware, tools and licenses to help your next
						project.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<section
	id="projects"
	class="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
>
	<div class="absolute inset-0 pointer-events-none z-0">
		<div class="absolute inset-0 pointer-events-none z-0 bg-background"></div>
		<div class="absolute inset-0 pointer-events-none z-1">
			<div
				class="asset-slot inset-0 size-full border-none"
				aria-hidden="true"
			></div>
		</div>
		<div class="absolute inset-0 pointer-events-none z-2">
			<div class="asset-slot bottom-0 left-0 size-50" aria-hidden="true">
				<!-- SVG/PNG: bottom-left vine -->
			</div>
			<div class="asset-slot top-10 right-10 w-40 h-60" aria-hidden="true">
				<!-- SVG/PNG: top-right potion bottle -->
			</div>
		</div>
	</div>

	<div class="relative z-2 w-full max-w-content mx-auto px-12 py-[60px]">
		<div class="flex items-center justify-center mb-12">
			<h2
				class="font-heading text-[3rem] font-bold text-foreground text-center mb-3 tracking-[-0.02em]"
			>
				What Hack Clubbers Made
			</h2>
			<div
				class="asset-slot relative inline-flex w-20 h-10 ml-3"
				aria-hidden="true"
			>
				<!-- SVG/PNG: heading decoration -->
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-6 gap-6">
			<!-- 1. LibrePods (Top row, span 3 cols) -->
			<a
				href="https://github.com/librepods-org/librepods"
				target="_blank"
				rel="noreferrer"
				class="group md:col-span-3 flex flex-col overflow-hidden bg-card border-2 border-primary rounded-md transition-all duration-500 ease-out hover:-translate-y-2 hover:border-primary"
			>
				<div
					class="relative w-full aspect-video flex items-center justify-center bg-background/50 border-b-2 border-primary transition-colors duration-500 group-hover:border-primary group-hover:bg-background/60"
				>
					<img
						src="https://crescent.hackclub.com/vite/assets/librepods-BU-zFwYq.webp"
						alt="LibrePods"
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="px-5 py-5 flex flex-col flex-1 bg-foreground/50">
					<h3
						class="font-heading text-[1.2rem] font-bold mb-1.5 text-foreground"
					>
						LibrePods
					</h3>
					<p class="text-[0.9rem] text-muted-foreground leading-[1.5] mb-4">
						AirPods off Apple's leash: noise control, ear detection and battery
						on Android and Linux.
					</p>
					<div class="flex items-center justify-between mt-auto">
						<span class="text-[0.8rem] text-primary font-semibold"
							>@kavishdevar</span
						>
						<span
							class="text-[0.7rem] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
							>Kotlin</span
						>
					</div>
				</div>
			</a>

			<!-- 2. Specter (Top row, span 3 cols) -->
			<a
				href="https://shaaarkai.itch.io/specter"
				target="_blank"
				rel="noreferrer"
				class="group md:col-span-3 flex flex-col overflow-hidden bg-card border-2 border-primary rounded-md transition-all duration-500 ease-out hover:-translate-y-2 hover:border-primary"
			>
				<div
					class="relative w-full aspect-video flex items-center justify-center bg-background/50 border-b-2 border-primary transition-colors duration-500 group-hover:border-primary group-hover:bg-background/60"
				>
					<img
						src="https://crescent.hackclub.com/vite/assets/specter-BHuwe-eU.webp"
						alt="Specter"
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="px-5 py-5 flex flex-col flex-1 bg-foreground/50">
					<h3
						class="font-heading text-[1.2rem] font-bold mb-1.5 text-foreground"
					>
						Specter
					</h3>
					<p class="text-[0.9rem] text-muted-foreground leading-[1.5] mb-4">
						A platformer where the run you just failed comes back as a ghost,
						and helping it is how you finish the level.
					</p>
					<div class="flex items-center justify-between mt-auto">
						<span class="text-[0.8rem] text-primary font-semibold"
							>@ayessaaa</span
						>
						<span
							class="text-[0.7rem] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
							>GDScript</span
						>
					</div>
				</div>
			</a>

			<!-- 3. VERT (Bottom row, span 2 cols) -->
			<a
				href="https://vert.sh"
				target="_blank"
				rel="noreferrer"
				class="group md:col-span-2 flex flex-col overflow-hidden bg-card border-2 border-primary rounded-md transition-all duration-500 ease-out hover:-translate-y-2 hover:border-primary"
			>
				<div
					class="relative w-full aspect-video flex items-center justify-center bg-background/50 border-b-2 border-primary transition-colors duration-500 group-hover:border-primary group-hover:bg-background/60"
				>
					<img
						src="https://crescent.hackclub.com/vite/assets/vert-D90femPm.webp"
						alt="VERT"
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="px-4 py-4 flex flex-col flex-1 bg-foreground/50">
					<h3 class="font-heading text-[1.1rem] font-bold mb-1 text-foreground">
						VERT
					</h3>
					<p
						class="text-[0.8rem] text-muted-foreground leading-[1.5] mb-3 line-clamp-3"
					>
						A file converter for images, audio and documents that does the work
						in your own browser rather than on somebody's server.
					</p>
					<div class="flex items-center justify-between mt-auto">
						<span
							class="text-[0.75rem] text-primary font-semibold truncate max-w-[80px]"
							>@JovannMC</span
						>
						<span
							class="text-[0.65rem] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
							>Svelte</span
						>
					</div>
				</div>
			</a>

			<!-- 4. Blind Defusal (Bottom row, span 2 cols) -->
			<a
				href="https://blind-defusal.jayx2u.fyi"
				target="_blank"
				rel="noreferrer"
				class="group md:col-span-2 flex flex-col overflow-hidden bg-card border-2 border-primary rounded-md transition-all duration-500 ease-out hover:-translate-y-2 hover:border-primary"
			>
				<div
					class="relative w-full aspect-video flex items-center justify-center bg-background/50 border-b-2 border-primary transition-colors duration-500 group-hover:border-primary group-hover:bg-background/60"
				>
					<img
						src="https://crescent.hackclub.com/vite/assets/blind-defusal-CgCv7Jns.webp"
						alt="Blind Defusal"
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="px-4 py-4 flex flex-col flex-1 bg-foreground/50">
					<h3
						class="font-heading text-[1.1rem] font-bold mb-1 text-foreground line-clamp-1"
					>
						Blind Defusal
					</h3>
					<p
						class="text-[0.8rem] text-muted-foreground leading-[1.5] mb-3 line-clamp-3"
					>
						A two-player bomb to defuse. One of you holds the box, the other
						holds the manual, and neither can see the other's half.
					</p>
					<div class="flex items-center justify-between mt-auto">
						<span
							class="text-[0.75rem] text-primary font-semibold truncate max-w-[80px]"
							>@Jayx2u</span
						>
						<span
							class="text-[0.65rem] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground"
							>Python</span
						>
					</div>
				</div>
			</a>

			<!-- 5. Angel Keyboard (Bottom row, span 2 cols) -->
			<a
				href="https://github.com/geg-tech/biblicallyaccuratekeyboard"
				target="_blank"
				rel="noreferrer"
				class="group md:col-span-2 flex flex-col overflow-hidden bg-card border-2 border-primary rounded-md transition-all duration-500 ease-out hover:-translate-y-2 hover:border-primary"
			>
				<div
					class="relative w-full aspect-video flex items-center justify-center bg-background/50 border-b-2 border-primary transition-colors duration-500 group-hover:border-primary group-hover:bg-background/60"
				>
					<img
						src="https://crescent.hackclub.com/vite/assets/angel-keyboard-DXV1reQP.webp"
						alt="Biblically Accurate Keyboard"
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="px-4 py-4 flex flex-col flex-1 bg-foreground/50">
					<h3
						class="font-heading text-[1.1rem] font-bold mb-1 text-foreground line-clamp-1"
						title="Biblically Accurate Keyboard"
					>
						Angel Keyboard
					</h3>
					<p
						class="text-[0.8rem] text-muted-foreground leading-[1.5] mb-3 line-clamp-3"
					>
						A keyboard in the shape of a biblically accurate angel. Be not
						afraid. CAD, PCBs and all.
					</p>
					<div class="flex items-center justify-between mt-auto">
						<span
							class="text-[0.75rem] text-primary font-semibold truncate max-w-[80px]"
							>@geg-tech</span
						>
						<span
							class="text-[0.65rem] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground"
							>Hardware</span
						>
					</div>
				</div>
			</a>
		</div>
	</div>
</section>

<section
	id="prizes"
	class="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
>
	<div class="absolute inset-0 pointer-events-none z-0">
		<div class="absolute inset-0 pointer-events-none z-0 bg-background"></div>
		<div class="absolute inset-0 pointer-events-none z-1">
			<div
				class="asset-slot inset-0 size-full border-none"
				aria-hidden="true"
			></div>
		</div>
		<div class="absolute inset-0 pointer-events-none z-2">
			<div class="asset-slot bottom-0 left-10 size-50" aria-hidden="true"></div>
		</div>
	</div>

	<div
		class="relative z-2 w-full max-w-content mx-auto px-12 pt-[60px] pb-10 flex flex-col items-center"
	>
		<h2
			class="font-heading text-[3rem] font-bold text-foreground text-center mb-3 tracking-[-0.02em]"
		>
			The Shop
		</h2>
		<p class="text-[1.15rem] text-muted-foreground text-center mb-12">
			Ship real projects. Earn real rewards.
		</p>

		<div
			class="group relative w-full overflow-hidden mt-8 py-4 border-2 border-border rounded-md"
			data-marquee
			aria-label="Prize items scrolling ribbon forward"
		>
			<div
				class="flex w-max animate-marquee will-change-transform group-hover:[animation-play-state:paused]"
				id="marquee-track-1"
				data-marquee-track
			>
				{#if shopItemsError}
					<p class="px-10 text-sm text-muted-foreground">
						Shop items are temporarily unavailable.
					</p>
				{:else}
					<div class="flex items-center gap-10 pr-10 shrink-0">
						{#each shopItems as item (item.itemID)}
							<div
								class="shrink-0 w-[180px] flex flex-col items-center gap-2.5"
							>
								<div
									class="relative w-[140px] h-[100px] flex items-center justify-center"
								>
									<img
										src={item.cdnImage}
										alt={item.name}
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<span
									class="text-[0.85rem] font-semibold text-muted-foreground text-center whitespace-nowrap"
									>{item.name}</span
								>
							</div>
						{/each}
					</div>
					<div
						class="flex items-center gap-10 pr-10 shrink-0"
						aria-hidden="true"
					>
						{#each shopItems as item (item.itemID)}
							<div
								class="shrink-0 w-[180px] flex flex-col items-center gap-2.5"
							>
								<div
									class="relative w-[140px] h-[100px] flex items-center justify-center"
								>
									<img
										src={item.cdnImage}
										alt={item.name}
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<span
									class="text-[0.85rem] font-semibold text-muted-foreground text-center whitespace-nowrap"
									>{item.name}</span
								>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div
			class="group relative w-full overflow-hidden mt-[calc(14px+1rem)] mb-12 py-4 border-2 border-border rounded-md"
			data-marquee
			aria-label="Prize items scrolling ribbon reverse"
		>
			<div
				class="flex w-max animate-marquee-reverse will-change-transform group-hover:[animation-play-state:paused]"
				id="marquee-track-2"
				data-marquee-track
			>
				{#if shopItemsError}
					<p class="px-10 text-sm text-muted-foreground">
						Shop items are temporarily unavailable.
					</p>
				{:else}
					<div class="flex items-center gap-10 pr-10 shrink-0">
						{#each shopItems as item (item.itemID)}
							<div
								class="shrink-0 w-[180px] flex flex-col items-center gap-2.5"
							>
								<div
									class="relative w-[140px] h-[100px] flex items-center justify-center"
								>
									<img
										src={item.cdnImage}
										alt={item.name}
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<span
									class="text-[0.85rem] font-semibold text-muted-foreground text-center whitespace-nowrap"
									>{item.name}</span
								>
							</div>
						{/each}
					</div>
					<div
						class="flex items-center gap-10 pr-10 shrink-0"
						aria-hidden="true"
					>
						{#each shopItems as item (item.itemID)}
							<div
								class="shrink-0 w-[180px] flex flex-col items-center gap-2.5"
							>
								<div
									class="relative w-[140px] h-[100px] flex items-center justify-center"
								>
									<img
										src={item.cdnImage}
										alt={item.name}
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<span
									class="text-[0.85rem] font-semibold text-muted-foreground text-center whitespace-nowrap"
									>{item.name}</span
								>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<section
	id="faq"
	class="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
>
	<div class="absolute inset-0 pointer-events-none z-0">
		<div class="absolute inset-0 pointer-events-none z-0 bg-background"></div>
		<div class="absolute inset-0 pointer-events-none z-1">
			<div
				class="asset-slot inset-0 size-full border-none"
				aria-hidden="true"
			></div>
		</div>
		<div class="absolute inset-0 pointer-events-none z-2">
			<div
				class="asset-slot top-1/2 left-5 w-25 h-75 -translate-y-1/2"
				aria-hidden="true"
			></div>
		</div>
	</div>

	<div class="relative z-2 w-full max-w-[820px] mx-auto px-12 py-20">
		<div class="text-center mb-12">
			<img
				src="assets/faq-title.svg"
				alt="Frequently Asked Questions"
				class="inline-block max-h-16 w-auto min-w-80 min-h-14 border-2 border-dashed border-border rounded-sm"
			/>
		</div>

		<div class="flex flex-col" id="faq-accordion">
			<div class="border-b-2 border-border first:border-t-2">
				<button
					class="group w-full flex items-center justify-between py-[22px] px-2 text-[1.1rem] font-semibold text-foreground text-left cursor-pointer transition-colors duration-300 ease-[ease] hover:text-primary"
					data-accordion-trigger
					aria-expanded="false"
					id="faq-btn-1"
					aria-controls="faq-panel-1"
				>
					<span>Who is eligible?</span>
					<span
						class="relative shrink-0 size-6 ml-5 before:absolute before:top-1/2 before:left-1/2 before:w-[18px] before:h-[3px] before:-translate-1/2 before:rounded-[2px] before:bg-primary before:transition-colors before:duration-300 after:absolute after:top-1/2 after:left-1/2 after:w-[3px] after:h-[18px] after:-translate-1/2 after:rounded-[2px] after:bg-primary after:transition-all after:duration-300 group-aria-expanded:before:bg-primary group-aria-expanded:after:bg-primary group-aria-expanded:after:rotate-90 group-aria-expanded:after:opacity-0"
						aria-hidden="true"
					></span>
				</button>
				<div
					class="max-h-0 overflow-hidden transition-[max-height,padding] duration-400 ease-[ease]"
					id="faq-panel-1"
					role="region"
					aria-labelledby="faq-btn-1"
				>
					<p
						class="px-2 pb-6 text-[0.95rem] leading-[1.75] text-muted-foreground"
					>
						Anyone aged 13 through 18! Everyone from all over the world can
						participate.
					</p>
				</div>
			</div>

			<div class="border-b-2 border-border first:border-t-2">
				<button
					class="group w-full flex items-center justify-between py-[22px] px-2 text-[1.1rem] font-semibold text-foreground text-left cursor-pointer transition-colors duration-300 ease-[ease] hover:text-primary"
					data-accordion-trigger
					aria-expanded="false"
					id="faq-btn-2"
					aria-controls="faq-panel-2"
				>
					<span>Is this free/legit?</span>
					<span
						class="relative shrink-0 size-6 ml-5 before:absolute before:top-1/2 before:left-1/2 before:w-[18px] before:h-[3px] before:-translate-1/2 before:rounded-[2px] before:bg-primary before:transition-colors before:duration-300 after:absolute after:top-1/2 after:left-1/2 after:w-[3px] after:h-[18px] after:-translate-1/2 after:rounded-[2px] after:bg-primary after:transition-all after:duration-300 group-aria-expanded:before:bg-primary group-aria-expanded:after:bg-primary group-aria-expanded:after:rotate-90 group-aria-expanded:after:opacity-0"
						aria-hidden="true"
					></span>
				</button>
				<div
					class="max-h-0 overflow-hidden transition-[max-height,padding] duration-400 ease-[ease]"
					id="faq-panel-2"
					role="region"
					aria-labelledby="faq-btn-2"
				>
					<p
						class="px-2 pb-6 text-[0.95rem] leading-[1.75] text-muted-foreground"
					>
						Yeah! Hack Club is a 501(c)(3) non-profit, with donations from
						donors like Michael Dell and Tom Preston-Werner covering all of the
						prizes! We also ran programs like High Seas, Summer of Making,
						Flavortown in the past.
					</p>
				</div>
			</div>

			<div class="border-b-2 border-border first:border-t-2">
				<button
					class="group w-full flex items-center justify-between py-[22px] px-2 text-[1.1rem] font-semibold text-foreground text-left cursor-pointer transition-colors duration-300 ease-[ease] hover:text-primary"
					data-accordion-trigger
					aria-expanded="false"
					id="faq-btn-3"
					aria-controls="faq-panel-3"
				>
					<span>What types of projects count?</span>
					<span
						class="relative shrink-0 size-6 ml-5 before:absolute before:top-1/2 before:left-1/2 before:w-[18px] before:h-[3px] before:-translate-1/2 before:rounded-[2px] before:bg-primary before:transition-colors before:duration-300 after:absolute after:top-1/2 after:left-1/2 after:w-[3px] after:h-[18px] after:-translate-1/2 after:rounded-[2px] after:bg-primary after:transition-all after:duration-300 group-aria-expanded:before:bg-primary group-aria-expanded:after:bg-primary group-aria-expanded:after:rotate-90 group-aria-expanded:after:opacity-0"
						aria-hidden="true"
					></span>
				</button>
				<div
					class="max-h-0 overflow-hidden transition-[max-height,padding] duration-400 ease-[ease]"
					id="faq-panel-3"
					role="region"
					aria-labelledby="faq-btn-3"
				>
					<p
						class="px-2 pb-6 text-[0.95rem] leading-[1.75] text-muted-foreground"
					>
						All kinds of technical projects, as long as they’re open-source!
						(Note: We don't support hardware projects just yet.)
					</p>
				</div>
			</div>

			<div class="border-b-2 border-border first:border-t-2">
				<button
					class="group w-full flex items-center justify-between py-[22px] px-2 text-[1.1rem] font-semibold text-foreground text-left cursor-pointer transition-colors duration-300 ease-[ease] hover:text-primary"
					data-accordion-trigger
					aria-expanded="false"
					id="faq-btn-4"
					aria-controls="faq-panel-4"
				>
					<span>Duis aute irure dolor in reprehenderit?</span>
					<span
						class="relative shrink-0 size-6 ml-5 before:absolute before:top-1/2 before:left-1/2 before:w-[18px] before:h-[3px] before:-translate-1/2 before:rounded-[2px] before:bg-primary before:transition-colors before:duration-300 after:absolute after:top-1/2 after:left-1/2 after:w-[3px] after:h-[18px] after:-translate-1/2 after:rounded-[2px] after:bg-primary after:transition-all after:duration-300 group-aria-expanded:before:bg-primary group-aria-expanded:after:bg-primary group-aria-expanded:after:rotate-90 group-aria-expanded:after:opacity-0"
						aria-hidden="true"
					></span>
				</button>
				<div
					class="max-h-0 overflow-hidden transition-[max-height,padding] duration-400 ease-[ease]"
					id="faq-panel-4"
					role="region"
					aria-labelledby="faq-btn-4"
				>
					<p
						class="px-2 pb-6 text-[0.95rem] leading-[1.75] text-muted-foreground"
					>
						At vero eos et accusamus et iusto odio dignissimos ducimus qui
						blanditiis praesentium voluptatum deleniti atque corrupti quos
						dolores et quas molestias excepturi sint occaecati cupiditate non
						provident.
					</p>
				</div>
			</div>

			<div class="border-b-2 border-border first:border-t-2">
				<button
					class="group w-full flex items-center justify-between py-[22px] px-2 text-[1.1rem] font-semibold text-foreground text-left cursor-pointer transition-colors duration-300 ease-[ease] hover:text-primary"
					data-accordion-trigger
					aria-expanded="false"
					id="faq-btn-5"
					aria-controls="faq-panel-5"
				>
					<span>Excepteur sint occaecat cupidatat?</span>
					<span
						class="relative shrink-0 size-6 ml-5 before:absolute before:top-1/2 before:left-1/2 before:w-[18px] before:h-[3px] before:-translate-1/2 before:rounded-[2px] before:bg-primary before:transition-colors before:duration-300 after:absolute after:top-1/2 after:left-1/2 after:w-[3px] after:h-[18px] after:-translate-1/2 after:rounded-[2px] after:bg-primary after:transition-all after:duration-300 group-aria-expanded:before:bg-primary group-aria-expanded:after:bg-primary group-aria-expanded:after:rotate-90 group-aria-expanded:after:opacity-0"
						aria-hidden="true"
					></span>
				</button>
				<div
					class="max-h-0 overflow-hidden transition-[max-height,padding] duration-400 ease-[ease]"
					id="faq-panel-5"
					role="region"
					aria-labelledby="faq-btn-5"
				>
					<p
						class="px-2 pb-6 text-[0.95rem] leading-[1.75] text-muted-foreground"
					>
						Similique sunt in culpa qui officia deserunt mollitia animi, id est
						laborum et dolorum fuga. Et harum quidem rerum facilis est et
						expedita distinctio.
					</p>
				</div>
			</div>

			<div class="border-b-2 border-border first:border-t-2">
				<button
					class="group w-full flex items-center justify-between py-[22px] px-2 text-[1.1rem] font-semibold text-foreground text-left cursor-pointer transition-colors duration-300 ease-[ease] hover:text-primary"
					data-accordion-trigger
					aria-expanded="false"
					id="faq-btn-6"
					aria-controls="faq-panel-6"
				>
					<span>Sunt in culpa qui officia deserunt?</span>
					<span
						class="relative shrink-0 size-6 ml-5 before:absolute before:top-1/2 before:left-1/2 before:w-[18px] before:h-[3px] before:-translate-1/2 before:rounded-[2px] before:bg-primary before:transition-colors before:duration-300 after:absolute after:top-1/2 after:left-1/2 after:w-[3px] after:h-[18px] after:-translate-1/2 after:rounded-[2px] after:bg-primary after:transition-all after:duration-300 group-aria-expanded:before:bg-primary group-aria-expanded:after:bg-primary group-aria-expanded:after:rotate-90 group-aria-expanded:after:opacity-0"
						aria-hidden="true"
					></span>
				</button>
				<div
					class="max-h-0 overflow-hidden transition-[max-height,padding] duration-400 ease-[ease]"
					id="faq-panel-6"
					role="region"
					aria-labelledby="faq-btn-6"
				>
					<p
						class="px-2 pb-6 text-[0.95rem] leading-[1.75] text-muted-foreground"
					>
						Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
						impedit quo minus id quod maxime placeat facere possimus, omnis
						voluptas assumenda est.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<footer class="bg-background border-t-3 border-border pt-16 px-12" id="footer">
	<div
		class="max-w-content mx-auto flex justify-between items-start gap-12 pb-12"
	>
		<div class="flex flex-col gap-3">
			<img
				src="assets/Alchemize.png"
				alt="Alchemize Logo"
				class="w-[240px] h-16 object-contain object-left -mb-3"
			/>
			<p class="text-[0.82rem] leading-[1.65] text-muted-foreground max-w-80">
				A Hack Club program. Hack Club is a 501(c)(3) non-profit with a network
				of more than 100,000 teenagers in 119 countries, all of them learning by
				shipping.
			</p>
		</div>

		<nav
			class="grid grid-cols-[repeat(3,auto)] gap-14"
			aria-label="Footer navigation"
		>
			<div>
				<h4
					class="text-[0.75rem] font-extrabold tracking-[0.12em] uppercase text-primary mb-5"
				>
					ALCHEMIZE
				</h4>
				<ul class="*:mb-3">
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="#how-it-works">How it works</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="#prizes">The shop</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="#projects">Explore projects</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="#">The handbook</a
						>
					</li>
				</ul>
			</div>

			<div>
				<h4
					class="text-[0.75rem] font-extrabold tracking-[0.12em] uppercase text-primary mb-5"
				>
					HACK CLUB
				</h4>
				<ul class="*:mb-3">
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="https://hackclub.com/philosophy"
							target="_blank"
							rel="noopener">Philosophy</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="https://hackclub.com/team"
							target="_blank"
							rel="noopener">Team</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="https://hackclub.com/donate"
							target="_blank"
							rel="noopener">Donate</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="https://hackclub.com/brand"
							target="_blank"
							rel="noopener">Branding</a
						>
					</li>
				</ul>
			</div>

			<div>
				<h4
					class="text-[0.75rem] font-extrabold tracking-[0.12em] uppercase text-primary mb-5"
				>
					HELP
				</h4>
				<ul class="*:mb-3">
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="https://hackclub.com/slack"
							target="_blank"
							rel="noopener">#alchemize-help on Slack</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="mailto:identity@hackclub.com">identity@hackclub.com</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="#">Fulfilment bounty</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="https://hackclub.com/conduct"
							target="_blank"
							rel="noopener">Code of conduct</a
						>
					</li>
					<li>
						<a
							class="text-[0.9rem] text-muted-foreground transition-colors duration-300 ease-[ease] hover:text-foreground"
							href="https://hackclub.com/privacy"
							target="_blank"
							rel="noopener">Privacy &amp; terms</a
						>
					</li>
				</ul>
			</div>
		</nav>
	</div>

	<div class="max-w-content mx-auto py-6 border-t border-border text-center">
		<p class="text-[0.8rem] text-muted-foreground tracking-[0.02em]">
			&copy; 2026 Hack Club. Made by teenagers, mostly at night.
		</p>
	</div>
</footer>

<svelte:head>
	<script
		src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"
	></script>
	<script src="/js/main.js" defer></script>
</svelte:head>
