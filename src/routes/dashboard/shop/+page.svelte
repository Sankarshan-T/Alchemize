<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte"
	import ShopDialog from "$lib/components/shopitem-dialog.svelte"
	import OrdersDialog from "$lib/components/orders-dialog.svelte"
	import { getSlackProfile } from "$lib/utils"
	//@ts-ignore
	import looseJson from "loose-json"
	import { ShoppingBag } from "lucide-svelte"
	import { toast } from "svelte-sonner"
	import { cn } from "$lib/lib/utils"
	import Input from "$lib/components/ui/input/input.svelte"
	import { Search } from "lucide-svelte"

	let { data } = $props()
	const loggedIn = !!data.userRecord

	let currencies = $state(
		looseJson(
			data.userRecord?.fields?.currency ??
				'{"redstone":0,"glowstone":0,"aqua_regia":0,"potion_mix":0}'
		) as UserCurrency
	)

	interface UserCurrency {
		redstone: number
		glowstone: number
		aqua_regia: number
		potion_mix: number
	}

	type ShopItem = {
		itemID: string
		name: string
		description: string
		price: UserCurrency
		image: string
		grayedOut?: boolean
		primaryCurrency: keyof UserCurrency | "none"
	}

	type SortOption = "none" | "affordable" | keyof UserCurrency

	let activeCurrencies = $state<Set<keyof UserCurrency>>(new Set())
	let affordableOnly = $state(false)
	let activeSort = $state<SortOption>("none")
	let isDialogOpen = $state(false)
	let ordersDialogOpen = $state(false)
	let searchQuery = $state("")

	let selectedItem = $state<ShopItem>({
		name: "",
		description: "",
		price: { redstone: 0, glowstone: 0, aqua_regia: 0, potion_mix: 0 },
		image: "",
		itemID: "",
		primaryCurrency: "none",
	})

	function toggleCurrency(currency: keyof UserCurrency) {
		if (activeCurrencies.has(currency)) {
			activeCurrencies.delete(currency)
		} else {
			activeCurrencies.add(currency)
		}
		activeCurrencies = new Set(activeCurrencies)
	}

	function getPrimaryCurrency(
		price: UserCurrency
	): keyof UserCurrency | "none" {
		if (price.redstone > 0) return "redstone"
		if (price.glowstone > 0) return "glowstone"
		if (price.aqua_regia > 0) return "aqua_regia"
		if (price.potion_mix > 0) return "potion_mix"
		return "none"
	}

	function getItemPriceValue(item: ShopItem): number {
		if (item.primaryCurrency === "none") return 0
		return item.price[item.primaryCurrency] ?? 0
	}

	const currencyTheme = {
		redstone: {
			shadow: "shadow-md shadow-red-700",
		},

		glowstone: {
			shadow: "shadow-md shadow-yellow-600",
		},

		aqua_regia: {
			shadow: "shadow-md shadow-blue-700",
		},

		potion_mix: {
			shadow: "shadow-md shadow-rose-700",
		},

		none: {
			shadow: "shadow-md shadow-primary",
		},
	}
	function isGrayedOut(userHas: UserCurrency, itemPrice: UserCurrency) {
		return (
			userHas.redstone < itemPrice.redstone ||
			userHas.glowstone < itemPrice.glowstone ||
			userHas.aqua_regia < itemPrice.aqua_regia ||
			userHas.potion_mix < itemPrice.potion_mix
		)
	}

	function getEstimatedHours(
		currency: keyof UserCurrency | "none",
		amount: number
	): number {
		if (currency === "none" || amount <= 0) return 0
		let hours = amount
		if (currency === "potion_mix") hours = amount / 4.5
		return Math.ceil(hours)
	}

	const shopItems = $derived.by(() => {
		const rawItems =
			data?.items?.map((item: any) => {
				const primaryCurrency = getPrimaryCurrency(item.itemPrice)
				const currencyAmount =
					primaryCurrency !== "none"
						? (item.itemPrice[primaryCurrency] ?? 0)
						: 0

				return {
					itemID: item.itemID,
					name: item.name,
					description: item.description,
					price: item.itemPrice,
					image: item.cdnImage,
					grayedOut: isGrayedOut(currencies, item.itemPrice),
					primaryCurrency: primaryCurrency,
					estimatedHours: getEstimatedHours(primaryCurrency, currencyAmount),
				}
			}) ?? []

		let filtered = [...rawItems]
		if (affordableOnly) filtered = filtered.filter(item => !item.grayedOut)

		if (activeCurrencies.size > 0) {
			filtered = filtered.filter(
				item =>
					item.primaryCurrency !== "none" &&
					activeCurrencies.has(item.primaryCurrency)
			)
		}

		if (activeSort === "none") {
			filtered.sort((a, b) => getItemPriceValue(a) - getItemPriceValue(b))
		} else if (activeSort === "affordable") {
			filtered.sort((a, b) => Number(a.grayedOut) - Number(b.grayedOut))
		} else {
			filtered.sort((a, b) => b.price[activeSort] - a.price[activeSort])
		}

		return filtered
	})

	function handleBuyClick(item: ShopItem) {
		selectedItem = item
		isDialogOpen = true
	}

	function handleConfirmPurchase(qty: number) {
		currencies.potion_mix -= qty * selectedItem.price.potion_mix
		currencies.redstone -= qty * selectedItem.price.redstone
		currencies.glowstone -= qty * selectedItem.price.glowstone
		currencies.aqua_regia -= qty * selectedItem.price.aqua_regia

		fetch("/dashboard/shop/order", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ itemId: selectedItem.itemID, quantity: qty }),
		}).then(res => {
			if (res.ok) {
				toast.success("Purchase successful!")
			} else {
				toast.error("Purchase failed")
			}
		})
	}

	const renderCurrency = (currency: UserCurrency) => {
		if (currency.redstone > 0) return `${currency.redstone} Redstone`
		if (currency.glowstone > 0) return `${currency.glowstone} Glowstone`
		if (currency.aqua_regia > 0) return `${currency.aqua_regia} Aqua Regia`
		if (currency.potion_mix > 0) return `${currency.potion_mix} Potion Mix`
		return "Free"
	}

	let finalItems = $derived(
		shopItems.filter((item: any) =>
			item?.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	)
</script>

<svelte:head>
	<script src="https://server.fillout.com/embed/v1/"></script>
	<title>Alchemize | Shop</title>
</svelte:head>

<main
	class="h-screen w-full px-10 py-6 tracking-wide relative overflow-hidden flex flex-col font-body"
>
	<header
		class="relative z-10 w-full flex flex-col gap-4 border-b-2 border-border pb-4 shrink-0"
	>
		<div
			class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 py-3 px-8"
		>
			<div class="flex items-center gap-3 text-foreground">
				<ShoppingBag class="size-5" />
				<div>
					<h1
						class="text-xl sm:text-2xl font-display font-black uppercase tracking-wider leading-none"
					>
						The Shop
					</h1>
				</div>
			</div>

			{#if loggedIn}
				<Button
					size="sm"
					variant="outline"
					onclick={() => (ordersDialogOpen = true)}
				>
					Orders
				</Button>
			{/if}
		</div>

		{#if loggedIn}
			<div
				class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full font-note font-bold"
			>
				<Button
					onclick={() => toggleCurrency("redstone")}
					class={cn(
						"justify-between rounded-md px-3 py-2 shadow-sm shadow-red-900/20 border-2 transition-all hover:bg-red-800/20 hover:border-red-700",
						activeCurrencies.has("redstone")
							? "border-red-700 bg-red-700/80 text-white hover:bg-red-700/50"
							: "border-red-700/50 bg-red-800/10 text-red-800"
					)}
				>
					<span class="text-[10px] sm:text-xs uppercase tracking-wider">
						Redstone
					</span>
					<span class="font-black text-xs sm:text-sm">
						{currencies.redstone}
					</span>
				</Button>

				<Button
					onclick={() => toggleCurrency("glowstone")}
					class={cn(
						"justify-between rounded-md px-3 py-2 shadow-sm shadow-amber-900/20 border-2 transition-all hover:border-amber-700 hover:bg-amber-800/20",
						activeCurrencies.has("glowstone")
							? "border-amber-700 bg-amber-800/80 text-white hover:bg-amber-800/50"
							: "border-amber-700/50 bg-amber-800/10 text-amber-800"
					)}
				>
					<span class="text-[10px] sm:text-xs uppercase tracking-wider">
						Glowstone
					</span>
					<span class="font-black text-xs sm:text-sm">
						{currencies.glowstone}
					</span>
				</Button>

				<Button
					onclick={() => toggleCurrency("aqua_regia")}
					class={cn(
						"justify-between rounded-md px-3 py-2 shadow-sm shadow-blue-900/20 border-2 transition-all hover:border-blue-700 hover:bg-blue-800/20",
						activeCurrencies.has("aqua_regia")
							? "border-blue-700 bg-blue-700/80 text-white hover:bg-blue-700/50"
							: "border-blue-700/50 bg-blue-800/10 text-blue-800"
					)}
				>
					<span class="text-[10px] sm:text-xs uppercase tracking-wider">
						Aqua Regia
					</span>
					<span class="font-black text-xs sm:text-sm">
						{currencies.aqua_regia}
					</span>
				</Button>

				<Button
					onclick={() => toggleCurrency("potion_mix")}
					class={cn(
						"justify-between rounded-md px-3 py-2 shadow-sm shadow-rose-900/20 border-2 transition-all hover:border-rose-700 hover:bg-rose-800/20",
						activeCurrencies.has("potion_mix")
							? "border-rose-700 bg-rose-700/80 text-white hover:bg-rose-700/50"
							: "border-rose-700/50 bg-rose-800/10 text-rose-800"
					)}
				>
					<span class="text-[10px] sm:text-xs uppercase tracking-wider">
						Potion Mix
					</span>
					<span class="font-black text-xs sm:text-sm">
						{currencies.potion_mix}
					</span>
				</Button>
			</div>
		{/if}
	</header>

	{#if loggedIn}
		<div
			class="relative z-10 w-full flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center justify-between py-3 border-b-2 border-border shrink-0"
		>
			<div class="flex flex-wrap items-center gap-3">
				<label
					class="flex items-center gap-2 cursor-pointer text-xs font-display font-bold uppercase tracking-wider text-foreground"
				>
					<input
						type="checkbox"
						bind:checked={affordableOnly}
						class="accent-primary"
					/>

					<span>Affordable Only</span>
				</label>

				<div class="hidden sm:block h-5 w-px bg-border"></div>

				<div class="flex items-center gap-2">
					<span
						class="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground"
					>
						Sort:
					</span>

					<select
						bind:value={activeSort}
						class="bg-card text-foreground border-2 border-border rounded-md px-2 py-1.5 outline-none focus:border-primary font-body text-xs cursor-pointer"
					>
						<option value="none">Default</option>
						<option value="affordable">Affordable First</option>
						<option value="redstone">Highest Redstone Cost</option>
						<option value="glowstone">Highest Glowstone Cost</option>
						<option value="aqua_regia">Highest Aqua Regia Cost</option>
						<option value="potion_mix">Highest Potion Mix Cost</option>
					</select>
				</div>
			</div>

			<div class="flex items-center gap-2 w-full lg:w-auto">
				<div class="relative w-full lg:w-64">
					<Input
						class="w-full border-2 border-border bg-card rounded-md font-body text-foreground pr-9 focus:border-primary"
						bind:value={searchQuery}
						placeholder="Search items..."
					/>

					<Search
						class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none"
					/>
				</div>
			</div>
		</div>
	{/if}

	<div
		class="relative z-10 flex-1 min-h-0 overflow-y-auto pr-2 pt-4 pb-6 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 content-start"
	>
		{#each finalItems as item}
			{@const theme = currencyTheme[item.primaryCurrency]}

			<div
				class={cn(
					"relative z-10 w-full flex flex-col bg-card border-2 rounded p-3 h-full gap-3 backdrop-blur-sm transition-all",
					theme.shadow
				)}
			>
				<div
					class="w-full aspect-square border bg-background rounded overflow-hidden relative shrink-0 flex items-center justify-center p-3"
				>
					<img
						src={item.image}
						alt={item.name}
						class="max-w-full max-h-full object-contain transform scale-100 group-hover:scale-[1.05] transition-transform duration-300 relative z-10"
					/>
				</div>

				<div class="flex flex-col flex-1 justify-between gap-2">
					<div class="flex flex-col gap-1">
						<h2
							class="text-sm font-display font-black uppercase text-foreground tracking-tight line-clamp-1"
						>
							{item.name}
						</h2>

						<p
							class="text-muted-foreground text-[11px] leading-snug font-body line-clamp-3"
						>
							{item.description}
						</p>
					</div>

					<div class="pt-2 border-t border-border w-full mt-auto space-y-2">
						<div class="flex items-center justify-between gap-2">
							<p class="text-muted-foreground text-[11px] font-body font-bold">
								~{item.estimatedHours} hrs
							</p>

							<p class={cn("text-xs font-body text-card-foreground")}>
								{renderCurrency(item.price)}
							</p>
						</div>

						<Button
							variant="secondary"
							class={cn(
								"w-full",
								item.grayedOut &&
									"pointer-events-none cursor-not-allowed border bg-muted text-muted-foreground shadow-none"
							)}
							onclick={() => handleBuyClick(item)}
						>
							{#if !loggedIn}
								<a href="/" class="hover:text-primary"> Login to Purchase </a>
							{:else if item.grayedOut}
								Locked...
							{:else}
								Buy ~ {renderCurrency(item.price)}
							{/if}
						</Button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</main>

{#if loggedIn}
	<ShopDialog
		allItems={shopItems}
		bind:open={isDialogOpen}
		item={selectedItem}
		currency={currencies}
		onConfirm={handleConfirmPurchase}
	/>

	<OrdersDialog bind:open={ordersDialogOpen} orders={data.orders ?? []} />
{/if}

<style>
	:global(div[data-fillout-id] button),
	:global(div[data-fillout-id] .fillout-embed-popup-button) {
		all: unset !important;
		box-sizing: border-box !important;

		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;

		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
			"Liberation Mono", "Courier New", monospace !important;
		font-size: 11px !important;
		font-weight: 700 !important;
		text-transform: uppercase !important;
		letter-spacing: 0.05em !important;

		padding: 0.275rem 0.55rem !important;
		border-radius: 4px !important;
		background-color: #7e0026 !important;
		border: 2px solid rgba(239, 68, 68, 0.4) !important;
		color: #f4f4f5 !important;

		box-shadow: 2px 2px 0px 0px rgba(239, 68, 68, 0.2) !important;
		transition: all 0.1s ease-in-out !important;
	}

	:global(div[data-fillout-id] button:hover),
	:global(div[data-fillout-id] .fillout-embed-popup-button:hover) {
		background-color: #990033 !important;
		border-color: rgba(239, 68, 68, 0.8) !important;
		color: #ffffff !important;
	}

	:global(div[data-fillout-id] button:active),
	:global(div[data-fillout-id] .fillout-embed-popup-button:active) {
		transform: translate(1px, 1px) !important;
		box-shadow: none !important;
	}
</style>
