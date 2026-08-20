<script lang="ts">
	import { page } from "$app/state"
	import { onMount } from "svelte"
	import Adminnav from "$lib/components/adminnav.svelte"
	import AdminThemeEditor from "$lib/components/AdminThemeEditor.svelte"
	import { loaderStore } from "$lib/stores/adminLoader"
	import { navigating } from "$app/stores"
	import * as Dialog from "$lib/components/ui/dialog/index.js"
	import { Button } from "$lib/components/ui/button/index.js"
	import { Palette } from "lucide-svelte"

	let { children, data } = $props()
	const excludedRoutes = ["/admin", "/admin/login", "/admin/error"]
	const colorRoutes = "/admin/review2/"
	let adminPrimary = $state("#6875f6")
	let adminHover = $state("#7a8aff")
	let adminText = $state("#dce6f2")
	let adminBg = $state("#172554")
	let admin2Bg = $state("#0C4A6E")
	if (page.url.pathname.includes(colorRoutes)) {
		adminBg = "#171714"
		admin2Bg = "#030303"
	}
	let triggerEl: HTMLButtonElement | null = $state(null)
	let buttonX = $state(20)
	let buttonY = $state(20)
	let isDragging = false
	let hasDragged = false
	let dragOffsetX = 0
	let dragOffsetY = 0

	function captureElement(node: HTMLButtonElement) {
		triggerEl = node
	}

	onMount(() => {
		buttonX = window.innerWidth - 80
		buttonY = window.innerHeight - 80
	})

	const onPointerDown = (event: PointerEvent) => {
		if (!triggerEl) return
		isDragging = true
		hasDragged = false
		dragOffsetX = event.clientX - buttonX
		dragOffsetY = event.clientY - buttonY
		triggerEl.setPointerCapture(event.pointerId)
	}

	const onPointerMove = (event: PointerEvent) => {
		if (!isDragging) return
		if (
			Math.abs(event.clientX - buttonX - dragOffsetX) > 2 ||
			Math.abs(event.clientY - buttonY - dragOffsetY) > 2
		) {
			hasDragged = true
		}
		buttonX = Math.max(
			10,
			Math.min(window.innerWidth - 70, event.clientX - dragOffsetX)
		)
		buttonY = Math.max(
			10,
			Math.min(window.innerHeight - 70, event.clientY - dragOffsetY)
		)
	}

	const onPointerUp = (event: PointerEvent) => {
		if (!isDragging) return
		isDragging = false
		triggerEl?.releasePointerCapture(event.pointerId)
	}

	const handleTriggerClick = (event: MouseEvent) => {
		if (hasDragged) {
			event.preventDefault()
			event.stopPropagation()
		}
	}

	onMount(() => {
		window.addEventListener("pointermove", onPointerMove)
		window.addEventListener("pointerup", onPointerUp)
		return () => {
			window.removeEventListener("pointermove", onPointerMove)
			window.removeEventListener("pointerup", onPointerUp)
		}
	})
</script>

<div class="w-screen h-screen">
	{@render children()}
</div>

{#if !excludedRoutes.includes(page.url.pathname)}
	<Adminnav admin={data.admin} />
{/if}
{#if $navigating || $loaderStore}
	<div
		class="fixed inset-0 bg-black/70 flex items-center justify-center z-80 backdrop-blur-none"
	>
		<div class="flex flex-col items-center gap-4">
			<div
				class="w-12 h-12 border-4 border-gray-600 border-t-admin-primary rounded-full animate-spin"
			></div>
			<p class="text-primary-foreground text-lg">Loading...</p>
		</div>
	</div>
{/if}
