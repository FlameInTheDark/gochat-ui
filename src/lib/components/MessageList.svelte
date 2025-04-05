<!-- src/lib/components/MessageList.svelte -->
<script lang="ts">
    import MessageItem from '$lib/components/MessageItem.svelte';
    import type { Message } from '$lib/types';
    import { onMount, afterUpdate } from 'svelte';

    export let messages: Message[] | undefined = undefined; // Array of messages
    export let isLoading: boolean = false; // Optional: To show loading state
    export let error: Error | null = null; // Optional: To show error state
    export let welcomeMessage: string = "This is the beginning of the message history."; // Default welcome

    let messagesContainer: HTMLDivElement;
    let shouldScrollToBottom = true;

    onMount(() => {
        // Scroll to bottom on initial load if there are messages
        if (messagesContainer && messages && messages.length > 0) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    afterUpdate(() => {
        // Scroll to bottom after messages update, unless user has scrolled up
        if (shouldScrollToBottom && messagesContainer) {
             messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        // Reset for next update
        shouldScrollToBottom = true;
    });

    function handleScroll() {
        if (!messagesContainer) return;
        // Check if user is scrolled near the bottom before new messages arrive
        const threshold = 50; // Pixels from bottom
        const isNearBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - threshold;

        // If user scrolls up significantly, don't auto-scroll on next update
        if (!isNearBottom) {
            shouldScrollToBottom = false;
        }
    }

</script>

<div
    bind:this={messagesContainer}
    on:scroll={handleScroll}
    class="flex-grow overflow-y-auto p-0 space-y-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent flex flex-col justify-end"
>
    {#if isLoading}
        <!-- Optional: Loading Skeleton -->
         <div class="p-4 space-y-4 animate-pulse">
             <div class="flex items-start space-x-3">
                <div class="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 mt-1"></div>
                <div class="flex-grow">
                    <div class="h-4 bg-gray-600 rounded w-1/4 mb-1"></div>
                    <div class="h-4 bg-gray-600 rounded w-3/4"></div>
                </div>
             </div>
              <div class="flex items-start space-x-3">
                <div class="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 mt-1"></div>
                <div class="flex-grow">
                    <div class="h-4 bg-gray-600 rounded w-1/5 mb-1"></div>
                    <div class="h-4 bg-gray-600 rounded w-1/2"></div>
                     <div class="h-4 bg-gray-600 rounded w-2/3 mt-1"></div>
                </div>
             </div>
         </div>
    {:else if error}
         <p class="text-center text-red-400 p-4">Error loading messages: {error.message}</p>
    {:else if messages && messages.length > 0}
         <!-- Add padding/margin container? Or handle in MessageItem -->
         <div class="pt-4 pb-2"> <!-- Add padding top/bottom -->
            {#each messages as message (message.id)}
                <MessageItem {message} />
            {/each}
         </div>
    {:else if messages}
         <p class="text-center text-gray-400 p-4">{welcomeMessage}</p>
    {:else}
         <!-- Should not happen if loading/error/messages are handled -->
         <p class="text-center text-gray-500 p-4">No messages to display.</p>
    {/if}
</div>

<style>
    /* Ensure the container takes up space */
    div {
        min-height: 100px; /* Example minimum height */
    }

    /* Explicit scrollbar styling to match DM list */
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