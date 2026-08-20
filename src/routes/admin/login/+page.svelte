<script>
	import {
		PUBLIC_ADMIN_HACKCLUB_AUTH,
		PUBLIC_ADMIN_HACKCLUB_REDIRECT,
	} from "$env/static/public"
	import Button from "$lib/components/ui/button/button.svelte"
	const clientId = PUBLIC_ADMIN_HACKCLUB_AUTH
	const uri = PUBLIC_ADMIN_HACKCLUB_REDIRECT
	let authUrl = `https://auth.hackclub.com/oauth/authorize?client_id=${clientId}&response_type=code&scope=openid+profile+email+name+verification_status+slack_id&redirect_uri=${uri}`
</script>

<svelte:head>
	<title>Admin Login</title>
	<meta name="description" content="Alchemize admin" />
	<meta property="og:title" content="Admin Login" />
</svelte:head>

<div
	class="login w-screen h-screen flex items-center justify-center flex-col gap-y-4"
>
	<img src="/pmix_v2.png" alt="alchemize" class="h-40" />
	<h1 class="text-5xl font-bold font-decor uppercase select-none text-primary">
		Alchemize Admin
	</h1>
	<div class="flex gap-x-5 items-center">
		<Button
			onclick={() => {
				window.location.href = authUrl
			}}
			size="xl"
			variant="primary"
		>
			Login with Hack Club
		</Button>
		<Button
			onclick={() => {
				window.location.href = "/dashboard"
			}}
			variant="outline"
			size="xl"
		>
			or go back home
		</Button>
	</div>
</div>
