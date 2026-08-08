<script lang="ts">
	import docsIndex from "./docs-index.json"
	import Docsaside from "./docsaside.svelte"

	let { children } = $props()

	let openGroups = $state<Record<string, boolean>>(
		Object.fromEntries(Object.keys(docsIndex).map(group => [group, true]))
	)

	function toggleGroup(group: string) {
		openGroups[group] = !openGroups[group]
	}
</script>

<svelte:head>
	<title>Alchemize | Docs</title>
	<meta name="description" content="Alchemize Docs" />
	<meta property="og:title" content="Alchemize | Docs" />
</svelte:head>

<main class="flex h-screen max-h-screen overflow-hidden bg-background">
	<Docsaside {openGroups} {toggleGroup} />

	<div
		class="relative h-full max-h-screen w-full overflow-y-auto p-10 font-light font-body"
	>
		{@render children()}
	</div>
</main>
