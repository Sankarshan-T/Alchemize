<script>
	import { ChevronDown } from "lucide-svelte"

	import { slide } from "svelte/transition"
	import { cn } from "$lib/lib/utils"

	import docsIndex from "./docs-index.json"
	import { ArrowLeft } from "@lucide/svelte"
	import Button from "$lib/components/ui/button/button.svelte"

	const { toggleGroup, openGroups } = $props()
</script>

<aside
	class="relative no-scrollbar bg-card z-10 h-full max-h-screen overflow-y-auto sidebar w-1/4 border p-5 border-r-2 scrollbar-none"
>
	<div
		class="sidebar-group flex flex-col gap-2 items-center scrollbar-none w-full pb-5 border-b"
	>
		<div class="flex gap-1 w-full items-baseline">
			<span
				class="font-decor text-card-foreground font-extrabold text-2xl tracking-tight"
				>ALCHEMIZE</span
			>
			<span
				class="font-extrabold leading-none tracking-wider text-xs uppercase font-display"
			>
				Docs
			</span>
		</div>
		<a href="/dashboard" class="w-full">
			<Button variant="secondary" size="sm" class="w-full">Back to site</Button>
		</a>
	</div>
	{#each Object.entries(docsIndex) as [groupName, groupItems]}
		<div
			class="sidebar-group flex flex-col px-2 w-full gap-2 pt-5 pb-5 border-b"
		>
			<h1
				class="text-md font-semibold w-full justify-between flex mb-1 text-card-foreground"
			>
				{groupName}
				<button
					aria-label="Toggle submenu"
					class="hover:translate-y-px transition"
					onclick={() => toggleGroup(groupName)}
				>
					<ChevronDown
						class={cn(
							"transition-transform duration-200",
							!openGroups[groupName] && "-rotate-90"
						)}
					/>
				</button>
			</h1>
			{#if openGroups[groupName]}
				<div
					transition:slide={{ duration: 150 }}
					class="links flex gap-2 flex-col pl-3 text-secondary-foreground font-note"
				>
					{#each groupItems as item}
						<a
							href={item.path}
							class="hover:text-card-foreground hover:font-semibold cursor-pointer transition"
						>
							{item.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</aside>

<style>
	@layer utilities {
		.no-scrollbar::-webkit-scrollbar {
			display: none;
		}
		.no-scrollbar {
			-ms-overflow-style: none;
			scrollbar-width: none;
		}
	}
</style>
