<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	// Import individual stores and actions
	import {
		emojiStateStore,
		isCreateServerModalVisibleStore,
		createServerCallbackStore,
		hideEmojiPicker,
		hideCreateServerModal
	} from '$lib/stores/overlayStore.js'; // Using .js extension
	import CustomEmojiPicker from '$lib/components/CustomEmojiPicker.svelte';
	import ContextMenuOverlay from '$lib/components/ContextMenuOverlay.svelte';
	import { contextMenuStore, type MenuItem } from '$lib/stores/contextMenuStore';
	import CreateServerModal from '$lib/components/modals/CreateServerModal.svelte';
	import { get } from 'svelte/store';

	// JSDoc type import for EmojiState if needed for clarity
	/** @typedef {import('$lib/stores/overlayStore.js').EmojiState} EmojiState */

	// --- Local Component State ---
	let pickerStyle = 'display: none;';
	/** @type {HTMLElement | undefined} */
	let emojiPickerElement: HTMLElement | undefined;

	/** @type {EmojiState | undefined} */
	let currentEmojiState: EmojiState | undefined = undefined;
	let isContextMenuCurrentlyOpen = false;

	// --- Lifecycle for Subscriptions and Effects ---
	onMount(() => {
		// Subscribe to Emoji State
		const unsubscribeEmoji = emojiStateStore.subscribe((value) => {
			currentEmojiState = value;
			// Calculate position reactively based on store changes
			if (value.visible && value.targetElement) {
				requestAnimationFrame(() => {
					// Re-check state inside rAF because it might have changed again
					const latestState = get(emojiStateStore);
					if (latestState.visible && latestState.targetElement) {
						calculatePosition(latestState.targetElement);
					}
				});
			} else {
				pickerStyle = 'display: none;';
			}
		});

		// Subscribe to Context Menu State
		const unsubscribeContext = contextMenuStore.subscribe((value) => {
			isContextMenuCurrentlyOpen = value.isOpen;
		});

		// Add global click listener
		if (browser) {
			window.addEventListener('click', handleClickOutside, true);
		}

		// Return cleanup function
		return () => {
			unsubscribeEmoji();
			unsubscribeContext();
			if (browser) {
				window.removeEventListener('click', handleClickOutside, true);
			}
		};
	});

	/** @param {HTMLElement} target */
	function calculatePosition(target: HTMLElement) {
		if (!browser) return;
		const targetRect = target.getBoundingClientRect();
		const spacing = 10;
		const pickerHeightEstimate = 350;
		const pickerWidthEstimate = 320;
		let top = targetRect.top - pickerHeightEstimate - spacing;
		let left = targetRect.left + targetRect.width / 2 - pickerWidthEstimate / 2;

		if (top < 0) {
			top = targetRect.bottom + spacing;
		}
		if (left < 0) {
			left = spacing;
		}
		if (browser && left + pickerWidthEstimate > window.innerWidth) {
			left = window.innerWidth - pickerWidthEstimate - spacing;
		}
		// Ensure picker becomes visible
		pickerStyle = `position: fixed; top: ${top}px; left: ${left}px; z-index: 100; display: block;`;
		console.log('Picker style set:', pickerStyle);
	}

	/** @param {string} emoji */
	function handleEmojiSelect(emoji: string) {
		const currentCallback = get(emojiStateStore).onEmojiSelect;
		if (currentCallback) {
			currentCallback(emoji);
		}
		hideEmojiPicker();
	}

	// Click outside listener
	/** @param {MouseEvent} event */
	function handleClickOutside(event: MouseEvent) {
		if (!(event.target instanceof Node)) return;
		const targetNode = event.target;

		// Handle Emoji Picker (use local reactive variable)
		if (currentEmojiState && currentEmojiState.visible) {
			if (currentEmojiState.targetElement && currentEmojiState.targetElement.contains(targetNode)) {
				return; // Clicked opener
			}
			if (emojiPickerElement && emojiPickerElement.contains(targetNode)) {
				return; // Clicked inside picker
			}
			hideEmojiPicker();
		}

		// Handle Context Menu (use local reactive variable)
		if (isContextMenuCurrentlyOpen) {
			const contextMenuElement = document.querySelector('.context-menu-overlay');
			if (!(contextMenuElement && contextMenuElement.contains(targetNode))) {
				console.log('handleClickOutside: Closing context menu.');
				contextMenuStore.close();
			}
		}
	}

	function handleCreateServer(event: CustomEvent<{ name: string }>) {
		const details = event.detail;
		console.log('AppOverlays: Create Server requested with name:', details.name);
		const callback = get(createServerCallbackStore);
		if (callback) {
			callback(details);
		}
		hideCreateServerModal();
	}

	function handleCloseCreateServer() {
		console.log('AppOverlays: Closing Create Server Modal from component event');
		hideCreateServerModal();
	}

	// Global context menu handler (remains the same)
	function handleWindowContextMenu(event: MouseEvent) {
        if (!(event.target instanceof Element)) return;
        let targetElement: Element | null = event.target;
        const MAX_LEVELS = 3; 
        let foundMessageId: string | null = null;
        let foundUserId: string | null = null;
        let foundChannelId: string | null = null;
        let foundChannelType: string | null = null;
        let foundServerId: string | null = null;
        let menuTargetElement: Element | null = null;

        for (let level = 0; targetElement && level < MAX_LEVELS; level++) {
            const dataset = (targetElement as HTMLElement).dataset;
            if (dataset.messageId && !foundMessageId) {
                foundMessageId = dataset.messageId;
                menuTargetElement = targetElement; 
                if (dataset.userId && !foundUserId) {
                    foundUserId = dataset.userId;
                }
            }
            if (dataset.userId && !foundUserId) {
                foundUserId = dataset.userId;
                if (!menuTargetElement) menuTargetElement = targetElement;
            }
            if (dataset.channelId && !foundChannelId) {
                foundChannelId = dataset.channelId;
                foundChannelType = dataset.channelType ?? null;
                if (!menuTargetElement) menuTargetElement = targetElement;
            }
            if (dataset.serverId && !foundServerId) {
                foundServerId = dataset.serverId;
                if (!menuTargetElement) menuTargetElement = targetElement;
            }
            targetElement = targetElement.parentElement;
        }

        if (!menuTargetElement) return; 

        event.preventDefault(); 
        const position = { x: event.clientX, y: event.clientY };
        let items: MenuItem[] = [];
        let contextType = '';

        if (foundMessageId && foundUserId) {
            contextType = 'Message & User';
            const messageTextElement = menuTargetElement?.querySelector('p'); 
            const messageText = messageTextElement?.textContent?.trim() ?? '';
            items = [
                { label: `Copy Text`, action: () => navigator.clipboard.writeText(messageText) },
                { label: `Edit Message`, action: () => console.log('Edit message:', foundMessageId) },
                { label: `View Profile`, action: () => console.log('View profile:', foundUserId) },
                { label: `Message User`, action: () => console.log('DM user:', foundUserId) },
                { label: `Delete Message`, action: () => console.log('Delete message:', foundMessageId), danger: true }
            ];
        } else if (foundMessageId) {
            contextType = 'Message';
            const messageTextElement = menuTargetElement?.querySelector('p'); 
            const messageText = messageTextElement?.textContent?.trim() ?? '';
            items = [
                { label: 'Copy Text', action: () => navigator.clipboard.writeText(messageText) },
                { label: 'Edit Message', action: () => console.log('Edit message:', foundMessageId) },
                { label: 'Delete Message', action: () => console.log('Delete message:', foundMessageId), danger: true }
            ];
        } else if (foundUserId) {
            contextType = 'User';
            items = [
                { label: 'View Profile', action: () => console.log('View profile:', foundUserId) },
                { label: 'Message', action: () => console.log('DM user:', foundUserId) },
            ];
        } else if (foundChannelId) {
            if (foundChannelType === 'dm') {
                 contextType = 'DM Channel';
                 items = [
                    { label: 'Copy DM ID', action: () => navigator.clipboard.writeText(foundChannelId) },
                    { label: 'Close DM', action: () => console.log('Close DM:', foundChannelId), danger: true }
                 ];
            } else { 
                contextType = 'Server Channel';
                 items = [
                    { label: 'Copy Channel ID', action: () => navigator.clipboard.writeText(foundChannelId) },
                    { label: 'Invite People', action: () => console.log('Invite:', foundChannelId) },
                    { label: 'Edit Channel', action: () => console.log('Edit channel:', foundChannelId) },
                    { label: 'Delete Channel', action: () => console.log('Delete channel:', foundChannelId), danger: true }
                ];
            }
        } else if (foundServerId) {
            contextType = 'Server';
             items = [
                { label: 'Copy Server ID', action: () => navigator.clipboard.writeText(foundServerId) },
                { label: 'Invite People', action: () => console.log('Invite server:', foundServerId) },
                { label: 'Server Settings', action: () => console.log('Settings server:', foundServerId) },
                { label: 'Leave Server', action: () => console.log('Leave server:', foundServerId), danger: true }
            ];
        }

        if (items.length > 0) {
            const contextPayload = { messageId: foundMessageId, userId: foundUserId, channelId: foundChannelId, channelType: foundChannelType, serverId: foundServerId };
            console.log(`Opening context menu for ${contextType} with context:`, contextPayload);
            contextMenuStore.open(position, items, contextPayload);
        }
    }
</script>

{#if browser}
	{#if currentEmojiState && currentEmojiState.visible} <!-- Use local reactive variable -->
		<div bind:this={emojiPickerElement} style={pickerStyle}>
			<CustomEmojiPicker onEmojiSelect={handleEmojiSelect} />
		</div>
	{/if}

	<!-- Context Menu Overlay -->
	<ContextMenuOverlay />

	{#if $isCreateServerModalVisibleStore} <!-- Use $ prefix for this store -->
		<CreateServerModal on:create={handleCreateServer} on:close={handleCloseCreateServer} />
	{/if}
{/if}

<!-- Global listeners on window -->
<svelte:window on:contextmenu={handleWindowContextMenu} on:click={handleClickOutside} />

<!-- Add other overlay types here later -->

<style>
	/* Keep this empty or add styles for the wrapper div if needed */
</style>