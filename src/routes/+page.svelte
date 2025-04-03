<script>
	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte'; // Import onMount
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { getUserMe } from '$lib/api/user.js'; // Import user API
	import { setAuthToken } from '$lib/api/client.js'; // Import for logout
	import { browser } from '$app/environment'; // To check for localStorage

	// --- Auth State --- 
	// Check initial token state from localStorage
	let authToken = browser ? localStorage.getItem('authToken') : null;
	let currentUser = null; // Variable to hold fetched user data
	let isLoadingUser = false;
	let authError = null;

	// --- Reactive Check for Logged In Status --- 
	$: isLoggedIn = !!authToken;

	// --- Fetch User Data When Logged In --- 
	async function fetchCurrentUser() {
		if (!isLoggedIn || !browser) return; // Only fetch if logged in and in browser
		
		isLoadingUser = true;
		authError = null;
		currentUser = null;
		try {
			console.log("Attempting to fetch current user...");
			currentUser = await getUserMe();
			console.log("Fetched current user:", currentUser);
		} catch (error) {
			console.error("Failed to fetch user on load:", error);
			// If token is invalid (e.g., 401), log out
			if (error?.status === 401) {
				handleLogout();
				authError = "Session expired. Please log in again.";
			} else {
				authError = error?.body || error?.message || "Failed to load user data.";
			}
		}
		finally {
			isLoadingUser = false;
		}
	}

	// Fetch user when component mounts or when authToken changes
	onMount(fetchCurrentUser);
	$: if (authToken) fetchCurrentUser(); // Re-fetch if token changes (e.g., after login)

	// --- Event Handlers --- 

	function onLoginSuccess(event) {
		console.log('Login success event received:', event.detail);
		// The apiClient already stored the token via setAuthToken in loginUser
		// We just need to update the local reactive variable to trigger effects
		authToken = browser ? localStorage.getItem('authToken') : null; 
		// User data will be fetched by the reactive effect above
	}

	function handleLogout() {
		console.log("Logging out...");
		logoutUser(); // Call the API helper
		authToken = null; // Update local state
		currentUser = null;
		authError = null;
		// Optionally redirect to home or login page
		// goto('/');
	}

	function handleContinue() {
		goto('/app'); // Navigate to the main app page
	}
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="p-8 rounded-lg shadow-xl bg-gray-700 w-full max-w-md text-center">

		{#if isLoggedIn}
			{#if isLoadingUser}
				<p class="text-gray-300">Loading user data...</p>
				<!-- Basic Spinner -->
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto my-4"></div>
			{:else if currentUser}
				<!-- Logged In View with User Data -->
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
			{:else if authError}
				 <!-- Error Loading User -->
				 <p class="text-red-400 mb-4">Error: {authError}</p>
				 <LoginForm on:loginsuccess={onLoginSuccess} />
			{/if}
		{:else}
			<!-- Login Form View -->
			<LoginForm on:loginsuccess={onLoginSuccess} />
		{/if}

	</div>
</div>
