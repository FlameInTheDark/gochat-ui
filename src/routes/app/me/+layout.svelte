<script lang="ts">
    import DirectMessageLink from '$lib/components/DirectMessageLink.svelte';
    import type { LayoutData } from './$types';
    import { page } from '$app/stores';
    import type DirectMessageLinkComponent from '$lib/components/DirectMessageLink.svelte';
    import UserArea from '$lib/components/UserArea.svelte';
    import UserListItem from '$lib/components/UserListItem.svelte';
    import type { Member } from '$lib/api/members';
    import type { DirectMessageConversation } from '$lib/api/dms.js';
    import type { User } from '$lib/api/client.js';

    /** @type {import('./$types').LayoutData} */
    export let data: LayoutData;

    // Determine active DM based on the child route param (if any)
    $: activeDmId = $page.params.user_id; // user_id is used for DM routes in our structure
    
    // Use data potentially merged from parent layouts
    $: dms = data.dms || []; 
    $: currentUser = data.currentUser; // Get currentUser from parent layout data

    // Filter DMs to ensure correct type before iterating
    $: validDms = dms.filter(dm => dm && (dm.type === 'DM' || dm.type === 'GROUP'));

    // Find the details of the currently viewed DM conversation
    $: currentDmDetails = activeDmId ? validDms.find(dm => dm.id === activeDmId) : undefined;

    // Helper to create a mock Member object for a DM partner
    function createDmPartnerMember(dm: DirectMessageConversation): Member | null {
        if (!dm || dm.type !== 'DM') return null;
        // Assuming 1-on-1 DM, recipientIds[0] might be needed if we stored it
        return {
            id: dm.id, // Use the conversation ID as the mock user ID here
            name: dm.name,
            avatarUrl: dm.iconUrl,
            status: 'online', // Ensure status matches the literal type
        };
    }

</script>

<div class="flex h-full w-full">
    <!-- DM Sidebar -->
    <nav class="channels-sidebar flex flex-col bg-gray-750 w-60 flex-shrink-0">
        <!-- Header/Search (Placeholder) -->
        <div class="p-3 h-12 flex items-center shadow-md flex-shrink-0">
            <input type="search" placeholder="Find or start a conversation" class="w-full bg-gray-900 px-2 py-1 rounded text-sm placeholder-gray-400 text-gray-200 focus:outline-none" />
        </div>

        <!-- DM List Area -->
        <div class="flex-grow overflow-y-auto pt-2 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            <!-- Friends Link -->
            <a href="/app/me" class="flex items-center p-2 mx-2 my-0.5 rounded-md cursor-pointer group transition-colors duration-100 ease-in-out hover:bg-gray-700/50 {activeDmId === undefined ? 'bg-gray-650' : ''}">
                <svg class="w-6 h-6 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
                <span class="text-sm font-medium text-gray-200 group-hover:text-gray-100">Friends</span>
            </a>
             <h3 class="px-4 pt-4 pb-1 text-xs font-semibold uppercase text-gray-400">Direct Messages</h3>
            {#if validDms.length > 0}
                {#each validDms as dm (dm.id)}
                    {@const isActive = activeDmId === dm.id}
                    <DirectMessageLink dm={dm as import('$lib/api/dms.js').DirectMessageConversation} active={isActive} {currentUser} />
                {/each}
            {:else if 'error' in data && data.error}
                <p class="text-center text-red-400 p-4">Error loading DMs: {typeof data.error === 'object' && 'message' in data.error ? data.error.message : 'Unknown error'}</p>
            {:else}
                <p class="px-4 text-sm text-gray-500">No direct messages yet.</p>
            {/if}
        </div>

        <!-- Pass currentUser to UserArea -->
        <UserArea user={currentUser} />
    </nav>

    <!-- Main Content Area for /app/me/* routes -->
    <main class="main-content bg-gray-600 flex-grow">
        <slot /> <!-- Renders +page.svelte for /app/me or /app/me/[user_id] -->
    </main>

    <!-- DM User List Sidebar -->
    <aside class="user-list-sidebar flex flex-col w-60 flex-shrink-0 bg-gray-750">
         {#if activeDmId && currentDmDetails}
            <!-- Header - e.g., "Members" or DM Partner Name -->
             <div class="p-3 h-12 flex items-center shadow-md flex-shrink-0 border-l border-gray-800">
                <h3 class="font-semibold text-white truncate">
                    {currentDmDetails.type === 'GROUP' ? 'Members' : currentDmDetails.name}
                </h3>
            </div>

            <!-- User List Area -->
            <div class="flex-grow overflow-y-auto p-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent border-l border-gray-800">
                {#if currentDmDetails.type === 'GROUP' && currentDmDetails.members}
                    <h3 class="px-1.5 pt-4 pb-1 text-xs font-semibold uppercase text-gray-400">Online — {currentDmDetails.members.length}</h3>
                    {#each currentDmDetails.members as member (member.id)}
                        {@const memberData: Member = { id: member.id, name: member.name, avatarUrl: null, status: 'online'} }
                        <UserListItem member={memberData} />
                    {/each}
                    <!-- TODO: Add offline grouping later -->
                {:else if currentDmDetails?.type === 'DM'}
                     {@const partnerMember = currentDmDetails ? createDmPartnerMember(currentDmDetails as DirectMessageConversation) : null}
                     {#if partnerMember}
                         <h3 class="px-1.5 pt-4 pb-1 text-xs font-semibold uppercase text-gray-400">Online — 1</h3>
                         <UserListItem member={partnerMember} />
                     {/if}
                {:else}
                    <p class="text-gray-400 p-2 text-sm">No member details available.</p>
                {/if}
            </div>
        {:else if activeDmId}
            <!-- Placeholder/Loading for User List -->
            <div class="p-3 h-12 flex items-center shadow-md flex-shrink-0 border-l border-gray-800">
                 <div class="h-5 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
            <div class="flex-grow overflow-y-auto p-1 space-y-1 border-l border-gray-800">
                <div class="p-2 space-y-3">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                        <div class="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                 </div>
            </div>
        {:else}
            <!-- Message shown when no DM is selected (e.g., on /app/me itself) -->
             <div class="flex items-center justify-center h-full text-center text-gray-400 text-sm p-4 border-l border-gray-800">
                Select a conversation to see details.
            </div>
        {/if}
    </aside>

</div>

<style>
    .channels-sidebar {
      width: 240px;
    }
    /* Darker background for DM sidebar */
    .bg-gray-750 {
        background-color: #2f3136;
    }
     /* Different scrollbar colors for DM list */
     .scrollbar-thumb-gray-800 {
        scrollbar-color: #202225 transparent;
    }
    .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb {
        background-color: #202225;
    }
    .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb:hover {
        background-color: #2f3136;
    }

    /* Active state for DM link */
    .bg-gray-650 {
        background-color: rgba(79, 84, 92, 0.6);
    }
    /* Slightly different background for the main content area in /me */
    .main-content.bg-gray-600 {
        background-color: #36393f;
    }

    .user-list-sidebar {
        /* Inherits base styles, add specifics if needed */
        background-color: #2f3136; /* Match channel sidebar color maybe? */
    }
</style> 