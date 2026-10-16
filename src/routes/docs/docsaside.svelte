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
	class="relative bg-card z-10 h-full max-h-screen overflow-y-auto sidebar w-1/4 border-r p-5 scrollbar-none"
>
	<div
		class="sidebar-group flex flex-col gap-2 items-center scrollbar-none w-full pb-5 border-b"
	>
		<div class="flex w-full justify-center pb-2">
			<img
				src="/assets/DOCS.png"
				alt="Docs"
				class="block h-auto w-full max-w-[220px] object-contain"
			/>
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
							class="hover:text-card-foreground hover:underline underline-offset-4 cursor-pointer transition"
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
		.scrollbar-none::-webkit-scrollbar {
			display: none;
		}
		.scrollbar-none {
			-ms-overflow-style: none;
			scrollbar-width: none;
		}
	}
</style>
