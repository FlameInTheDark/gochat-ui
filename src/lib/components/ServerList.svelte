<script lang="ts">
	import ServerIcon from '$lib/components/ServerIcon.svelte';
	import { page } from '$app/stores';
	import { getServers, createGuild } from '$lib/api/servers.js';
	// import { showCreateServerModal } from '$lib/stores/overlayStore.js'; // REMOVE OLD
	import { overlayManagerStore } from '$lib/stores/overlayManagerStore'; // CORRECT IMPORT NAME
	import * as m from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import type { Guild } from '$lib/types';

	// --- Reactive State for Servers ---
	let servers: Guild[] = [];
	let loadingServers = true;
	let serverError: Error | null = null;
	// ---------------------------------

	// -- Reactive Variable for Active Server --
	$: activeServerId = $page.params.server_id;
	// ----------------------------------------

	// --- Function to Load Servers ---
	async function loadServers() {
		loadingServers = true;
		serverError = null;
		try {
			servers = await getServers();
		} catch (err: any) {
			console.error("Error loading servers:", err);
			serverError = err;
			servers = []; // Clear servers on error
		} finally {
			loadingServers = false;
		}
	}
	// --------------------------------

	// --- Initial Load ---
	onMount(() => {
		loadServers();
	});
	// -------------------

	// Function to open the modal and handle creation
	function openCreateServerModal() {
		overlayManagerStore.showCreateServerModal({
			onCreateSuccess: async (guild: Guild) => {
				// This callback runs when the modal signals success
				// (Assumes CreateServerModal is refactored to use this prop)
				console.log('OverlayManager reported server created:', guild);
				try {
					await loadServers(); // Refresh server list
					// Optional: Navigate to the new server?
					// import { goto } from '$app/navigation';
					// goto(`/app/${guild.id}`);
				} catch (error) {
					console.error("Failed to refresh servers after creation:", error);
				}
			}
		});
	}

</script>

<!-- Server Icons -->
{#if loadingServers}
	<!-- Loading -->
	<div class="flex flex-col items-center space-y-2 p-2">
		<div class="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
	</div>
{:else}
  {#if serverError}
    <p class="text-red-400 text-xs text-center p-2">Error loading servers.</p>
  {:else}
    {#each servers as server (server.id)}
        {@const serverIdString = server.id.toString()}
        <ServerIcon
            id={serverIdString}
            name={server.name}
            iconId={server.icon}
            active={activeServerId === serverIdString}
        />
    {/each}
  {/if}
{/if}

<!-- Add Server Button -->
 <button
    on:click={openCreateServerModal}
    aria-label={m.add_server_label()}
    class="flex items-center justify-center w-12 h-12 mt-auto mb-2 rounded-full bg-gray-700 hover:bg-green-600 text-green-500 hover:text-white transition-all duration-200 ease-in-out"
 >
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
</button> 