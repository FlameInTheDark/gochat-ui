<!-- src/lib/components/MessageItem.svelte -->
<script lang="ts">
    import type { Message } from '$lib/api/messages.js'; // Assuming Message type is defined here

    export let message: Message;

    // TODO: Add prop to indicate if message is from current user for potential styling diffs
    // export let isCurrentUser: boolean = false;

    // Basic date formatting (can be enhanced)
    function formatTimestamp(isoString: string): string {
        const date = new Date(isoString);
        // Simple time format for now
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    // Check if the message is just a single emoji (basic check, might need refinement for complex emojis)
    $: isSingleEmoji = message.content.trim().length === 2 && /\p{Emoji}/u.test(message.content.trim());

</script>

<div 
    data-message-id={message.id}
    data-user-id={message.authorId} 
    class="flex items-start space-x-3 py-1 hover:bg-gray-700/30 px-4 rounded group"
>
     <div class="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 mt-1">
         {#if message.authorAvatarUrl}
            <img src={message.authorAvatarUrl} alt="{message.authorName}\'s avatar" class="w-full h-full rounded-full object-cover" />
         {:else}
            <!-- Placeholder/Default Avatar -->
             <div class="w-full h-full rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-xl">
                 {message.authorName.charAt(0).toUpperCase()}
             </div>
         {/if}
     </div>
     <div class="flex-grow">
         <div class="flex items-baseline space-x-2">
             <span class="font-semibold text-white hover:underline cursor-pointer">{message.authorName}</span>
             <span class="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
             {#if message.edited}
                 <span class="text-xs text-gray-500">(edited)</span>
             {/if}
         </div>
         <p 
            class="text-gray-200 whitespace-pre-wrap break-words {isSingleEmoji ? 'text-5xl' : ''}"
         >
            {message.content}
         </p>
         <!-- Add reactions/reply button later -->
     </div>
      <!-- Add message actions (edit/delete) on hover later -->
      <!-- <div class="ml-auto opacity-0 group-hover:opacity-100">... actions ...</div> -->
</div> 