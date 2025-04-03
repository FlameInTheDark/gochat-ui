import { writable, get } from 'svelte/store';
import { contextMenuStore } from '$lib/stores/contextMenuStore'; // Import context menu store

// --- Define State Types --- JSDoc equivalent
/**
 * @typedef {Object} EmojiState
 * @property {boolean} visible
 * @property {HTMLElement | null} targetElement
 * @property {((emoji: string) => void) | null} onEmojiSelect
 */

/**
 * @typedef {(details: { name: string }) => void} CreateServerCallback
 */

// --- Emoji Picker Store ---
/** @type {import('svelte/store').Writable<EmojiState>} */
const emojiPickerState = writable({ // Remove <EmojiState>
    visible: false,
    targetElement: null, // Keep as null initially
    onEmojiSelect: null
});

/** 
 * @param {HTMLElement} targetElement 
 * @param {(emoji: string) => void} onEmojiSelect 
 */
function showEmojiPicker(targetElement, onEmojiSelect) { // Remove type annotations
    console.log("overlayStore: Showing Emoji Picker");
    contextMenuStore.close(); // Close context menu
    // hideCreateServerModal(); // Ensure others are closed if necessary, potentially by setting their store
    isCreateServerModalVisible.set(false); // Example: Close other modal
    createServerCallback.set(null);
    
    emojiPickerState.set({
        visible: true,
        targetElement: targetElement,
        onEmojiSelect: onEmojiSelect
    });
}

function hideEmojiPicker() {
    console.log("overlayStore: Hiding Emoji Picker");
    emojiPickerState.update(state => ({
        ...state,
        visible: false,
        targetElement: null,
        onEmojiSelect: null
    }));
}

// --- Create Server Modal Store ---
/** @type {import('svelte/store').Writable<boolean>} */
const isCreateServerModalVisible = writable(false);
/** @type {import('svelte/store').Writable<CreateServerCallback | null>} */
const createServerCallback = writable(null); // Remove <CreateServerCallback | null>

/** 
 * @param {CreateServerCallback} callback 
 */
function showCreateServerModal(callback) { // Remove type annotations
    console.log("overlayStore: Showing Create Server Modal");
    contextMenuStore.close();
    // Ensure other overlays are closed
    hideEmojiPicker();

    createServerCallback.set(callback);
    isCreateServerModalVisible.set(true);
}

function hideCreateServerModal() {
    console.log("overlayStore: Hiding Create Server Modal");
    isCreateServerModalVisible.set(false);
    createServerCallback.set(null);
}

// Export individual stores and action functions directly
export const emojiStateStore = emojiPickerState;
export const isCreateServerModalVisibleStore = isCreateServerModalVisible;
export const createServerCallbackStore = createServerCallback;

export { 
    showEmojiPicker, 
    hideEmojiPicker, 
    showCreateServerModal, 
    hideCreateServerModal 
}; 