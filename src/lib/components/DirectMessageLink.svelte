<script lang="ts">
    // Define the type using TypeScript interface
    interface DirectMessageConversation {
        id: string;
        type: 'DM' | 'GROUP';
        recipientIds: string[];
        name: string;
        iconUrl: string | null;
        lastMessage: { content: string; timestamp: string } | null;
    }

    interface User {
        id: string;
        username: string;
        avatarUrl: string | null;
        // Add other relevant user fields if needed
    }

    // @ts-ignore - Removed, no longer needed
    export let dm: DirectMessageConversation;
    export let active = false; // Placeholder
    export let currentUser: User | null = null; // Accept currentUser

    // Calculate the ID of the *other* user in a 1-on-1 DM
    let otherUserId: string | null = null;
    $: {
        if (currentUser && dm && dm.type === 'DM' && dm.recipientIds.length > 0) {
            // Find the recipient ID that is *not* the current user
            otherUserId = dm.recipientIds.find(id => id !== currentUser.id) ?? null;
        } else {
            otherUserId = null;
        }
    }

    // TODO: Date formatting for last message
</script>

<a 
    data-channel-id={dm.id} 
    data-channel-type="dm"
    data-user-id={otherUserId}
    href={`/app/me/${dm.id}`}
    class="flex items-center p-2 mx-2 my-0.5 rounded-md cursor-pointer group transition-colors duration-100 ease-in-out hover:bg-gray-700/50 {active ? 'bg-gray-650' : ''}"
    aria-current={active ? 'page' : undefined}
>
    <!-- Avatar/Icon -->
    <div class="relative mr-2 flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            {#if dm.iconUrl}
                <img src={dm.iconUrl} alt="{dm.name}'s avatar" class="w-full h-full rounded-full object-cover" />
            {:else if dm.type === 'GROUP'}
                <!-- Default Group Icon -->
                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
            {:else}
                <!-- Fallback Initials for DM (Shouldn't happen if iconUrl is always set for DMs) -->
                 <span class="text-white text-sm font-bold select-none">{dm.name.substring(0, 1).toUpperCase()}</span>
            {/if}
        </div>
        <!-- TODO: Status indicator for DMs? -->
    </div>

    <!-- Name & Last Message -->
    <div class="flex-grow min-w-0">
        <span class="block truncate text-sm font-medium {active ? 'text-white' : 'text-gray-300'} group-hover:text-gray-100 transition-colors duration-100 ease-in-out">
            {dm.name}
        </span>
        {#if dm.lastMessage}
             <span class="block truncate text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-100 ease-in-out">
                {dm.lastMessage.content}
             </span>
        {/if}
    </div>

     <!-- TODO: Close DM button on hover -->
    <button 
        class="ml-auto pl-1 text-gray-500 hover:text-gray-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
        aria-label="Close direct message with {dm.name}"
        title="Close direct message with {dm.name}" 
        >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
    </button>
</a>

<style>
    /* Add specific styles if needed, potentially inheriting active styles */
    .bg-gray-650 {
        background-color: rgba(79, 84, 92, 0.6);
    }
</style> 