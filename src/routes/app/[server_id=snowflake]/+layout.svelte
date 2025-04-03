<script lang="ts">
	// Moved from /app/+layout.svelte
	import ChannelLink from '$lib/components/ChannelLink.svelte';
	import UserListItem from '$lib/components/UserListItem.svelte';
	import UserArea from '$lib/components/UserArea.svelte';
	import { page } from '$app/stores';
	import { getChannels } from '$lib/api/channels.js';
	import { getMembers } from '$lib/api/members.js';
	import type { Member } from '$lib/api/members';
    import type { User } from '$lib/api/client.js'; // Import User type

    /** @type {import('./$types').LayoutData} */
    export let data; // Includes currentUser from parent /app layout

	// -- Reactive Variables for Active IDs and Fetched Data --
	$: activeServerId = $page.params.server_id;
	$: activeChannelId = $page.params.channel_id;
	$: channelsPromise = activeServerId ? getChannels(activeServerId) : Promise.resolve([]);
	$: membersPromise = activeServerId ? getMembers(activeServerId) : Promise.resolve([]);
    $: currentUser = data.currentUser; // Extract currentUser

	// Helper to filter and group members
	function filterAndGroupMembers(members: Member[], channelId: string | undefined): { online: Member[], offline: Member[] } {
        // ... (Keep the function logic as it was) ...
		const online: Member[] = [];
		const offline: Member[] = [];
		const filteredMembers = channelId 
			? members.filter(m => m.channels?.includes(channelId))
			: members;
		filteredMembers.forEach(member => {
			if (member.status === 'offline') {
				offline.push(member);
			} else {
				online.push(member);
			}
		});
		online.sort((a, b) => a.name.localeCompare(b.name));
		offline.sort((a, b) => a.name.localeCompare(b.name));
		return { online, offline };
	}
</script>

<!-- Server-specific layout structure -->
<nav class="channels-sidebar flex flex-col">
    <div class="p-3 h-12 flex items-center shadow-md flex-shrink-0">
        <h2 class="font-semibold text-white truncate">
            {activeServerId ? `Server ${activeServerId}` : 'Loading Server...'}
        </h2>
    </div>

    <div class="flex-grow overflow-y-auto p-1 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {#await channelsPromise}
            <!-- Loading Channels -->
            <div class="p-2 space-y-2">
                 <div class="h-5 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                 <div class="h-5 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
        {:then channels}
             {#each channels as channel (channel.id)}
                 <ChannelLink
                     {channel} 
                     serverId={activeServerId}
                 />
             {:else}
                 <p class="text-gray-500 text-sm p-2">No channels.</p>
             {/each}
        {:catch error}
             <p class="text-red-400 text-sm p-2">Error loading channels.</p>
             {console.error("Error loading channels:", error)}
        {/await}
    </div>

    <!-- User Area - Pass the user data down -->
    <UserArea user={currentUser} /> 
</nav>

<main class="main-content">
    <slot /> <!-- Server/Channel page content will be rendered here -->
</main>

<aside class="user-list-sidebar flex flex-col">
    {#await membersPromise}
         <!-- Loading Members -->
         <div class="p-2 space-y-3">
             <div class="flex items-center space-x-2">
                 <div class="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                 <div class="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
             </div>
         </div>
    {:then members}
         {@const { online, offline } = filterAndGroupMembers(members, activeChannelId)}
         <div class="flex-grow overflow-y-auto p-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
             {#if online.length > 0}
                 <h3 class="px-1.5 pt-4 pb-1 text-xs font-semibold uppercase text-gray-400">Online — {online.length}</h3>
                 {#each online as member (member.id)}
                     <UserListItem {member} />
                 {/each}
             {/if}
             {#if offline.length > 0}
                 <h3 class="px-1.5 pt-4 pb-1 text-xs font-semibold uppercase text-gray-400">Offline — {offline.length}</h3>
                 {#each offline as member (member.id)}
                     <UserListItem {member} />
                 {/each}
             {/if}
             {#if online.length === 0 && offline.length === 0}
                 <p class="text-gray-500 text-sm p-2 text-center">No members found.</p>
             {/if}
         </div>
    {:catch error}
         <p class="text-red-400 text-sm p-2">Error loading members.</p>
         {console.error("Error loading members:", error)}
    {/await}
</aside>

<style>
    /* Add styles needed specifically for this server layout */
    .channels-sidebar {
        width: 240px;
        background-color: #2f3136;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        /* Removed padding: 8px; assuming parent layout might handle this */
        box-sizing: border-box;
    }

    .main-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background-color: #36393f;
    }

    .user-list-sidebar {
        width: 240px;
        background-color: #2f3136; 
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        /* Removed padding: 8px; */
        box-sizing: border-box;
        border-left: 1px solid #202225; /* Add a subtle separator */
    }

    /* Explicit scrollbar styling to match other areas */
    .scrollbar-thumb-gray-800 {
       scrollbar-color: #202225 transparent;
   }
   .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb {
       background-color: #202225;
   }
   .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb:hover {
       background-color: #2f3136;
   }
</style> 