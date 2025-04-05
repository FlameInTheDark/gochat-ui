<script lang="ts">
    import { onMount } from 'svelte';

    // --- Props ---
    interface Props {
        messageContent: string;
        onConfirm: () => Promise<void>; // Mark as async
        onDismiss: () => void;
    }
    const { messageContent, onConfirm, onDismiss }: Props = $props();

    // --- State ---
    let isDeleting = $state(false);

    // --- Event Handlers ---
    async function handleConfirm() {
        isDeleting = true;
        try {
            await onConfirm(); 
            // Assuming successful onConfirm means we should dismiss
            onDismiss(); 
        } catch (error) {
            // Error should be handled within onConfirm (e.g., show alert)
            // We might just stay in the modal on error
            console.error("Error during message delete confirm callback:", error);
        } finally {
            // Only reset if modal didn't dismiss due to error
            isDeleting = false; 
        }
    }

    onMount(() => {
        console.log("[ConfirmDeleteMessageModal] Mounted.");
    });
</script>

<div class="bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md text-white">
    <h2 class="text-xl font-semibold mb-2">Delete Message</h2>
    <p class="text-gray-300 mb-1">
        Are you sure you want to delete this message?
    </p>
    <blockquote class="text-gray-400 border-l-4 border-gray-600 pl-3 py-1 mb-6 text-sm italic overflow-hidden text-ellipsis whitespace-nowrap">
        {messageContent}...
    </blockquote>

    <div class="flex justify-end gap-3">
        <button
            type="button"
            onclick={onDismiss}
            disabled={isDeleting}
            class="px-4 py-2 rounded bg-transparent text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            Cancel
        </button>
        <button
            type="button"
            onclick={handleConfirm}
            class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isDeleting}
        >
            {#if isDeleting}
                <span>Deleting...</span>
            {:else}
                Delete Message
            {/if}
        </button>
    </div>
</div> 