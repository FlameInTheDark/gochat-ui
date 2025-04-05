<script lang="ts">
    // Removed Paraglide import - No static text here now
	import { createEventDispatcher, onMount, tick } from 'svelte';
    // import { showEmojiPicker } from '$lib/stores/overlayStore.js'; // REMOVE OLD
    import { overlayManagerStore } from '$lib/stores/overlayManagerStore'; // ADD NEW
    import * as m from '$lib/paraglide/messages.js'; // Import messages
    import { sendMessage, requestAttachmentUpload } from '$lib/api/messages.js'; // Ensure sendMessage is imported only once
    import { uploadFile } from '$lib/api/client.js'; // Import uploadFile
    import type { AttachmentUpload } from '$lib/types'; // Import AttachmentUpload type

    // Use $props for channelName and channelId
    const { channelName = 'channel', channelId } = $props<{
        channelName?: string;
        channelId: string; // Required prop
    }>();

    let inputElement: HTMLTextAreaElement; // Reference to the textarea
    let emojiButtonElement: HTMLButtonElement; // Reference to the emoji button
    let fileInputElement: HTMLInputElement; // Add ref for file input

    let messageContent = $state('');
    let isSending = $state(false);
    let sendError: string | null = $state(null);
    let pendingAttachments = $state<AttachmentUpload[]>([]); // State for pending uploads
    let uploadError: string | null = $state(null); // State for upload errors

    // Basic textarea auto-resize function (if missing)
    function adjustTextareaHeight() {
        if (inputElement) {
            inputElement.style.height = 'auto'; // Reset height
            inputElement.style.height = `${inputElement.scrollHeight}px`; // Set to scroll height
        }
    }

    // NEW: Handle file selection and upload
    async function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0 || !channelId) {
            return;
        }

        uploadError = null; // Clear previous errors
        const channelIdBigInt = BigInt(channelId);
        const filesToUpload = Array.from(input.files);
        // Optional: Add limit check here (e.g., max 5 files)

        // Process each file
        for (const file of filesToUpload) {
            // Optional: Add file size check here (e.g., max 10MB)
            console.log(`[MessageInput] Starting upload for: ${file.name}`);
            try {
                // 1. Request upload URL
                const fileInfo = { filename: file.name, fileSize: file.size };
                const uploadData: AttachmentUpload = await requestAttachmentUpload(channelIdBigInt, fileInfo);
                console.log(`[MessageInput] Got upload data for ${file.name}:`, uploadData);

                // --- Modify URL for local development ---
                let finalUploadUrl = uploadData.upload_url;
                try {
                    const originalUrl = new URL(uploadData.upload_url);
                    // Assuming local API/storage runs on localhost:80 based on .env
                    finalUploadUrl = `http://localhost:80${originalUrl.pathname}${originalUrl.search}`;
                    console.log(`[MessageInput] Modified upload URL to: ${finalUploadUrl}`);
                } catch (urlError) {
                    console.error("[MessageInput] Failed to parse or modify upload URL:", urlError);
                    // Proceed with original URL if parsing/modification fails?
                    // Or throw an error? For now, let's proceed with original.
                }
                // --- End URL modification ---

                // 2. Upload the file using the potentially modified URL
                await uploadFile(finalUploadUrl, file);
                console.log(`[MessageInput] Successfully uploaded ${file.name}`);

                // 3. Add to pending attachments state
                pendingAttachments = [...pendingAttachments, uploadData];

            } catch (err: any) {
                console.error(`[MessageInput] Failed to upload ${file.name}:`, err);
                uploadError = `Failed to upload ${file.name}: ${err.message || 'Unknown error'}`;
                // Stop processing further files on error?
                break; 
            }
        }

        // Clear the file input value so the same file can be selected again if needed
        input.value = '';
    }

    async function handleSubmit() {
        const content = messageContent.trim();
        const attachmentIds = pendingAttachments.map(att => att.id);

        // Allow send if content exists OR there are attachments
        if ((!content && attachmentIds.length === 0) || isSending || !channelId) {
            return;
        }

        console.log(`[MessageInput handleSubmit] Content: "${content}", Attachments: ${attachmentIds.join(', ')}`);

        isSending = true;
        sendError = null;
        uploadError = null; // Clear upload error on new send attempt

        try {
            const newMessage = await sendMessage(BigInt(channelId), content, attachmentIds); 
            messageContent = ''; 
            pendingAttachments = []; // Clear pending attachments on success
            await tick(); 
            requestAnimationFrame(() => {
                adjustTextareaHeight(); 
                inputElement?.focus(); 
            });
        } catch (err) {
            sendError = (err instanceof Error) ? err.message : 'Failed to send message';
            console.error('Failed to send message:', err);
            requestAnimationFrame(() => {
                inputElement?.focus();
            });
        } finally {
            isSending = false;
        }
    }

    // Handle emoji selection (Callback for the store)
    function insertEmoji(emoji: string) {
        if (!inputElement) return; // Guard against element not being ready

        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        const text = inputElement.value;
        messageContent = text.slice(0, start) + emoji + text.slice(end);

        // Move cursor after the inserted emoji
        inputElement.selectionStart = inputElement.selectionEnd = start + emoji.length;
        inputElement.focus();
        adjustTextareaHeight(); // Adjust height after insertion
    }

    // Open emoji picker using the store
    function openEmojiPicker() {
        if (emojiButtonElement) { // Ensure the button element exists
            console.log("[MessageInput] Attempting to show emoji picker. Target:", emojiButtonElement);
            overlayManagerStore.showEmojiPicker({ 
                targetElement: emojiButtonElement, 
                onEmojiSelect: insertEmoji 
            });
        }
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
        adjustTextareaHeight(); // Initial height adjustment
    });

    // TODO: Add file upload button, emoji picker, etc.
</script>

<!-- Upload Area (Above the main input div) -->
{#if pendingAttachments.length > 0 || uploadError}
    <div class="px-3 pt-2 border-t border-gray-800">
        {#if uploadError}
            <p class="text-red-400 text-sm mb-2">Upload Error: {uploadError}</p>
        {/if}
        <div class="flex flex-wrap gap-2">
            {#each pendingAttachments as attachment (attachment.id)}
                <div class="bg-gray-600 p-1.5 rounded text-sm text-gray-200 flex items-center gap-2">
                    <span>{attachment.file_name}</span>
                    <button 
                        type="button"
                        onclick={() => pendingAttachments = pendingAttachments.filter(a => a.id !== attachment.id)}
                        aria-label={`Remove ${attachment.file_name}`}
                        class="text-gray-400 hover:text-white w-4 h-4"
                    >
                        &times;
                    </button>
                </div>
            {/each}
        </div>
    </div>
{/if}

<div class="px-3 py-2 bg-gray-650 flex items-center"> 

    <!-- Input Area Wrapper (Looks like the input field) -->
    <div class="relative flex-grow bg-gray-700 rounded-lg flex items-center">
        
        <!-- Attachment button -->
        <button
            type="button" 
            onclick={() => fileInputElement?.click()} 
            aria-label={m.attach_file_label()}
            class="absolute left-2 top-1/2 transform -translate-y-1/2 w-7 h-7 text-gray-400 hover:text-gray-200"
        >
            <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clip-rule="evenodd"></path></svg>
        </button>

        <!-- Hidden File Input -->
        <input 
            type="file"
            bind:this={fileInputElement}
            onchange={handleFileSelect}
            multiple 
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
            class="hidden"
        />

        <textarea
            bind:value={messageContent}
            bind:this={inputElement}
            onkeydown={handleKeydown}
            oninput={autoResize}
            rows="1"
            style="height: auto;"
            disabled={isSending}
            class="w-full bg-transparent border-none rounded-lg pl-10 pr-10 py-2.5 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent max-h-40"
            placeholder={m.message_placeholder({ channelName })}
        ></textarea>

        <!-- Emoji button (Positioned absolutely inside the wrapper on the right) -->
         <button
            type="button"
            bind:this={emojiButtonElement}
            onclick={openEmojiPicker}
            aria-label={m.select_emoji_label()}
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 text-gray-400 hover:text-gray-200"
         >
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a.75.75 0 10-1.06-1.06 3.5 3.5 0 01-4.95 0 .75.75 0 10-1.06 1.06 5 5 0 007.07 0z" clip-rule="evenodd"/></svg>
        </button>
    </div>

    {#if sendError}
        <p class="text-red-400 text-xs ml-2">{sendError}</p>
    {/if}

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