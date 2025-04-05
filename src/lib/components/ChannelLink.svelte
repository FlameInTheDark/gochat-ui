<script lang="ts">
    // Remove incorrect imports
    // import type { Channel } from '$lib/api/types'; // Adjust import as needed
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    // import { getChannelIcon } from '$lib/utils';
    import * as m from '$lib/paraglide/messages.js';
    import type { Channel } from '$lib/types.d.ts'; // <-- Add extension
    import { ChannelType } from '$lib/enums'; // <-- Import from enums.ts (no extension needed)
    import JSONBig from 'json-bigint'; // <-- Import JSONBig
    import { overlayManagerStore } from '$lib/stores/overlayManagerStore'; // Import store
    import type { MenuItem } from '$lib/stores/contextMenuStore'; // Import type
    import { deleteChannel } from '$lib/api/channels.js'; // Import API

    // Use $props for runes mode
    const { 
        channel, 
        serverId, 
        active = false,
        onDeleteSuccess // Add callback prop
    } = $props<{ 
        channel: Channel; // <-- Use the imported Channel type
        serverId: string | null; // Allow null from ChannelList
        active?: boolean; 
        onDeleteSuccess: () => void; // Define prop type
    }>();

    // Derive directly from props
    const serverIdBigInt = $derived(serverId ? BigInt(serverId) : null);
    const channelIdString = $derived(channel.id.toString());
    const href = $derived(serverId ? `/app/${serverId}/${channelIdString}` : '#');

    function handleClick(event: MouseEvent) {
        if (active || !serverId) { // Don't navigate if active or serverId is null
            event.preventDefault();
            return;
        }
        goto(href);
    }

    // Use $derived with an IIFE to immediately calculate the value
    const iconContent = $derived(
        (() => {
            switch (Number(channel.type)) {
                case ChannelType.GUILD_TEXT:
                case ChannelType.GUILD_ANNOUNCEMENT:
                    return '#';
                case ChannelType.GUILD_VOICE:
                    return '🔊'; 
                default:
                    return '?';
            }
        })() // Immediately invoke the function
    );

    function handleContextMenu(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation(); // Prevent list context menu

        if (!serverIdBigInt) return;

        const channelIdForAction = channel.id;

        const items: MenuItem[] = [
            {
                label: 'Edit Channel',
                action: () => console.log('Edit channel:', channelIdForAction)
            },
            {
                label: 'Delete Channel',
                danger: true,
                action: () => { // Make it synchronous now
                    // Define the actual delete logic separately
                    const performDelete = async () => {
                        try {
                            await deleteChannel(serverIdBigInt, channelIdForAction);
                            console.log(`Channel ${channelIdForAction} deleted`);
                            const isActive = $page.params.channel_id === channelIdString;
                            onDeleteSuccess(); // Refresh list
                            if (isActive && serverId) {
                                console.log("[ChannelLink] Active channel deleted. Navigating...");
                                goto(`/app/${serverId}`);
                            }
                        } catch (err) {
                            console.error(`Failed to delete channel ${channelIdForAction}:`, err);
                            alert(`Error deleting channel: ${err instanceof Error ? err.message : 'Unknown error'}`);
                        }
                    };

                    // Show the confirmation modal
                    console.log("[ChannelLink] Attempting to show ConfirmDeleteChannelModal");
                    overlayManagerStore.showConfirmDeleteChannelModal({
                        channelName: channel.name,
                        onConfirm: performDelete // Pass the delete logic as the callback
                    });
                }
            }
        ];

        overlayManagerStore.showContextMenu({
            position: { x: event.clientX, y: event.clientY },
            items,
            // Pass context if needed by actions later
            // contextData: { channelId, serverId: serverIdBigInt }
        });
    }

</script>

{#if channel}
<!-- Use a button for better semantics and accessibility if it triggers navigation -->
<a 
    {href} 
    onclick={handleClick}
    oncontextmenu={handleContextMenu}
    class="channel-link group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-100 ease-in-out"
    class:active="{active}" 
    aria-current={active ? 'page' : undefined}
    title={channel.name}
    data-channel-id={channelIdString}
>
    <!-- Restore original icon logic -->
    <span 
        class="channel-icon mr-1.5 flex-shrink-0 w-5 text-center {active ? 'text-gray-100' : 'text-gray-400 group-hover:text-gray-300'}"
    >
        {iconContent}
    </span>
    <span 
        class="flex-1 truncate {active ? 'text-white' : 'text-gray-300 group-hover:text-white'}"
    >
        {channel.name}
    </span>
     <!-- TODO: Add indicators for unread messages or mentions -->
</a>
{/if}

<style>
    /* Add any specific styles for the link if needed */
    .channel-link {
        color: #8e9297; /* Default text color */
    }
    .channel-link:hover,
    .channel-link:focus {
        background-color: #3a3c43;
        color: #dcddde;
    }
    .channel-link.active {
        background-color: #3c3f45; 
        color: #ffffff;
    }
    .channel-link.active .channel-icon {
        color: #ffffff; /* Make icon white when active */
    }
    .channel-link:focus-visible {
        outline: 2px solid rgb(96 165 250); /* Tailwind blue-400 */
        outline-offset: -1px;
    }
    .channel-link {
         /* Ensure text doesn't wrap weirdly */
        white-space: nowrap;
        overflow: hidden;
    }
</style> 