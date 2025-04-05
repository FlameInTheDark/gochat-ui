import { writable, get } from 'svelte/store';
import type { MenuItem } from '$lib/stores/contextMenuStore'; // Assuming this still exists
import type { Guild, Channel } from '$lib/types'; // For Create Server Modal and Channel type

// --- Context Types ---

export type EmojiPickerContext = {
	targetElement: HTMLElement;
	onEmojiSelect: (emoji: string) => void;
};

export type ContextMenuContext = {
	position: { x: number; y: number };
	items: MenuItem[];
	contextData?: any; // Optional data associated with the menu trigger
};

export type CreateServerModalContext = {
	// Callback when server is successfully created (simplified)
	onCreateSuccess: (guild: Guild) => void; 
};

export type CreateChannelModalContext = {
    serverId: bigint;
    onCreateSuccess: (newChannel: Channel) => void;
};

export type CreateCategoryModalContext = {
    serverId: bigint;
    onCreateSuccess: (newCategory: Channel) => void;
};

export type ConfirmDeleteChannelModalContext = {
    channelName: string;
    onConfirm: () => void; // Callback to execute the actual deletion
};

export type ConfirmDeleteMessageModalContext = {
    messageContent: string; // To display which message is being deleted
    onConfirm: () => void; // Callback to execute deletion
};

// Define other context types here if needed

// --- Overlay State Definition ---

export type OverlayType = 
    | 'emojiPicker' 
    | 'contextMenu' 
    | 'createServerModal' 
    | 'createChannelModal' 
    | 'createCategoryModal'
    | 'confirmDeleteChannelModal'
    | 'confirmDeleteMessageModal';

export type OverlayState =
	| { type: null; context: null }
	| { type: 'emojiPicker'; context: EmojiPickerContext }
	| { type: 'contextMenu'; context: ContextMenuContext }
	| { type: 'createServerModal'; context: CreateServerModalContext }
    | { type: 'createChannelModal'; context: CreateChannelModalContext }
    | { type: 'createCategoryModal'; context: CreateCategoryModalContext }
    | { type: 'confirmDeleteChannelModal'; context: ConfirmDeleteChannelModalContext }
    | { type: 'confirmDeleteMessageModal'; context: ConfirmDeleteMessageModalContext };
    // Add more states for other overlay types using union types

// --- Store Implementation ---

const initialState: OverlayState = { type: null, context: null };

const store = writable<OverlayState>(initialState);

export const overlayManagerStore = {
	subscribe: store.subscribe,

	showEmojiPicker: (context: EmojiPickerContext) => {
        console.log("[OverlayManagerStore] Showing Emoji Picker", context);
		store.set({ type: 'emojiPicker', context });
	},

	showContextMenu: (context: ContextMenuContext) => {
        console.log("[OverlayManagerStore] Showing Context Menu", context);
		store.set({ type: 'contextMenu', context });
	},

    showCreateServerModal: (context: CreateServerModalContext) => {
        console.log("[OverlayManagerStore] Showing Create Server Modal", context);
        store.set({ type: 'createServerModal', context });
    },

    showCreateChannelModal: (context: CreateChannelModalContext) => {
        console.log("[OverlayManagerStore] Showing Create Channel Modal", context);
        store.set({ type: 'createChannelModal', context });
    },

    showCreateCategoryModal: (context: CreateCategoryModalContext) => {
        console.log("[OverlayManagerStore] Showing Create Category Modal", context);
        store.set({ type: 'createCategoryModal', context });
    },

    showConfirmDeleteChannelModal: (context: ConfirmDeleteChannelModalContext) => {
        console.log("[OverlayManagerStore] Showing Confirm Delete Channel Modal", context);
        store.set({ type: 'confirmDeleteChannelModal', context });
    },

    showConfirmDeleteMessageModal: (context: ConfirmDeleteMessageModalContext) => {
        console.log("[OverlayManagerStore] Showing Confirm Delete Message Modal", context);
        store.set({ type: 'confirmDeleteMessageModal', context });
    },

	dismiss: () => {
        console.log("[OverlayManagerStore] Dismissing current overlay");
		store.set({ type: null, context: null });
	},

    // Optional: Get current state if needed elsewhere (useful for debugging)
    getCurrentState: () => get(store)
}; 