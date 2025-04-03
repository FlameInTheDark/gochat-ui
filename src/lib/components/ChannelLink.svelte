<script lang="ts">
    // Remove incorrect imports
    // import type { Channel } from '$lib/api/types'; // Adjust import as needed
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    // import { getChannelIcon } from '$lib/utils';

    // Give channel a default value
    /** @type {{id: string, name: string, type: 'text' | 'voice', unread?: boolean} | null} Channel data */
    export let channel: {id: string, name: string, type: 'text' | 'voice', unread?: boolean} | null = null;
    /** @type {string} The server ID (used for constructing the link) */
    export let serverId: string;

    function navigate() {
        // Ensure serverId and channel.id are valid before navigating
        if(serverId && channel?.id) {
            goto(`/app/${serverId}/${channel.id}`);
        } else {
            console.error('Missing serverId or channel.id for navigation', { serverId, channelId: channel?.id });
        }
    }

    // Define reactive variables, but calculate inside the #if block or guard access
    let isActive: boolean = false;
    let fontWeightClass: string = 'text-gray-400';
    let hoverBgClass: string = 'hover:bg-gray-700';
    let activeBgClass: string = 'hover:text-gray-200';

    $: {
        if (channel) {
            isActive = $page.params.channelId === channel.id;
            fontWeightClass = channel.unread && !isActive ? 'font-semibold text-white' : 'text-gray-400';
            hoverBgClass = isActive ? '' : 'hover:bg-gray-700';
            activeBgClass = isActive ? 'bg-gray-650 text-white' : 'hover:text-gray-200';
        } else {
            // Reset to defaults if channel becomes undefined
            isActive = false;
            fontWeightClass = 'text-gray-400';
            hoverBgClass = 'hover:bg-gray-700';
            activeBgClass = 'hover:text-gray-200';
        }
    }

    // Restore simple icon logic
    // $: iconComponent = getChannelIcon(channel.type);

</script>

{#if channel}
<!-- Use a button for better semantics and accessibility if it triggers navigation -->
<button 
    type="button"
    data-channel-id={channel.id} 
    data-channel-type="server"
    class="channel-link w-full flex items-center px-2 py-1 rounded cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-100 {
        isActive ? 'bg-gray-600 text-white' : ''
    }"
    on:click={navigate}
    aria-current={isActive ? 'page' : undefined}
    title={channel.name}
>
    <!-- Restore original icon logic -->
    <span class="mr-1.5 flex-shrink-0 {
        isActive ? 'text-gray-300' : 'text-gray-500'
    } group-hover:text-gray-400">
        {#if channel.type === 'text'}
            #
        {:else if channel.type === 'voice'}
            🔊 <!-- Or use an SVG icon -->
        {/if}
    </span>
    <span class="truncate text-sm font-medium flex-grow text-left {fontWeightClass}">
        {channel.name}
    </span>
     <!-- TODO: Add indicators for unread messages or mentions -->
</button>
{/if}

<style>
    /* Add any specific styles for the link if needed */
    .channel-link:focus-visible {
        outline: 2px solid blue;
        outline-offset: 1px;
    }
    .channel-link {
         /* Ensure text doesn't wrap weirdly */
        white-space: nowrap;
        overflow: hidden;
    }
</style> 