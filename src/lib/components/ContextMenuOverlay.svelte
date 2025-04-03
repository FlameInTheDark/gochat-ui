<!-- src/lib/components/ContextMenuOverlay.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { contextMenuStore, type MenuItem } from '$lib/stores/contextMenuStore';

	// $props() is not needed here as we don't accept props directly

	// Internal reactive state derived from the store
	let isOpen = $state(false);
	let items = $state<MenuItem[]>([]);
	let position = $state({ x: 0, y: 0 });

	// Internal element reference for potential future use (e.g., focus management), but not passed out
	let menuElement: HTMLElement | undefined;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			contextMenuStore.close();
		}
	}

	onMount(() => {
		const unsubscribeStore = contextMenuStore.subscribe(state => {
			isOpen = state.isOpen;
			if (isOpen) {
				items = state.items;
				position = state.position;
				// Add listener only when menu becomes open
				window.addEventListener('keydown', handleKeydown);
			} else {
				// Remove listener when menu closes
				window.removeEventListener('keydown', handleKeydown);
			}
		});

		// Initial check in case store was already open (unlikely but safe)
		if (isOpen) {
			window.addEventListener('keydown', handleKeydown);
		}

		return () => {
			unsubscribeStore();
			// Ensure listener is removed on unmount regardless of state
			window.removeEventListener('keydown', handleKeydown);
		};
	});

</script>

{#if isOpen}
	<div
		bind:this={menuElement}
		class="context-menu-overlay fixed z-[100] min-w-[150px] rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1"
		style="left: {position.x}px; top: {position.y}px;"
		transition:fade={{ duration: 100 }}
		role="menu"
		aria-orientation="vertical"
		aria-labelledby="context-menu-heading"
	>
        <!-- Optional: Add a visually hidden heading for accessibility -->
        <h2 id="context-menu-heading" class="sr-only">Context Menu</h2>
		<ul>
			{#each items as item (item.label)}
				<li role="presentation">
					<button
						type="button"
						disabled={item.disabled || false}
						class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed
                           {item.danger
							? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50'
							: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}"
						onclick={() => contextMenuStore.executeItemAction(item.action)}
                        role="menuitem"
					>
						{item.label}
					</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.context-menu-overlay {
		/* Use fixed positioning */
	}
    /* Basic screen-reader only class */
    .sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style> 