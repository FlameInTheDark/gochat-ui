import { writable } from 'svelte/store';

// Define interfaces for TypeScript
export interface MenuItem {
	label: string;
	action: () => void;
	danger?: boolean;
	disabled?: boolean;
	// icon?: string;
}

export interface ContextMenuState {
	isOpen: boolean;
	position: { x: number; y: number };
	items: MenuItem[];
	context?: any;
}

/** @type {ContextMenuState} */
const initialState: ContextMenuState = {
	isOpen: false,
	position: { x: 0, y: 0 },
	items: [],
	context: null
};

const { subscribe, set, update } = writable<ContextMenuState>(initialState);

/**
 * Opens the context menu.
 * @param {{x: number, y: number}} position - The position to open the menu at.
 * @param {Array<MenuItem>} items - The menu items to display.
 * @param {any} [context=null] - Optional context data.
 */
function openMenu(position: {x: number, y: number}, items: Array<MenuItem>, context: any = null) {
	update((state) => ({
		...state,
		isOpen: true,
		position,
		items,
		context
	}));
}

function closeMenu() {
	update((state) => ({
		...state,
		isOpen: false,
		// Optionally clear items/context on close
		// items: [], 
		// context: null
	}));
}

// Function to handle item click within the overlay itself
/** @param {() => void} action */
function executeItemAction(action: () => void) {
	action(); // Execute the item's specific action
	closeMenu(); // Close the menu after action
}


export const contextMenuStore = {
	subscribe,
	open: openMenu,
	close: closeMenu,
	executeItemAction
	// We could add update/set if needed, but open/close are usually sufficient
}; 