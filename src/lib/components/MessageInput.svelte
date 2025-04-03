<script lang="ts">
    import { m } from '$lib/paraglide/messages.js';
    import { createEventDispatcher, onMount } from 'svelte';
    // import 'emoji-picker-element/database'; // No longer needed here, handled by AppOverlays
    import { showEmojiPicker } from '$lib/stores/overlayStore.js'; // Import specific function

    export let channelName = 'channel'; // For the placeholder

    let messageContent = '';
    // let showEmojiPicker = false; // Remove local state for picker visibility
    let inputElement: HTMLTextAreaElement; // Reference to the textarea
    let emojiButtonElement: HTMLButtonElement; // Reference to the emoji button
    const dispatch = createEventDispatcher();

    function handleSubmit() {
        if (!messageContent.trim()) return; // Don't send empty messages

        console.log(`Sending message: ${messageContent}`);
        // Dispatch an event with the message content
        dispatch('sendMessage', { content: messageContent });

        // Clear the input
        messageContent = '';
    }

    // Handle emoji selection (Callback for the store)
    function insertEmoji(emoji: string) {
        if (!inputElement) return; // Guard against element not being ready

        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        messageContent = messageContent.slice(0, start) + emoji + messageContent.slice(end);

        // Move cursor after the inserted emoji
        requestAnimationFrame(() => {
            inputElement.focus();
            inputElement.selectionStart = inputElement.selectionEnd = start + emoji.length;
        });
    }

    // Open emoji picker using the store
    function openEmojiPicker() {
        console.log('Emoji button clicked, attempting to show picker via store...', { button: emojiButtonElement });
        if (!emojiButtonElement) return;
        showEmojiPicker(emojiButtonElement, insertEmoji); // Call imported function directly
    }

    /** @param {KeyboardEvent} event */
    function handleKeydown(event: KeyboardEvent) {
        // Submit on Enter unless Shift is pressed
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent newline
            handleSubmit();
        }
    }

    // Function to auto-resize textarea
    function autoResize(event: Event | HTMLTextAreaElement) {
        const element = event instanceof Event ? event.target as HTMLTextAreaElement : event;
        if (!element) return;
        element.style.height = 'auto'; // Temporarily shrink
        element.style.height = `${element.scrollHeight}px`; // Grow to content height (respects max-h via CSS)
    }

    onMount(() => {
        // Initial resize check if needed
        if (inputElement) {
            autoResize(inputElement);
        }
    });

    // TODO: Add file upload button, emoji picker, etc.
</script>

<div class="px-3 py-2 bg-gray-650 flex items-center"> 

    <!-- Input Area Wrapper (Looks like the input field) -->
    <div class="relative flex-grow bg-gray-700 rounded-lg flex items-center">
        
        <!-- Attachment button (Positioned absolutely inside the wrapper on the left) -->
        <button
            aria-label="Attach File"
            class="absolute left-2 top-1/2 transform -translate-y-1/2 w-7 h-7 text-gray-400 hover:text-gray-200"
        >
            <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clip-rule="evenodd"></path></svg>
        </button>

        <textarea
            bind:value={messageContent}
            bind:this={inputElement}
            on:keydown={handleKeydown}
            on:input={autoResize}
            rows="1"
            style="height: auto;"
            class="w-full bg-transparent border-none rounded-lg pl-10 pr-10 py-2.5 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent max-h-40"
            placeholder={`Message #${channelName}`}
        ></textarea>

        <!-- Emoji button (Positioned absolutely inside the wrapper on the right) -->
         <button
            type="button"
            bind:this={emojiButtonElement}
            on:click={openEmojiPicker}
            aria-label="Select Emoji"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 text-gray-400 hover:text-gray-200"
         >
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a.75.75 0 10-1.06-1.06 3.5 3.5 0 01-4.95 0 .75.75 0 10-1.06 1.06 5 5 0 007.07 0z" clip-rule="evenodd"/></svg>
        </button>
    </div>

    <!-- Optional: Send button if textarea is not empty -->
    <!-- {#if messageContent.trim()}
        <button on:click={handleSubmit} class="ml-3 text-blue-500 hover:text-blue-400">
            Send
        </button>
    {/if} -->
</div>

<style>
    /* Use hex codes for scrollbar colors */
    textarea {
        scrollbar-width: thin;
        scrollbar-color: #4B5563 #374151; /* gray-600 thumb, gray-700 track */
    }
    textarea::-webkit-scrollbar {
        width: 6px;
    }
    textarea::-webkit-scrollbar-track {
        background: #374151; /* gray-700 */
        border-radius: 10px;
    }
    textarea::-webkit-scrollbar-thumb {
        background-color: #4B5563; /* gray-600 */
        border-radius: 10px;
    }

    /* Remove emoji-picker styles from here */

</style> 