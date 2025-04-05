<script lang="ts">
    import { browser } from '$app/environment';
    import { overlayManagerStore } from '$lib/stores/overlayManagerStore'; 
    import type { OverlayState } from '$lib/stores/overlayManagerStore'; // Import the state type

    // Import the actual overlay components
    import CustomEmojiPicker from '$lib/components/CustomEmojiPicker.svelte';
    import ContextMenuOverlay from '$lib/components/ContextMenuOverlay.svelte';
    import CreateServerModal from '$lib/components/modals/CreateServerModal.svelte';
    import CreateChannelModal from '$lib/components/modals/CreateChannelModal.svelte';
    import CreateCategoryModal from '$lib/components/modals/CreateCategoryModal.svelte';
    import ConfirmDeleteChannelModal from '$lib/components/modals/ConfirmDeleteChannelModal.svelte'; // Import new modal
    import ConfirmDeleteMessageModal from '$lib/components/modals/ConfirmDeleteMessageModal.svelte'; // Import

    // Use $state for the local component state
    let currentOverlay = $state<OverlayState>({ type: null, context: null });

    // Log the overlay state whenever it changes
    $effect(() => {
        console.log("[OverlayManager] Component Effect Running. Subscribing to store...");
        const unsubscribe = overlayManagerStore.subscribe(newState => {
            console.log("[OverlayManager] Store updated. New State:", newState);
            currentOverlay = newState; // Update local state
        });

        // Cleanup function for the effect
        return () => {
            console.log("[OverlayManager] Component Effect Cleanup. Unsubscribing.");
            unsubscribe();
        };
    });

    // --- Modal Specific Handlers ---
    function handleBackdropClick(event: MouseEvent) {
        // Only dismiss if the click is directly on the backdrop (target is the div itself)
        if (event.target === event.currentTarget) {
            console.log("[OverlayManager] Backdrop clicked directly. Dismissing.");
            overlayManagerStore.dismiss(); // Call dismiss on the imported object
        }
    }

    function handleBackdropKeydown(event: KeyboardEvent) {
        // Dismiss on Escape key
        if (event.key === 'Escape') {
            console.log("[OverlayManager] Escape key pressed on backdrop. Dismissing.");
            overlayManagerStore.dismiss(); // Call dismiss on the imported object
        }
    }

    function stopPropagation(event: MouseEvent) {
        // Prevent clicks inside modal content from closing the modal via backdrop handler
        event.stopPropagation();
    }

</script>

{#if browser}
    {#if currentOverlay.type === 'emojiPicker'}
        {@const context = currentOverlay.context}
        <CustomEmojiPicker 
            targetElement={context.targetElement} 
            onEmojiSelect={context.onEmojiSelect}
            onDismiss={overlayManagerStore.dismiss}
        />
    {:else if currentOverlay.type === 'contextMenu'}
        {@const context = currentOverlay.context}
        <ContextMenuOverlay 
            position={context.position}
            items={context.items}
            contextData={context.contextData}
            onDismiss={overlayManagerStore.dismiss}
        />
    {:else if currentOverlay.type === 'createServerModal'}
        {@const context = currentOverlay.context}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
             aria-labelledby="modal-title" 
             role="dialog"
             aria-modal="true"
             tabindex="0" 
             onclick={handleBackdropClick} 
             onkeydown={handleBackdropKeydown} 
        >
            <div class="modal-content bg-white dark:bg-gray-800 rounded-md shadow-xl" 
                 role="document"
                 onclick={stopPropagation} 
            >
                <CreateServerModal
                    onCreateSuccess={context.onCreateSuccess} 
                    onDismiss={overlayManagerStore.dismiss}
                />
            </div>
        </div>
    {:else if currentOverlay.type === 'createChannelModal'}
        {@const context = currentOverlay.context}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
             aria-labelledby="create-channel-title" 
             role="dialog" aria-modal="true"
             onclick={handleBackdropClick} onkeydown={handleBackdropKeydown} tabindex="0"
        >
            <div class="modal-content bg-white dark:bg-gray-800 rounded-md shadow-xl" 
                 role="document" onclick={stopPropagation} 
            >
                 <CreateChannelModal
                     serverId={context.serverId}
                     onCreateSuccess={context.onCreateSuccess}
                     onDismiss={overlayManagerStore.dismiss}
                 />
            </div>
        </div>
    {:else if currentOverlay.type === 'createCategoryModal'}
        {@const context = currentOverlay.context}
         <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
             aria-labelledby="create-category-title" 
             role="dialog" aria-modal="true"
             onclick={handleBackdropClick} onkeydown={handleBackdropKeydown} tabindex="0"
        >
            <div class="modal-content bg-white dark:bg-gray-800 rounded-md shadow-xl" 
                 role="document" onclick={stopPropagation} 
            >
                 <CreateCategoryModal
                     serverId={context.serverId}
                     onCreateSuccess={context.onCreateSuccess}
                     onDismiss={overlayManagerStore.dismiss}
                 />
            </div>
        </div>
    {:else if currentOverlay.type === 'confirmDeleteChannelModal'}
        {@const context = currentOverlay.context}
         <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
             aria-labelledby="delete-channel-title" 
             role="dialog" aria-modal="true"
             onclick={handleBackdropClick} onkeydown={handleBackdropKeydown} tabindex="0"
        >
            <div class="modal-content" 
                 role="document" onclick={stopPropagation} 
            >
                 <ConfirmDeleteChannelModal
                     channelName={context.channelName}
                     onConfirm={context.onConfirm}
                     onDismiss={overlayManagerStore.dismiss}
                 />
            </div>
        </div>
    {:else if currentOverlay.type === 'confirmDeleteMessageModal'}
        {@const context = currentOverlay.context}
         <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
             aria-labelledby="delete-message-title" 
             role="dialog" aria-modal="true"
             onclick={handleBackdropClick} onkeydown={handleBackdropKeydown} tabindex="0"
        >
            <div class="modal-content" 
                 role="document" onclick={stopPropagation} 
            >
                 <ConfirmDeleteMessageModal
                     messageContent={context.messageContent}
                     onConfirm={context.onConfirm}
                     onDismiss={overlayManagerStore.dismiss}
                 />
            </div>
        </div>
    {/if}
{/if}

<style>
    .modal-content {
        /* Example */
    }
</style> 