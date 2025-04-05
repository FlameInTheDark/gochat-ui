<script lang="ts">
    // import ChatMessage from '$lib/components/ChatMessage.svelte';
    import MessageList from '$lib/components/MessageList.svelte';
    import MessageInput from '$lib/components/MessageInput.svelte';
    // import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores'; // <-- Add page store
    import * as m from '$lib/paraglide/messages.js'; // Import messages
    import { selectedChannelStore } from '$lib/stores/selectedChannelStore.js'; // Import the store
    import { messageStore, setInitialMessagesForChannel } from '$lib/stores/messageStore'; // <-- Import store & setter
    import type { Message } from '$lib/types'; // Ensure Message is imported directly
    import { getChannelMessages } from '$lib/api/messages'; // <-- Re-import API function
    import JSONBig from 'json-bigint'; // <-- Import json-bigint
    import { webSocketStatus } from '$lib/stores/websocketStore'; // Import WS status store
    import { sendSubscriptionUpdate } from '$lib/services/websocketService'; // Import subscription function

    // Get IDs reactively from route parameters
    const serverId = $derived($page.params.server_id);
    const channelId = $derived($page.params.channel_id);
    const channelIdStr = $derived(channelId || '');
    const channelIdBigInt = $derived(channelId ? BigInt(channelId) : null); // BigInt for API call

    // Component state for loading/error (keep for now, maybe manage differently)
    let isLoadingMessages = $state(true); // Start loading true again
    let pageError = $state<Error | null>(null); 

    // Get channel details reactively from the store
    const channelDetails = $derived($selectedChannelStore);
    const channelNameForDisplay = $derived(channelDetails?.name || channelId || 'Channel');
    const channelTopicForDisplay = $derived(channelDetails?.topic || null);

    // Derive messages for the current channel from the store
    // Use $derived.by for explicit derivation logic
    const messages = $derived.by(() => {
        const storeValue = $messageStore; // Get the current value of the store
        return storeValue[channelIdStr] || []; // Access the specific channel's messages
    });

    // Effect to fetch INITIAL messages when channelId changes
    $effect(() => {
        const currentChannelIdBigInt = channelIdBigInt;

        if (currentChannelIdBigInt) {
            isLoadingMessages = true;
            pageError = null;

            (async () => {
                try {
                    let apiResponseMessages = await getChannelMessages(currentChannelIdBigInt);

                    const transformedMessages: Message[] = (apiResponseMessages || []).map((processedMsg: any) => {
                        // Updated validation: Check flattened authorId
                        if (!processedMsg || processedMsg.id == null || processedMsg.channel_id == null || processedMsg.authorId == null) {
                             console.warn('[+page.svelte effect TRY] Skipping invalid message from getChannelMessages (missing required fields):', processedMsg);
                             return null;
                        }
                        // Directly use the already processed fields from getChannelMessages
                        // No need for BigInt conversion here as it's already done.
                        // Use the timestamp and attachments provided by getChannelMessages.
                        return {
                            id: processedMsg.id, // Already BigInt
                            channel_id: processedMsg.channel_id, // Already BigInt
                            content: processedMsg.content ?? '',
                            authorId: processedMsg.authorId, // Already BigInt
                            authorName: processedMsg.authorName ?? 'Unknown User',
                            authorAvatarUrl: processedMsg.authorAvatarUrl, // Use value from getChannelMessages (currently null)
                            timestamp: processedMsg.timestamp, // Use timestamp from getChannelMessages
                            attachments: processedMsg.attachments || [], // Use transformed attachments from getChannelMessages
                        };
                        // Removed the previous try/catch for BigInt conversion as it's no longer needed here
                    }).filter((msg: Message | null): msg is Message => msg !== null);

                    if (transformedMessages.length > 0) {
                        transformedMessages.sort((a: Message, b: Message) => {
                            if (a.id < b.id) return -1;
                            if (a.id > b.id) return 1;
                            return 0;
                        });
                    }

                    setInitialMessagesForChannel(currentChannelIdBigInt, transformedMessages);
                } catch (err) {
                    console.error(`[+page.svelte effect CATCH] Error fetching/processing initial messages for channel ${currentChannelIdBigInt}:`, err);
                    if (err instanceof Error) {
                        pageError = err;
                    } else {
                        pageError = new Error('Failed to load messages due to an unknown error.');
                    }
                    setInitialMessagesForChannel(currentChannelIdBigInt, []);
                } finally {
                    isLoadingMessages = false;
                }
            })();
        } else {
            isLoadingMessages = false;
            pageError = null;
        }
    });

    // Effect to subscribe to WebSocket channel
    $effect(() => {
        const currentStatus = $webSocketStatus;
        const currentChannelId = channelIdBigInt;

        if (currentStatus === 'connected' && currentChannelId) {
            sendSubscriptionUpdate({ channel: currentChannelId });
        }
    });

    // Remove scroll-related variables and functions
    // let messageListElement: HTMLElement | null = null;
    // let timeoutId: ReturnType<typeof setTimeout>;
    // function scrollToBottom(behavior: ScrollBehavior = 'auto'): void { ... }
    // onMount(() => { ... });
    // onDestroy(() => { ... });

    // Remove handleSendMessage - Input component handles sending now
    // function handleSendMessage(event: CustomEvent<{content: string}>): void { ... }

</script>

<div class="flex flex-col h-full">
    <!-- Channel Header -->
    <header class="p-3 h-12 flex items-center shadow-md flex-shrink-0 border-b border-gray-800">
        <div class="flex items-center mr-auto">
            <svg class="w-6 h-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
            <h1 class="font-semibold text-white truncate mr-2">{channelNameForDisplay}</h1>
            {#if channelTopicForDisplay}
                 <div class="hidden md:block w-px h-6 bg-gray-600 mx-2"></div>
                 <p class="text-sm text-gray-400 truncate hidden md:block">{channelTopicForDisplay}</p>
            {/if}
        </div>
        
        <!-- Search Bar -->
        <div class="relative ml-4">
            <input type="search" placeholder={m.search_placeholder()} class="w-36 bg-gray-900 px-2 py-1 rounded text-sm placeholder-gray-400 text-gray-200 focus:outline-none focus:w-48 transition-all duration-200 ease-in-out" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                 <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
            </div>
        </div>

        <!-- Other Header Icons (TODO) -->
        <!-- <button class="ml-2 text-gray-400 hover:text-gray-200">...</button> -->
    </header>

    <!-- Messages Area -->
    <div 
        class="flex-grow flex flex-col min-h-0"
        data-channel-id={channelId}
    >
        <MessageList
            messages={messages}
            error={pageError}
            isLoading={isLoadingMessages}
            welcomeMessage={m.welcome_channel_message({ channelName: channelNameForDisplay })}
        />
    </div>

    <!-- Message Input -->
    <div class="flex-shrink-0">
        <MessageInput 
            channelName={channelNameForDisplay} 
            channelId={channelId}
        />
    </div>
</div>

<style>
    /* Inherit scrollbar styles from layout */
</style>
