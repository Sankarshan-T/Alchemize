<script lang="ts">
	import "./layout.css"

	import { Toaster } from "$lib/components/ui/sonner/index.js"
	let { children } = $props()
</script>

<svelte:head
	><link rel="icon" href="/pmix_v2.png" />
	<title>Alchemize</title>
</svelte:head>
<Toaster position="top-center" richColors expand={true} />
{@render children()}
