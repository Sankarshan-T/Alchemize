<script lang="ts">
	import {
		ArrowDown,
		Blocks,
		ChevronsRight,
		FlaskConical,
		Rocket,
		ShoppingCart,
		X,
		Newspaper,
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
	import { CircleCheck, ShoppingBag, User } from "@lucide/svelte"

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
				: `https://auth.hackclub.com/oauth/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${uri}`
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
					: `https://auth.hackclub.com/oauth/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${uri}`
		fetch("/rsvp")
			.then(res => res.json())
			.then(data => (rsvpCount = data.count))

		referUrl =
			PUBLIC_TURNED_OFF !== "false"
				? `./turned-off`
				: hasaccessToken
					? `./refer`
					: `https://auth.hackclub.com/oauth/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${uri}`
		fetch("/rsvp")
			.then(res => res.json())
			.then(data => (rsvpCount = data.count))
	})
</script>

<div
	class="relative min-h-screen w-full bg-gradbg text-zinc-100 font-mono tracking-wide selection:bg-primary selection:text-primary-foreground overflow-x-hidden"
>
	<div class="fixed inset-0 bg-black/40 z-0 pointer-events-none"></div>

	<div
		class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-80"
	></div>

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

	<main class="z-10 relative w-full px-4 sm:px-6 md:px-10">
		<section
			class="flex flex-col items-center justify-center min-h-screen pt-24 pb-12 gap-y-7 relative"
		>
			<div class="flex flex-col items-center gap-2">
				<div
					class="flex items-center gap-2 text-xs font-bold text-white tracking-[0.3em] uppercase"
				>
					<CircleCheck class="h-3 w-3" />
					<span>Season 1 -</span>

					<LoaderCircleIcon class="animate-spin h-3 w-3" />
					<span>Season 2</span>
				</div>
				<h1
					class="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black font-alchemize tracking-tighter uppercase text-white [text-shadow:4px_4px_0px_rgba(var(--primary),0.15)] selection:bg-primary selection:text-black pointer-events-none select-none break-all sm:break-normal"
				>
					ALCHEMIZE
				</h1>
			</div>

			<a
				href="#features"
				class="animate-pulse border border-white p-2 hover:border-primary bg-primary/40 transition-colors rounded-full"
			>
				<ArrowDown class="w-5 h-5 text-white" />
			</a>
		</section>

		<section
			id="features"
			class="flex flex-col gap-12 py-18 min-h-screen border-t-2 border-border relative items-center justify-center"
		>
			<h2
				class="text-5xl font-black font-alchemize tracking-tight uppercase text-white"
			>
				HOW IT WORKS
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
				<div
					class=" h-full flex flex-col gap-2 bg-black border-2 border-primary group-hover:border-primary/80 p-5 rounded-md transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-primary bg-background/60 bg-primary/20 text-primary transition-colors rounded-md"
						>
							<Blocks class="h-7 w-7" />
						</div>
						<h3 class="text-2xl font-black uppercase tracking-tight text-white">
							01 - Create
						</h3>
					</div>
					<p class="text-muted-foreground text-md leading-relaxed">
						Pick a theme (Endless, No Internet, or Indie Gamedev) and track
						hours via Hackatime.
					</p>
				</div>

				<div
					class=" h-full flex flex-col gap-2 bg-black border-2 border-primary group-hover:border-primary/80 p-5 rounded-md transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-primary bg-background/60 bg-primary/20 text-primary transition-colors rounded-md"
						>
							<Rocket class="h-7 w-7" />
						</div>
						<h3 class="text-2xl font-black uppercase tracking-tight text-white">
							02 - Ship
						</h3>
					</div>
					<p class="text-muted-foreground text-md leading-relaxed">
						Submit your project for review by the Alchinspectors to earn theme
						stones.
					</p>
				</div>

				<div
					class=" h-full flex flex-col gap-2 bg-black border-2 border-primary group-hover:border-primary/80 p-5 rounded-md transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-primary bg-primary/20 text-primary transition-colors rounded-md"
						>
							<FlaskConical class="h-7 w-7" />
						</div>
						<h3 class="text-2xl font-black uppercase tracking-tight text-white">
							03 - Trade
						</h3>
					</div>
					<p class="text-muted-foreground text-md leading-relaxed">
						Trade your awesome theme based stones (redstone, glowstone and
						aqua-regia) to get potion mix!
					</p>
				</div>

				<div
					class=" h-full flex flex-col gap-2 bg-black border-2 border-primary group-hover:border-primary/80 p-5 rounded-md transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
				>
					<div class="shrink-0 flex items-center gap-4 pt-1">
						<div
							class="p-2 border border-primary bg-background/60 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-md"
						>
							<ShoppingCart class="h-7 w-7" />
						</div>
						<h3 class="text-2xl font-black uppercase tracking-tight text-white">
							04 - Epic Shop
						</h3>
					</div>
					<p class="text-muted-foreground text-md leading-relaxed">
						Spend your precious stones and potion mix on rewards. New items are
						added frequently!
					</p>
				</div>
			</div>
		</section>

		<section
			id="themes"
			class="flex flex-col gap-12 py-24 min-h-screen border-t-2 border-border relative"
		>
			<h2
				class="text-3xl font-black font-alchemize tracking-tight uppercase text-white"
			>
				Themes for Season 2
			</h2>

			<div class="grid grid-cols-2 gap-4 w-full">
				<div
					class="w-full flex flex-col bg-black/95 border-2 border-primary rounded-md p-5 gap-4 transition-transform hover:-translate-x-px hover:-translate-y-px"
				>
					<h3
						class="text-xl font-black uppercase tracking-tight text-white font-alchemize"
					>
						1. Endless
					</h3>
					<div class="flex-1">
						<p class="text-muted-foreground text-xs leading-relaxed font-mono">
							Create a project with an infinite Canvas. It can be a game where
							levels generate endlessly(like pacman), It can be a paint app with
							infinite canvas, It can also be a scientific simulation which
							keeps on running indefinitely. It can be anything as long as it
							has an element of infinity to it(and it never ends).
						</p>
					</div>
				</div>

				<div
					class="relative w-full flex flex-col bg-black/95 border-2 border-primary rounded-md p-5 gap-4 transition-transform hover:-translate-x-px hover:-translate-y-px"
				>
					<h3
						class="text-xl font-black uppercase tracking-tight text-white font-alchemize"
					>
						2. Endless
					</h3>
					<div class="flex-1">
						<p class="text-muted-foreground text-xs leading-relaxed font-mono">
							Make something that works without an internet connection, No APIs,
							No CDNs, No fetching data from the internet, (and obviously no
							websites), it can be a game that doesn't require an internet
							connection, an app that uses Bluetooth to chat with friends, a
							robot that does something cool, anything as long as it works
							without internet.
						</p>
					</div>
				</div>

				<div
					class="col-span-2 justify-self-center w-1/2 flex flex-col bg-black/95 border-2 border-primary rounded-md p-5 gap-4 transition-transform hover:-translate-x-px hover:-translate-y-px"
				>
					<h3
						class="text-xl font-black uppercase tracking-tight text-white font-alchemize"
					>
						3. Endless
					</h3>
					<div class="flex-1">
						<p class="text-muted-foreground text-xs leading-relaxed font-mono">
							Make a game inspired by the indie game genre. It can be a
							platformer with a unique art style, a narrative-driven experience,
							a puzzle game with innovative mechanics, or anything else that
							captures the spirit of indie games. Create your own artstyles here
							that gives vibes of indie pixel art, hand drawn aesthetics, The
							game should reflect the creativity and innovation that indie games
							are known for.
						</p>
					</div>
				</div>
			</div>
		</section>

		<section
			id="faq"
			class="flex flex-col gap-12 py-24 border-t-2 border-border relative"
		>
			<div class="flex flex-col gap-1 items-center text-center">
				<div class="text-xs uppercase text-primary font-bold tracking-[0.25em]">
					Information
				</div>
				<h2
					class="text-3xl font-black font-alchemize tracking-tight uppercase text-white"
				>
					FAQ
				</h2>
			</div>

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
					Content="Software development time is tracked using <a class='text-rose-400 p-1 hover:bg-rose-900/50 transition rounded hover:text-white' target='_blank' href='hackatime.hackclub.com'>Hackatime</a> and hardware time is tracked through <a class='text-rose-400 p-1 hover:bg-rose-900/50 transition rounded hover:text-white' target='_blank' href='lapse.hackclub.com'>Lapse</a>"
				/>
				<Accordion
					Title="Where can I find more information?"
					Content="If you have any questions or need help with anything, just join the <a class='text-rose-400 p-1 hover:bg-rose-900/50 transition rounded hover:text-white' target='_blank' href='https://hackclub.enterprise.slack.com/archives/C0ASY6R552R'>#alchemize-help</a> channel in the Hack Club Slack! You can ask for help there, and the community will be happy to assist you. "
				/>
			</div>
		</section>
	</main>

	<footer
		class="w-full border-t-2 border-border bg-background/40 relative z-20 mt-24 py-16"
	>
		<div
			class="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-12 justify-between items-start"
		>
			<div class="flex flex-col gap-4 max-w-xs">
				<h3
					class="text-xl font-black font-alchemize text-white tracking-wide uppercase"
				>
					Hack Club
				</h3>
				<p class="text-zinc-500 text-xs leading-relaxed">
					Hack Club is the world’s largest nonprofit movement of teenagers
					making cool projects.
				</p>
			</div>

			<div
				class="grid grid-cols-2 gap-x-16 gap-y-8 text-xs font-bold uppercase tracking-wider"
			>
				<div class="flex flex-col gap-3">
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
						href="https://hackclub.com/philosophy/">Philosophy</a
					>
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
						href="https://hackclub.com/team/">The Team</a
					>
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
						href="https://hackclub.com/brand/">Branding</a
					>
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
						href="https://hackclub.com/philanthropy/">Philanthropy</a
					>
				</div>
				<div class="flex flex-col gap-3">
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
						href="https://hackclub.com/jams/">Jams</a
					>
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
						href="https://toolbox.hackclub.com/">Toolbox</a
					>
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
						href="https://hackclub.com/conduct/">Code of Conduct</a
					>
					<a
						class="text-muted-foreground hover:text-primary transition-colors"
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
