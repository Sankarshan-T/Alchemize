<script lang="ts">
	import { slide } from "svelte/transition"

	let { Title, Content } = $props()
	let open = $state(false)
</script>

<div class="flex flex-col w-full items-stretch justify-start group">
	<button
		onclick={() => (open = !open)}
		class="w-full flex items-center justify-between text-left px-5 py-4 border-2 border-border bg-card hover:bg-card/80 font-display tracking-wide uppercase transition-colors rounded-t-md outline-none relative z-10 select-none {open
			? 'border-b-border rounded-b-none'
			: 'rounded-b-md'}"
	>
		<h3
			class="text-sm md:text-base font-black tracking-tight line-clamp-1 pr-8 text-card-foreground"
		>
			{Title}
		</h3>

		<span
			class="absolute right-5 font-body font-black text-card-foreground text-base md:text-lg select-none"
		>
			{#if open}
				&minus;
			{:else}
				&plus;
			{/if}
		</span>
	</button>

	{#if open}
		<div
			class="w-full border-2 border-t-0 border-border bg-card/80 backdrop-blur-sm rounded-b-md rounded-t-none relative z-0"
			transition:slide={{ duration: 200 }}
		>
			<div
				class="px-5 py-4 text-xs md:text-sm text-card-foreground font-body leading-relaxed tracking-normal border-t border-border break-words"
			>
				{@html Content}
			</div>
		</div>
	{/if}
</div>
