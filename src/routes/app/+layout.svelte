<script lang="ts">
	import ServerIcon from '$lib/components/ServerIcon.svelte';
	import AppOverlays from '$lib/components/AppOverlays.svelte';
	import { page } from '$app/stores';
	import { getServers } from '$lib/api/servers.js';
	import { showCreateServerModal } from '$lib/stores/overlayStore.js';
	
	// --- Data from Load Function (Parent) ---
	/** @type {import('./$types').LayoutData} */
	export let data; // Contains currentUser from +layout.js
	// -----------------------------------------

	// --- Fetch Servers (Remains Global) ---
	const serversPromise = getServers();
	// -------------------------------------

	// -- Reactive Variables for Active Server --
	$: activePath = $page.url.pathname;
	$: activeServerId = $page.params.server_id;
	// Removed activeChannelId, channelsPromise, membersPromise
	// Removed filterAndGroupMembers function

	// Function to open the modal
	function openCreateServerModal() {
		showCreateServerModal((details) => {
			// TODO: Call API to create server
			console.log('Callback: Creating server with name:', details.name);
			// Potentially refresh server list or navigate after creation
		});
	}

</script>

<div class="app-layout">
  <!-- Server Sidebar (Stays in Global Layout) -->
  <nav class="servers-sidebar flex flex-col items-center pt-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
    <!-- Direct Messages Link -->
    <a
        href="/app/me"
        aria-label="Direct Messages"
        class:bg-blue-600={activePath.startsWith('/app/me')} 
        class:rounded-2xl={activePath.startsWith('/app/me')}
        class:bg-gray-700={!activePath.startsWith('/app/me')}
        class="flex items-center justify-center w-12 h-12 mb-2 rounded-full hover:bg-blue-600 hover:rounded-2xl transition-all duration-200 ease-in-out"
    >
        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M18 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h4v3l3-3h9c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm-5 9h-2V7h2v2zm-4 0H7V7h2v2zm8 0h-2V7h2v2z"/></svg>
    </a>
    <hr class="w-8 border-t border-gray-600 mb-2" />

    <!-- Server Icons -->
    {#await serversPromise}
        <!-- Loading -->
        <div class="flex flex-col items-center space-y-2">
            <div class="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
    {:then servers}
        {#each servers as server (server.id)}
            <ServerIcon
                id={server.id}
                name={server.name}
                imageUrl={null} 
                active={activeServerId === server.id}
                hasNotification={false}
            />
        {/each}
    {:catch error}
        <p class="text-red-400 text-xs text-center">!</p>
        {console.error("Error loading servers:", error)}
    {/await}

    <!-- Add Server Button -->
     <button
        on:click={openCreateServerModal}
        aria-label="Add Server"
        class="flex items-center justify-center w-12 h-12 mt-auto mb-2 rounded-full bg-gray-700 hover:bg-green-600 text-green-500 hover:text-white transition-all duration-200 ease-in-out"
     >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
    </button>
  </nav>

  <!-- Main Content Area for Child Layouts -->
  <div class="flex-grow flex min-w-0">
      <slot /> <!-- Child layout (/app/me or /app/[serverId]) fills this -->
  </div>

  <AppOverlays />

</div>

<style>
  .app-layout {
    display: flex;
    height: 100vh;
    background-color: #2f3136; /* Base background */
    color: #dcddde; 
  }

  .servers-sidebar {
    width: 72px;
    background-color: #202225;
    flex-shrink: 0;
    padding-top: 8px; /* Align with content area */
    box-sizing: border-box;
  }

  /* Explicit scrollbar styling for servers list */
  .scrollbar-thumb-gray-800 {
      scrollbar-color: #202225 transparent;
  }
  .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb {
      background-color: #202225;
  }
  .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb:hover {
      background-color: #2f3136;
  }

  /* Remove styles related to channels-sidebar, main-content, user-list-sidebar */

</style>
