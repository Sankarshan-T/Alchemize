<script lang="ts">
	import {
		ArrowDown,
		Blocks,
		ChevronsRight,
		FlaskConical,
		Rocket,
		ShoppingCart,
		LoaderCircleIcon,
	} from "lucide-svelte"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import {
		PUBLIC_HACKCLUB_AUTH,
		PUBLIC_HACKCLUB_REDIRECT,
		PUBLIC_TURNED_OFF,
	} from "$env/static/public"
	import { scopes } from "$lib/utils"
	import Accordion from "$lib/components/accordion.svelte"
	import { CircleCheck, ShoppingBag } from "@lucide/svelte"
	import Button from "$lib/components/ui/button/button.svelte"

	let { data } = $props()
	let rsvpCount: number | "Fetching" = $state("Fetching")
	let showRotator = $state(false)
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
				? `./dashboard`
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

		referUrl =
			PUBLIC_TURNED_OFF !== "false"
				? `./turned-off`
				: hasaccessToken
					? `./refer`
					: `/auth`
		fetch("/rsvp")
			.then(res => res.json())
			.then(data => (rsvpCount = data.count))
	})
</script>

<div class="relative min-h-screen w-full overflow-x-hidden">
	<div
		class="absolute top-3 left-0 z-50 transition-transform duration-100 hover:scale-[1.02]"
	>
		<a href="https://hackclub.com/">
			<img
				class="w-24 md:w-40 bg-transparent p-1 rounded-md"
				src="https://assets.hackclub.com/banners/2026.svg"
				alt="Hack Club"
			/>
		</a>
	</div>
	<nav
		class="fixed top-2 right-2 py-3 px-8 text-sm text-secondary-foreground font-display font-semibold bg-secondary backdrop-blur-sm border border-border rounded-tl-2xl rounded-br-2xl rounded-md flex items-center gap-3 z-100 hover:border-primary divide-x shadow-sm shadow-foreground"
	>
		<a
			href="/#"
			class="relative cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pr-2"
		>
			Home
		</a>
		<a
			href="#features"
			class="relative cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pr-2"
		>
			Features
		</a>
		<a
			href="#themes"
			class="relative cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pr-2"
		>
			Themes
		</a>
		<a
			href="#faq"
			class="relative cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full pr-2"
		>
			Faq
		</a>
	</nav>

	<div
		class="fixed inset-0 z-[-1] bg-[url('/bg-pattern-outline.png')] bg-contain bg-scale scale-103"
	></div>
	<div class="fixed inset-0 z-0 bg-background/90 bg-contain bg-scale"></div>
	<main class="relative w-full px-4 sm:px-6 md:px-10">
		<section
			class="flex flex-col items-center justify-center min-h-screen pt-24 pb-12 gap-y-7 relative"
		>
			<div class="flex flex-col items-center gap-2">
				<div
					class="flex items-center gap-2 text-sm font-decor text-foreground tracking-[0.3em] uppercase"
				>
					<CircleCheck class="h-3 w-3" />
					<span>Season 1 -</span>

					<LoaderCircleIcon class="animate-spin h-3 w-3" />
					<span>Season 2</span>
				</div>
				<h1
					class="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black font-decor tracking-tighter uppercase text-foreground text-shadow-xs text-shadow-primary hover:text-shadow-lg transition-all select-none break-all sm:break-normal"
				>
					ALCHEMIZE
				</h1>
				<h3
					class="text-xl font-bold font-display tracking-tighter text-foreground text-shadow-xs text-shadow-primary selection:bg-primary selection:text-black pointer-events-none select-none break-all sm:break-normal"
				>
					With more mixing this time
				</h3>
				<span class="mt-2 font-display font-semibold tracking-wider">
					Starts form 8th August
				</span>
				<div class="p-3 w-full flex items-center justify-center gap-3">
					<a href={authUrl}>
						<Button
							variant="primary"
							class="p-6 w-full text-xl justify-between flex"
						>
							<p>Get Started</p>
							{#if showRotator}
								<LoaderCircleIcon class="animate-spin" />
							{:else}
								<ChevronsRight />
							{/if}
						</Button>
					</a>
					<a href="/shop">
						<Button variant="secondary" class="py-6">
							<ShoppingCart class="size-8" />
						</Button>
					</a>
				</div>
			</div>

			<a
				href="#features"
				class="animate-bounce border border-border p-2 hover:border-primary bg-secondary transition-colors rounded-full"
			>
				<ArrowDown class="w-5 h-5 text-foreground" />
			</a>
		</section>

		<section
			id="features"
			class="flex flex-col gap-12 py-18 min-h-screen border-t-2 border-border relative items-center justify-center"
		>
			<h2 class="text-5xl font-note tracking-tight uppercase text-foreground">
				HOW IT WORKS
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
				<div
					class="h-full flex flex-col gap-2 bg-card border-2 border-border p-5 rounded-md transition-all hover:-translate-x-px hover:-translate-y-px rounded-tl-2xl rounded-br-2xl rounded-md hover:shadow-md shadow-sm shadow-primary"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-border bg-secondary/20 text-foreground transition-colors rounded-md"
						>
							<Blocks class="h-7 w-7" />
						</div>
						<h3
							class="text-2xl font-black font-display uppercase tracking-tight text-foreground"
						>
							01 - Create
						</h3>
					</div>
					<p class="text-muted-foreground font-body text-sm leading-relaxed">
						Pick a theme (Endless, No Internet, or Indie Gamedev) and track
						hours via Hackatime.
					</p>
				</div>
				<div
					class="h-full flex flex-col gap-2 bg-card border-2 border-border p-5 rounded-md transition-all hover:-translate-x-px hover:-translate-y-px rounded-tl-2xl rounded-br-2xl rounded-md hover:shadow-md shadow-sm shadow-primary"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-border bg-secondary/20 text-foreground transition-colors rounded-md"
						>
							<Rocket class="h-7 w-7" />
						</div>
						<h3
							class="text-2xl font-black font-display uppercase tracking-tight text-foreground"
						>
							02 - Ship
						</h3>
					</div>
					<p class="text-muted-foreground font-body text-sm leading-relaxed">
						Submit your project for review by the Alchinspectors to earn theme
						stones.
					</p>
				</div>

				<div
					class="h-full flex flex-col gap-2 bg-card border-2 border-border p-5 rounded-md transition-all hover:-translate-x-px hover:-translate-y-px rounded-tl-2xl rounded-br-2xl rounded-md hover:shadow-md shadow-sm shadow-primary"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-border bg-secondary/20 text-foreground transition-colors rounded-md"
						>
							<FlaskConical class="h-7 w-7" />
						</div>
						<h3
							class="text-2xl font-black font-display uppercase tracking-tight text-foreground"
						>
							03 - Trade
						</h3>
					</div>
					<p class="text-muted-foreground font-body text-sm leading-relaxed">
						Trade your awesome theme based stones (redstone, glowstone and
						aqua-regia) to get potion mix!
					</p>
				</div>
				<div
					class="h-full flex flex-col gap-2 bg-card border-2 border-border p-5 rounded-md transition-all hover:-translate-x-px hover:-translate-y-px rounded-tl-2xl rounded-br-2xl rounded-md hover:shadow-md shadow-sm shadow-primary"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-border bg-secondary/20 text-foreground transition-colors rounded-md"
						>
							<ShoppingCart class="h-7 w-7" />
						</div>
						<h3
							class="text-2xl font-black font-display uppercase tracking-tight text-foreground"
						>
							04 - Spend!
						</h3>
					</div>
					<p class="text-muted-foreground font-body text-sm leading-relaxed">
						Spend your precious stones and potion mix on rewards. New items are
						added frequently!
					</p>
				</div>
			</div>
		</section>

		<section
			id="themes"
			class="flex flex-col items-center gap-12 py-24 min-h-screen border-t-2 border-border relative"
		>
			<h2 class="text-5xl font-note tracking-tight uppercase text-foreground">
				Themes for Season 2
			</h2>

			<div class="grid grid-cols-2 gap-4 w-full">
				<div
					class="w-full flex flex-col bg-card border-2 border-border rounded-md p-5 gap-4 transition hover:-translate-x-px hover:-translate-y-px hover:shadow-md shadow-sm shadow-primary rounded-tl-2xl rounded-br-2xl rounded-md"
				>
					<h3
						class="text-xl font-display font-black uppercase tracking-tight text-card-foreground"
					>
						1. Bots
					</h3>
					<p
						class="text-card-foreground text-xs font-body leading-relaxed font-mono"
					>
						Make a bot! Can be anything from a discord bot or a chatbot to a
						crazy robot or an autonomous drone.
					</p>
					<p
						class="flex gap-2 text-foreground text-xs font-body font-medium leading-relaxed font-mono"
					>
						Rewards: Redstone
						<img src="/alch-redstone.png" alt="" class="h-6 object-contain" />
					</p>
				</div>
				<div
					class="w-full flex flex-col bg-card border-2 border-border rounded-md p-5 gap-4 transition hover:-translate-x-px hover:-translate-y-px hover:shadow-md shadow-sm shadow-primary rounded-tl-2xl rounded-br-2xl rounded-md"
				>
					<h3
						class="text-xl font-display font-black uppercase tracking-tight text-card-foreground"
					>
						2. Co-Op
					</h3>
					<p
						class="text-card-foreground text-xs font-body leading-relaxed font-mono"
					>
						Create a project with that involves <strong>team play</strong>...
						could be literally anything multiplayer! Like maybe a multiplayer
						tic-tac-toe game or a simple collaborative canvas or even a pair of
						walkie talkies.
					</p>
					<p
						class="flex gap-2 text-foreground text-xs font-body font-medium leading-relaxed font-mono"
					>
						Rewards: Glowstone
						<img src="/alch-glowstone.png" alt="" class="h-6 object-contain" />
					</p>
				</div>
				<div
					class="col-span-2 justify-self-center w-1/2 flex flex-col bg-card border-2 border-border rounded-md p-5 gap-4 transition hover:-translate-x-px hover:-translate-y-px rounded-tl-2xl rounded-br-2xl rounded-md hover:shadow-md shadow-sm shadow-primary"
				>
					<h3
						class="text-xl font-display font-black uppercase tracking-tight text-card-foreground"
					>
						3. ElectroArt
					</h3>
					<p
						class="text-card-foreground text-xs font-body leading-relaxed font-mono"
					>
						Make something by which your code returns art. Like a dynamic
						website creating various patterns, or a strip of leds blinking in a
						specific order and colors. It could be something cooler!
					</p>
					<p
						class="flex gap-2 text-foreground text-xs font-body font-medium leading-relaxed font-mono"
					>
						Rewards: Aquaregia
						<img src="/alch-aquaregia.png" alt="" class="h-6 object-contain" />
					</p>
				</div>
			</div>
		</section>

		<section
			id="faq"
			class="flex flex-col items-center gap-12 py-24 border-t-2 border-border relative"
		>
			<h2 class="text-3xl font-black tracking-tight uppercase text-foreground">
				FAQ
			</h2>

			<div class="flex flex-col gap-3 w-full max-w-4xl mx-auto">
				<Accordion
					Title="What is a 'ship'?"
					Content="A 'ship' is the project you submit to this event. You can ship any general project or a project related to one of the themes"
				/>
				<Accordion
					Title="Who is Eligible?"
					Content="Anyone ages 13-18 who isn't banned from Hack Club can participate."
				/>
				<Accordion
					Title="How is time tracked?"
					Content="Software development time is tracked using <a class='text-foreground p-1 font-semibold hover:bg-primary/60 transition rounded hover:text-foreground' target='_blank' href='hackatime.hackclub.com'>Hackatime</a> and hardware time is tracked through <a class='text-foreground p-1 hover:bg-primary/60 transition font-semibold rounded hover:text-foreground' target='_blank' href='lapse.hackclub.com'>Lapse</a>"
				/>
				<Accordion
					Title="Where can I find more information?"
					Content="If you have any questions or need help with anything, just join the <a class='text-foreground p-1 hover:bg-primary/60 font-semibold transition rounded hover:text-foreground' target='_blank' href='https://hackclub.enterprise.slack.com/archives/C0ASY6R552R'>#alchemize-help</a> channel in the Hack Club Slack! You can ask for help there, and the community will be happy to assist you. "
				/>
			</div>
		</section>
	</main>

	<footer
		class="w-full border-t-2 border-border bg-secondary/50 relative z-20 mt-24 py-16"
	>
		<div
			class="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-12 justify-between items-start"
		>
			<div class="flex flex-col gap-2 max-w-xs">
				<h3
					class="text-xl font-black font-decor text-foreground tracking-wide uppercase"
				>
					Hack Club
				</h3>
				<p class="text-muted-foreground font-display text-xs leading-relaxed">
					Hack Club is the world’s largest nonprofit movement of teenagers
					making cool projects.
				</p>
			</div>

			<div
				class="grid grid-cols-2 gap-x-16 gap-y-8 text-xs font-bold uppercase tracking-wider font-decor"
			>
				<div class="flex flex-col gap-3">
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://hackclub.com/philosophy/">Philosophy</a
					>
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://hackclub.com/team/">The Team</a
					>
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://hackclub.com/brand/">Branding</a
					>
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://hackclub.com/philanthropy/">Philanthropy</a
					>
				</div>
				<div class="flex flex-col gap-3">
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://hackclub.com/jams/">Jams</a
					>
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://toolbox.hackclub.com/">Toolbox</a
					>
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://hackclub.com/conduct/">Code of Conduct</a
					>
					<a
						class="text-muted-foreground hover:text-foreground transition-colors"
						href="https://hackclub.com/privacy/">Privacy</a
					>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	main {
		transform: translateZ(0);
	}
</style>
