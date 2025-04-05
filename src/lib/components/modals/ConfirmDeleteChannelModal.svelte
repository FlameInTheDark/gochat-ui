<script lang="ts">
    import { onMount } from 'svelte';

    // --- Props ---
    interface Props {
        channelName: string;
        onConfirm: () => void;
        onDismiss: () => void;
    }
    const { channelName, onConfirm, onDismiss }: Props = $props();

    // --- State ---
    let isDeleting = $state(false);

    // --- Event Handlers ---
    async function handleConfirm() {
        isDeleting = true;
        try {
            // The actual API call is now in the callback
            await onConfirm(); 
            // Explicitly dismiss the modal after successful confirmation
            onDismiss(); 
        } catch (error) {
            // Error handling should be within the onConfirm callback
            // (which currently uses alert)
            // Modal stays open on error.
            console.error("Error during confirm callback:", error);
        } finally {
            // Only reset if modal didn't dismiss due to error
            isDeleting = false; 
        }
    }

    onMount(() => {
        console.log("[ConfirmDeleteChannelModal] Mounted.");
    });
</script>

<div class="bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md text-white">
    <h2 class="text-xl font-semibold mb-2">Delete Channel</h2>
    <p class="text-gray-300 mb-6">
        Are you sure you want to delete the channel <strong class="font-medium">#{channelName}</strong>? This action cannot be undone.
    </p>

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
                Delete Channel
            {/if}
        </button>
    </div>
</div> 