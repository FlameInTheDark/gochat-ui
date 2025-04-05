<!-- src/routes/app/me/[user_id=bigint]/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    // import MessageItem from '$lib/components/MessageItem.svelte'; // We'll create this soon
    import MessageList from '$lib/components/MessageList.svelte'; // Import MessageList
    import MessageInput from '$lib/components/MessageInput.svelte'; // Import MessageInput

    export let data: PageData;

    // Extract data passed from load function
    $: ({ dmDetails, messages, userId } = data);

    // Remove scroll logic for simplicity

    // Placeholder for sending message logic
    function handleSendMessage(event: CustomEvent<{ content: string }>) {
        // TODO: Implement actual message sending API call
    }

</script>

<div class="flex flex-col h-full">
    <!-- Header -->
    <header class="flex-shrink-0 p-3 h-12 flex items-center border-b border-gray-800 shadow-md">
        <div class="flex items-center">
            <!-- Maybe add avatar later -->
            <span class="text-xl font-semibold text-white ml-2">{dmDetails?.name || 'Direct Message'}</span>
            {#if dmDetails?.type === 'GROUP' && dmDetails.members}
                <span 
                    class="ml-2 text-sm text-gray-400 cursor-default" 
                    title={dmDetails.members.map(m => m.name).join(', ')}
                >
                    ({dmDetails.members.length} Members)
                </span>
            {/if}
        </div>
        <!-- Add other header controls like call buttons later -->
    </header>

    <!-- Message List START -->
    <div 
        class="flex-grow flex flex-col min-h-0"
        data-channel-id={dmDetails?.channelId}
    >
        <MessageList 
            messages={messages} 
            welcomeMessage={`This is the beginning of your direct message history with ${dmDetails?.name || 'this user'}.`}
        />
    </div>
    <!-- Message List END -->

    <!-- Message Input Area -->
    <div class="flex-shrink-0 border-t border-gray-800">
        <MessageInput 
            channelName={dmDetails?.name || 'DM'} 
            on:sendMessage={handleSendMessage} 
        />
    </div>
</div>

<style>
    /* Add specific styles if needed */
</style>
