<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { getUserMe } from '$lib/api/user.js';
	import { logoutUser } from '$lib/api/auth.js';
	import { browser } from '$app/environment';
	import type { User } from '$lib/api/client';
	import { ApiError } from '$lib/api/client';

	let currentUser: User | null = $state(null);
	let isLoadingUser = $state(true);
	let authError: string | null = $state(null);

	const isLoggedIn = $derived(!!currentUser);

	async function checkInitialUser() {
		if (browser) {
			try {
				const user = await getUserMe();
				if (user) {
					currentUser = user;
					goto('/app', { replaceState: true });
				}
			} catch (error) {
				console.warn('Initial user check failed (likely not logged in):', error);
			}
		}
	}

	onMount(async () => {
		await checkInitialUser();
		isLoadingUser = false;
	});

	function handleLoginSuccess(event: CustomEvent<{ user: User }>) {
		currentUser = event.detail.user;
		goto('/app', { replaceState: true });
	}

	function handleLogout() {
		logoutUser();
		currentUser = null;
	}

	function handleContinue() {
		goto('/app');
	}
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="p-8 rounded-lg shadow-xl bg-gray-700 w-full max-w-md text-center">

		{#if isLoadingUser}
			<p class="text-gray-300">Checking login status...</p>
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto my-4"></div>
		{:else if isLoggedIn}
			{#if currentUser}
				<h1 class="text-2xl font-bold mb-2">{m.welcome_back({ name: currentUser.name })}</h1>
				<p class="text-sm text-gray-400 mb-6">@{currentUser.name}#{currentUser.discriminator}</p>
				
				<button
					on:click={handleContinue}
					class="w-full px-4 py-2 mb-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
				>
					{m.continue_button()}
				</button>
				<button
					on:click={handleLogout}
					class="w-full px-4 py-2 bg-gray-600 hover:bg-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm"
				>
					Log Out
				</button>
			{/if}
		{:else}
			{#if authError}
				<p class="text-red-400 mb-4">Error: {authError}</p>
			{/if}
			<LoginForm on:loginsuccess={handleLoginSuccess} />
		{/if}

	</div>
</div>
