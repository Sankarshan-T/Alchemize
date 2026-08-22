<script>
	import Button from "$lib/components/ui/button/button.svelte"
	import Input from "$lib/components/ui/input/input.svelte"
	import { FlaskConical } from "lucide-svelte"
	import { currenciesToPotionMix } from "$lib/utils"
	import { invalidateAll } from "$app/navigation"
	let { data } = $props()
	import { toast } from "svelte-sonner"
	import { cn } from "$lib/lib/utils"

	let redstoneAmount = $state(0)
	let glowstoneAmount = $state(0)
	let aquaRegiaAmount = $state(0)
	let potionMixAmount = $state(0)
	let hasRedstone = $state(data.currencies?.redstone)
	let hasGlowstone = $state(data.currencies?.glowstone)
	let hasAquaRegia = $state(data.currencies?.aqua_regia)
	let hasPotionMix = $state(data.currencies?.potion_mix)

	const calculatePotionMix = () => {
		potionMixAmount = currenciesToPotionMix(
			redstoneAmount,
			glowstoneAmount,
			aquaRegiaAmount
		)
	}
	let loading = $state(false)
	const convertDisabled = false

	const updatePotionMix = async () => {
		if (potionMixAmount <= 0) {
			toast.error("Please enter valid amounts to convert.")
			return
		}
		loading = true
		const res = await fetch("/dashboard/trade/trade", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				redstone: redstoneAmount,
				glowstone: glowstoneAmount,
				aqua_regia: aquaRegiaAmount,
			}),
		})
		if (res.ok) {
			invalidateAll()
			const resData = await res.json()
			data.currencies = resData.currencies
			if (hasPotionMix) {
				hasPotionMix += currenciesToPotionMix(
					redstoneAmount,
					glowstoneAmount,
					aquaRegiaAmount
				)
			}
			if (hasRedstone && hasGlowstone && hasAquaRegia) {
				hasRedstone -= redstoneAmount
				hasGlowstone -= glowstoneAmount
				hasAquaRegia -= aquaRegiaAmount
			}
			redstoneAmount = 0
			glowstoneAmount = 0
			aquaRegiaAmount = 0
			potionMixAmount = 0

			toast.success("Stones converted successfully!")
		} else {
			const errorData = await res.json()
			toast.error(errorData.message)
		}
		loading = false
	}
</script>

<svelte:head>
	<title>Alchemize | Trade</title>
	<meta name="description" content="Alchemize Trade" />
	<meta property="og:title" content="Alchemize | Trade" />
</svelte:head>

<main
	class="w-full min-h-screen h-full overflow-y-auto overflow-x-hidden flex items-center justify-center py-10"
>
	<div
		class="relative h-full w-full max-w-6xl px-6 sm:px-6 lg:px-6 items-center justify-center flex-col flex z-50 gap-y-6"
	>
		<div class="text-center space-y-2">
			<h1
				class="font-display text-shadow-sm text-shadow-primary text-4xl sm:text-6xl lg:text-7xl font-alchemize text-foreground tracking-wider"
			>
				TRADE STATION
			</h1>
			<h2 class="text-muted-foreground font-note text-xs sm:text-sm">
				Convert your stones into potion mix (only whole numbers)
			</h2>
		</div>

		<div
			class="w-full lg:w-full xl:w-[95%] grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mt-4"
		>
			<div
				class="w-full flex flex-col gap-y-2 items-start justify-start order-1"
			>
				<h2
					class="font-display text-foreground uppercase text-sm font-semibold"
				>
					Stones
				</h2>

				<div class="owned-stones flex flex-col gap-y-4 w-full">
					<div
						class="p-4 bg-card border-2 border-border/50 rounded-xl flex items-center justify-between gap-x-4"
					>
						<img
							src="/alch-redstone.png"
							alt="Redstone"
							class="w-12 h-12 sm:w-14 sm:h-14 object-contain p-2.5 sm:p-3 bg-red-600/20 border border-red-500/30 rounded-xl shrink-0"
						/>

						<div class="w-full flex flex-col gap-y-1">
							<div class="w-full flex items-baseline justify-between">
								<h2
									class="font-display text-red-800 text-xs sm:text-sm font-semibold uppercase tracking-wider"
								>
									Redstone
								</h2>

								<span
									class="font-body text-card-foreground text-[10px] sm:text-xs font-medium"
								>
									<strong>Owned:</strong>
									{hasRedstone ? data.currencies?.redstone : 0}
								</span>
							</div>

							<Input
								type="number"
								bind:value={redstoneAmount}
								oninput={calculatePotionMix}
								class="font-body h-8 text-sm border-border bg-input text-foreground"
								max={hasRedstone ? data.currencies?.redstone : 0}
								min="0"
							/>
						</div>
					</div>

					<div
						class="p-4 bg-card border-2 border-border/50 rounded-xl backdrop-blur-2xl flex items-center justify-between gap-x-4"
					>
						<img
							src="/alch-glowstone.png"
							alt="Glowstone"
							class="w-12 h-12 sm:w-14 sm:h-14 object-contain p-2.5 sm:p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-xl shrink-0"
						/>

						<div class="w-full flex flex-col gap-y-1">
							<div class="w-full flex items-baseline justify-between">
								<h2
									class="font-display text-yellow-400 text-xs sm:text-sm font-semibold uppercase tracking-wider"
								>
									Glowstone
								</h2>

								<span
									class="font-body text-muted-foreground text-[10px] sm:text-xs font-medium"
								>
									<strong>Owned:</strong>
									{hasGlowstone ? data.currencies?.glowstone : 0}
								</span>
							</div>

							<Input
								type="number"
								bind:value={glowstoneAmount}
								oninput={calculatePotionMix}
								class="font-body h-8 text-sm border-border bg-input text-foreground"
								max={hasGlowstone ? data.currencies?.glowstone : 0}
								min="0"
							/>
						</div>
					</div>

					<div
						class="p-4 bg-card border-2 border-border/50 rounded-xl backdrop-blur-2xl flex items-center justify-between gap-x-4"
					>
						<img
							src="/alch-aquaregia.png"
							alt="Aqua Regia"
							class="w-12 h-12 sm:w-14 sm:h-14 object-contain p-2.5 sm:p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl shrink-0"
						/>

						<div class="w-full flex flex-col gap-y-1">
							<div class="w-full flex items-baseline justify-between">
								<h2
									class="font-display text-blue-400 text-xs sm:text-sm font-semibold uppercase tracking-wider"
								>
									Aqua Regia
								</h2>

								<span
									class="font-body text-muted-foreground text-[10px] sm:text-xs font-medium"
								>
									<strong>Owned:</strong>
									{hasAquaRegia ? data.currencies?.aqua_regia : 0}
								</span>
							</div>

							<Input
								type="number"
								bind:value={aquaRegiaAmount}
								oninput={calculatePotionMix}
								class="font-body h-8 text-sm border-border bg-input text-foreground"
								max={hasAquaRegia ? data.currencies?.aqua_regia : 0}
								min="0"
							/>
						</div>
					</div>
				</div>
			</div>

			<div
				class="w-full flex flex-col items-center justify-center gap-y-6 py-4 lg:py-0 order-2"
			>
				<div class="relative">
					<div
						class="flask absolute inset-0 bg-primary rounded-full animate-pulse -z-10"
					></div>

					<div class="relative bg-card/90 rounded-full p-6 sm:p-8">
						<FlaskConical class="z-10 h-16 w-16 sm:h-20 sm:w-20 text-primary" />
					</div>
				</div>

				<Button
					onclick={updatePotionMix}
					variant="primary"
					size="lg"
					class="w-full text-2xl uppercase"
				>
					{#if !convertDisabled}
						<span class="text-base sm:text-lg"> Convert Stones </span>
					{:else}
						<span class="font-note text-sm sm:text-md text-muted-foreground">
							Not enough stones
						</span>
					{/if}

					{#if loading}
						<div
							class="loader border-muted-foreground border-2 border-t-foreground rounded-full size-5 animate-spin"
						></div>
					{/if}
				</Button>
			</div>

			<div
				class="w-full flex flex-col gap-y-2 items-start justify-start order-3"
			>
				<h2
					class="font-display text-foreground uppercase text-sm font-semibold lg:text-right w-full"
				>
					Result
				</h2>

				<div
					class="h-full w-full bg-card border-2 border-border/50 rounded-2xl flex flex-col gap-y-6 items-center justify-center py-8 px-5 z-20"
				>
					<div
						class="bg-secondary/20 rounded-full p-4 w-24 sm:w-28 border-2 border-border/50 flex items-center justify-center shadow-primary"
					>
						<img
							src="/pmix_v2.png"
							alt="Potion Mix"
							class="h-20 text-primary object-contain"
						/>
					</div>

					<div
						class="w-full flex flex-col items-center justify-start gap-y-3 max-w-xs"
					>
						<h2
							class="font-display text-red-900 text-shadow-md font-bold text-base sm:text-md uppercase tracking-wider"
						>
							Potion Mix
						</h2>

						<Input
							type="number"
							bind:value={potionMixAmount}
							class="font-body h-8 text-sm border-border bg-input text-foreground text-center"
							readonly
						/>

						<span class="font-note text-muted-foreground text-xs font-medium">
							Owned: {hasPotionMix ? data.currencies?.potion_mix : 0}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.flask {
		box-shadow: 0px 0px 20px 4px var(--color-primary);
	}
</style>
