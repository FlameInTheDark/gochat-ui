<!-- src/lib/components/ChannelList.svelte -->
<script lang="ts">
    // --- Imports ---
    import { page } from '$app/stores'; // Needed for props derived from page
    import { getGuildChannels, createChannel } from '$lib/api/channels.js';
    import type { Channel } from '$lib/types.d.ts';
    import { ChannelType } from '$lib/enums';
    import { selectedChannelStore } from '$lib/stores/selectedChannelStore.js';
    import ChannelLink from '$lib/components/ChannelLink.svelte';
    import * as m from '$lib/paraglide/messages.js';
    import { sendSubscriptionUpdate } from '$lib/services/websocketService'; // <-- Import subscription function
    import { overlayManagerStore } from '$lib/stores/overlayManagerStore'; // Import overlay store
    import type { MenuItem } from '$lib/stores/contextMenuStore'; // Import MenuItem type
    import { onMount, onDestroy } from 'svelte'; // Import lifecycle hooks
    import { goto } from '$app/navigation'; // Import goto

    // --- Props --- 
    const { serverId, activeChannelId } = $props<{
        serverId: string | null; // Server ID can be null if none selected
        activeChannelId: string | null; // Active channel ID can be null
    }>();

    // --- Local Types ---
    type Snowflake = bigint;
    type ChannelTreeNode = 
        { type: 'uncategorized'; channels: Channel[] } | 
        { type: 'category'; category: Channel; channels: Channel[] };

    // --- State ---
    let loadedChannels: Channel[] = $state([]);
    let serverError = $state<Error | null>(null);
    let openCategories = $state(new Set<Snowflake>());
    let channelTree: ChannelTreeNode[] = $state([]);

    // --- Derived Values & Promises ---
    const serverIdBigInt = $derived(serverId ? BigInt(serverId) : null);
    const activeChannelIdBigInt = $derived(activeChannelId ? BigInt(activeChannelId) : null); // <-- Derive BigInt for channel
    const channelsPromise = $derived(serverIdBigInt ? getGuildChannels(serverIdBigInt) : Promise.resolve([]));

    // --- Effects ---
    // Effect to load channels
    $effect(() => {
        serverError = null;
        loadedChannels = []; 
        openCategories = new Set(); 
        
        const currentPromise = channelsPromise; 
        currentPromise
            .then(data => {
                console.log("[ChannelList load effect] Loaded Channels Data:", data);
                loadedChannels = data;
            })
            .catch(err => {
                console.error("[ChannelList load effect] Error loading channels:", err);
                serverError = err;
                loadedChannels = [];
            });
    });

    // Effect to group channels
    $effect(() => {
        if (loadedChannels.length === 0) {
            channelTree = [];
            openCategories = new Set();
            return;
        }
        console.log("[ChannelList group effect] Processing loaded channels:", loadedChannels);
        
        const categories = new Map<Snowflake, Channel>();
        const rootChannels: Channel[] = [];
        const childrenByParent = new Map<Snowflake, Channel[]>();
        const comparePositions = (a: Channel, b: Channel): number => {
            const posA = a.position ?? Infinity;
            const posB = b.position ?? Infinity;
            return Math.sign(Number(posA) - Number(posB));
        };

        for (const channel of loadedChannels) {            
            if (Number(channel.type) === ChannelType.GUILD_CATEGORY) {
                categories.set(channel.id, channel);
            } else if (channel.parent_id === null || channel.parent_id === undefined) {
                rootChannels.push(channel);
            } else {
                const children = childrenByParent.get(channel.parent_id) || [];
                children.push(channel);
                childrenByParent.set(channel.parent_id, children);
            }
        }
        console.log("[ChannelList group effect] Identified Categories Map:", categories);

        openCategories = new Set(categories.keys()); 

        for (const children of childrenByParent.values()) {
            children.sort(comparePositions);
        }

        const tree: ChannelTreeNode[] = [];

        rootChannels.sort(comparePositions);
        if (rootChannels.length > 0) {
            tree.push({ type: 'uncategorized', channels: rootChannels });
        }

        const sortedCategories = Array.from(categories.values()).sort(comparePositions);
        for (const category of sortedCategories) {
            const children = childrenByParent.get(category.id) || [];
            tree.push({ type: 'category', category, channels: children });
        }
        
        console.log("[ChannelList group effect] Final Channel Tree:", tree);
        channelTree = tree;
    });

    // Effect to subscribe to active channel
    $effect(() => {
        const currentChannelIdBigInt = activeChannelIdBigInt;
        if (currentChannelIdBigInt) {
            sendSubscriptionUpdate({ channel: currentChannelIdBigInt });
        } else {
            console.log(`[ChannelList $effect] Active channel ID is not yet available for subscription.`);
            // Optionally send update with null channel if needed when no channel selected
            // sendSubscriptionUpdate({ channel: null }); 
        }
    });

    // NEW: Effect to update the selected channel store
    $effect(() => {
        const currentChannels = loadedChannels;
        const currentActiveId = activeChannelIdBigInt;

        if (currentActiveId && currentChannels.length > 0) {
            const foundChannel = currentChannels.find(c => c.id === currentActiveId);
            selectedChannelStore.set(foundChannel || null);
        } else {
            // Clear the store if no channel is active or channels haven't loaded
            selectedChannelStore.set(null);
        }
    });

    // --- Helper Functions ---
    function toggleCategory(categoryId: Snowflake) {
        openCategories = new Set(openCategories.has(categoryId)
            ? [...openCategories].filter(id => id !== categoryId)
            : [...openCategories, categoryId]);
    }

    // NEW: Function to manually refresh channel list state
    async function refreshChannels() {
        if (!serverIdBigInt) return;
        console.log(`[ChannelList] Refreshing channels for server ${serverIdBigInt}...`);
        try {
            // No need to set loading state here as it's a background refresh
            const updatedChannels = await getGuildChannels(serverIdBigInt); 
            loadedChannels = updatedChannels;
        } catch (err) {
            console.error(`[ChannelList] Failed to refresh channels for server ${serverIdBigInt}:`, err);
             // Optionally update serverError state if needed
        }
    }

    // --- Context Menu Handler ---
    function handleListContextMenu(event: MouseEvent) {
        if (event.target !== event.currentTarget) {
            return;
        }
        event.preventDefault();
        if (!serverIdBigInt) return; 

        const handleSuccess = () => {
            // Change handleSuccess to just call refreshChannels
            refreshChannels();
        };

        const items: MenuItem[] = [
            {
                label: 'Create Channel', 
                action: () => {
                    overlayManagerStore.showCreateChannelModal({
                        serverId: serverIdBigInt,
                        onCreateSuccess: handleSuccess
                    });
                }
            },
            {
                label: 'Create Category', 
                action: () => {
                    overlayManagerStore.showCreateCategoryModal({
                        serverId: serverIdBigInt,
                        onCreateSuccess: handleSuccess
                    });
                }
            }
        ];
        overlayManagerStore.showContextMenu({ position: { x: event.clientX, y: event.clientY }, items });
    }

    // --- NEW: WebSocket Event Listener ---
    function handleWebSocketChannelCreate(event: CustomEvent) {
        if (!serverIdBigInt) return; // Ignore if no server selected

        const { guildId, newChannel } = event.detail;
        console.log("[ChannelList] Received ws:channel_create event", event.detail);

        // Check if the event is for the currently viewed server
        if (guildId === serverIdBigInt) {
            console.log("[ChannelList] Event matches current server. Refreshing channels.");
            refreshChannels(); // Refresh the list
        } else {
             console.log("[ChannelList] Event is for a different server. Ignoring.");
        }
    }

    function handleWebSocketChannelDelete(event: CustomEvent) {
        if (!serverIdBigInt) return; 

        const { guildId, channelId } = event.detail;
        console.log("[ChannelList] Received ws:channel_delete event", event.detail);

        if (guildId === serverIdBigInt) {
            console.log("[ChannelList] Event matches current server. Refreshing channels.");
            refreshChannels(); // Refresh the list first

            // Check if the deleted channel was the active one
            console.log(`[ChannelList] Checking deleted channel (${typeof channelId} ${channelId}) vs active channel (${typeof activeChannelIdBigInt} ${activeChannelIdBigInt})`);
            if (channelId === activeChannelIdBigInt) {
                console.log(`[ChannelList] Active channel was deleted. Navigating to server root: /app/${serverId}`);
                goto(`/app/${serverId}`); // Navigate to server page
            }
        } else {
             console.log("[ChannelList] Event is for a different server. Ignoring.");
        }
    }

    onMount(() => {
        document.addEventListener('ws:channel_create', handleWebSocketChannelCreate as EventListener);
        document.addEventListener('ws:channel_delete', handleWebSocketChannelDelete as EventListener);
    });

    onDestroy(() => {
        document.removeEventListener('ws:channel_create', handleWebSocketChannelCreate as EventListener);
        document.removeEventListener('ws:channel_delete', handleWebSocketChannelDelete as EventListener);
    });

</script>

<div 
    oncontextmenu={handleListContextMenu}
    class="channels-list flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
    role="region" 
    aria-label="Channels List" 
    
>
    {#if serverError}
        <p class="p-2 text-sm text-red-400">{m.error_loading_channels({ error: serverError.message })}</p>
    {:else if channelTree.length > 0}
        {#each channelTree as node}
            {#if node.type === 'category'}
                <div class="category-section mt-3 px-1">
                    <button 
                        onclick={() => toggleCategory(node.category.id)}
                        class="flex items-center w-full text-xs font-semibold uppercase text-gray-400 hover:text-gray-200 mb-1 px-1 rounded"
                    >
                        <svg class="w-3 h-3 mr-1 transform transition-transform duration-150 {openCategories.has(node.category.id) ? 'rotate-90' : ''}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                        <span>{node.category.name}</span>
                        <!-- Add channel button? -->
                        <span class="ml-auto text-lg font-light hover:text-white">+</span> 
                    </button>
                    {#if openCategories.has(node.category.id)}
                        {#each node.channels as channel (channel.id)}
                            <ChannelLink {channel} {serverId} active={activeChannelId === channel.id.toString()} onDeleteSuccess={refreshChannels} />
                        {/each}
                    {/if}
                </div>
            {:else if node.type === 'uncategorized'}
                <div class="uncategorized-section mt-1 px-1">
                     {#each node.channels as channel (channel.id)}
                         <ChannelLink {channel} {serverId} active={activeChannelId === channel.id.toString()} onDeleteSuccess={refreshChannels} />
                     {/each}
                </div>
            {/if}
        {/each}
    {:else if loadedChannels.length === 0}
        <!-- Maybe add a loading skeleton later -->
        <p class="p-2 text-sm text-gray-500">{m.no_channels()}</p>
    {/if}
</div> 