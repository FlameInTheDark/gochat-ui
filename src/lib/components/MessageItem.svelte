<script lang="ts">
    import type { Message } from '$lib/types';
    import * as m from '$lib/paraglide/messages.js';
    import { getTimestampFromSnowflake } from '$lib/utils/snowflake.js';
    // Remove getUser import and related state
    // import { getUser } from '$lib/api/user.js';
    // import { onMount } from 'svelte';

    // Use $props() rune for component properties
    const { message } = $props<{ message: Message }>();

    // Remove author fetching state and logic
    // let author: User | null = null;
    // let authorError: Error | null = null;
    // let isLoadingAuthor = true;
    // $: (async () => { ... })(); 

    // TODO: Add prop to indicate if message is from current user for potential styling diffs
    // export let isCurrentUser: boolean = false;

    // Short time format
    function formatTimestamp(snowflakeId: bigint): string {
        const timestampMs = getTimestampFromSnowflake(snowflakeId);
        const date = new Date(timestampMs);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    // Full date and time format for tooltip
    function formatFullTimestamp(snowflakeId: bigint): string {
        const timestampMs = getTimestampFromSnowflake(snowflakeId);
        const date = new Date(timestampMs);
        // Example: Uses locale-specific date and time format
        return date.toLocaleString([], {
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: 'numeric', minute: '2-digit', second: '2-digit'
        });
    }

    // Use $derived for reactive values
    const isSingleEmoji = $derived(message.content.trim().length === 2 && /\p{Emoji}/u.test(message.content.trim()));
    const authorName = $derived(message.authorName);
    const avatarInitial = $derived((authorName && authorName.length > 0) 
                       ? authorName.charAt(0).toUpperCase() 
                       : '#');
    const authorAvatarUrl = $derived(message.authorAvatarUrl);
    const authorId = $derived(message.authorId);

</script>

<div 
    data-message-id={message.id.toString()}
    data-author-id={authorId.toString()}
    class="flex items-start space-x-3 py-1 hover:bg-gray-700/30 px-4 rounded group"
>
     <div class="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 mt-1">
         <!-- Remove loading state for author --> 
         {#if authorAvatarUrl}
            <img src={authorAvatarUrl} alt="{authorName}\'s avatar" class="w-full h-full rounded-full object-cover" />
         {:else}
             <div class="w-full h-full rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-xl">
                 {avatarInitial}
             </div>
         {/if}
     </div>
     <div class="flex-grow">
         <div class="flex items-baseline space-x-2">
             <span class="font-semibold text-white hover:underline cursor-pointer">{ authorName || 'Unknown User' }</span>
             <span 
                class="text-xs text-gray-400"
                title={formatFullTimestamp(message.id)}
             >
                {formatTimestamp(message.id)}
             </span>
             <!-- Edited status removed -->
         </div>
         <p 
            class="text-gray-200 whitespace-pre-wrap break-words {isSingleEmoji ? 'text-5xl' : ''}"
         >
            {message.content}
         </p>
         <!-- Add reactions/reply button later -->

         <!-- Render Attachments -->
         {#if message.attachments && message.attachments.length > 0}
            <div class="mt-2 flex flex-wrap gap-2">
                {#each message.attachments as attachment (attachment.url)} 
                    {@const isImage = attachment.content_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.filename)}
                    {#if isImage}
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" class="block max-w-xs max-h-64 rounded overflow-hidden">
                            <img 
                                src={attachment.url} 
                                alt={attachment.filename} 
                                title={attachment.filename} 
                                class="object-contain max-w-full max-h-full"
                                loading="lazy"
                            />
                        </a>
                    {:else}
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-3 py-1.5 rounded text-sm flex items-center gap-1.5">
                             <!-- Placeholder Icon -->
                             <svg class="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                            {attachment.filename}
                        </a>
                    {/if}
                {/each}
            </div>
         {/if}

     </div>
      <!-- Add message actions (edit/delete) on hover later -->
      <!-- <div class="ml-auto opacity-0 group-hover:opacity-100">... actions ...</div> -->
</div> 