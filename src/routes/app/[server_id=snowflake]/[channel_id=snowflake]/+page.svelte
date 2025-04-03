<script lang="ts">
    // import ChatMessage from '$lib/components/ChatMessage.svelte';
    import MessageList from '$lib/components/MessageList.svelte';
    import MessageInput from '$lib/components/MessageInput.svelte';
    // import { onMount, onDestroy } from 'svelte';
    import type { PageData } from './$types';
    import type { Message } from '$lib/api/messages';

    export let data: PageData;

    let messages: Message[] = [];
    let channelName: string = '';
    let channelTopic: string = '';
    let serverId: string = '';
    let channelId: string = '';
    let pageError: Error | undefined;

    // Reactive statement to update state when `data` prop changes
    $: {
        console.log("Page data updated:", data);
        // Use type guards to safely access properties based on success/error state
        if ('messages' in data && Array.isArray(data.messages)) {
            messages = [...data.messages]; // Update messages on success
            pageError = undefined; // Clear any previous error
        } else if ('error' in data && data.error instanceof Error) {
            messages = []; // Clear messages on error
            pageError = data.error; // Set the error state
        } else {
             // Fallback/unexpected data shape
             messages = [];
             pageError = new Error("Unexpected data shape received from load function.");
        }
        // Update other details regardless of error/success (might be available even on error)
        channelName = ('channelName' in data && data.channelName) || (data.channelId || 'channel');
        channelTopic = ('channelTopic' in data && data.channelTopic) || "";
        serverId = data.serverId || "";
        channelId = data.channelId || "";

        // Scroll to bottom when data changes (if not an error state)
        if (!pageError) {
            // scrollToBottom();
        }
    }

    // Remove scroll-related variables and functions
    // let messageListElement: HTMLElement | null = null;
    // let timeoutId: ReturnType<typeof setTimeout>;
    // function scrollToBottom(behavior: ScrollBehavior = 'auto'): void { ... }
    // onMount(() => { ... });
    // onDestroy(() => { ... });

    // Handle sending a new message (client-side)
    function handleSendMessage(event: CustomEvent<{content: string}>): void {
        const content = event.detail.content;
        console.log(`Send message to channel ${channelId}:`, content);

        const newMessage: Message = {
            id: `temp-${Date.now().toString()}`,
            authorId: '555999999',
            authorName: 'CurrentUser',
            authorAvatarUrl: null,
            timestamp: new Date().toISOString(),
            content: content,
        };

        messages = [...messages, newMessage];
        // Scrolling is now handled by MessageList
        // scrollToBottom('smooth');
    }

</script>

<div class="flex flex-col h-full">
    <!-- Channel Header -->
    <header class="p-3 h-12 flex items-center shadow-md flex-shrink-0 border-b border-gray-800">
        <!-- Channel Name and Topic -->
        <div class="flex items-center mr-auto">
            <svg class="w-6 h-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
            <h1 class="font-semibold text-white truncate mr-2">{channelName}</h1>
            {#if channelTopic}
                 <div class="hidden md:block w-px h-6 bg-gray-600 mx-2"></div>
                 <p class="text-sm text-gray-400 truncate hidden md:block">{channelTopic}</p>
            {/if}
        </div>
        
        <!-- Search Bar -->
        <div class="relative ml-4">
            <input type="search" placeholder="Search" class="w-36 bg-gray-900 px-2 py-1 rounded text-sm placeholder-gray-400 text-gray-200 focus:outline-none focus:w-48 transition-all duration-200 ease-in-out" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                 <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
            </div>
        </div>

        <!-- Other Header Icons (TODO) -->
        <!-- <button class="ml-2 text-gray-400 hover:text-gray-200">...</button> -->
    </header>

    <!-- Message List -->
    <MessageList 
        messages={messages} 
        error={pageError} 
        welcomeMessage={`Welcome to #${channelName}!\nThis is the beginning of this channel.`}
    />

    <!-- Message Input -->
    <div class="flex-shrink-0">
        <MessageInput {channelName} on:sendMessage={handleSendMessage} />
    </div>
</div>

<style>
    /* Inherit scrollbar styles from layout */
</style>
