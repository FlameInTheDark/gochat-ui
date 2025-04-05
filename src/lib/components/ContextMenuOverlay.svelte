<!-- src/lib/components/ContextMenuOverlay.svelte -->
<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { MenuItem } from '$lib/stores/contextMenuStore';

	// --- Props ---
	interface Props {
		items: MenuItem[];
		position: { x: number; y: number };
		contextData?: any;
		onDismiss: () => void;
	}
	const { items, position, contextData, onDismiss }: Props = $props();

	// --- Internal State ---
	let adjustedPosition = $state({ x: 0, y: 0 });
	let menuElement: HTMLDivElement | undefined = $state(undefined);

	// --- Event Handlers ---
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onDismiss();
		}
	}

	function handleItemClick(event: MouseEvent, action: () => void) {
		event.stopPropagation(); // Prevent click from bubbling to outside listener
		console.log("[ContextMenuOverlay handleItemClick] Called. Executing action...");
		action();
	}

	function handleClickOutside(event: MouseEvent) {
		const path = event.composedPath && event.composedPath();
		console.log("[ContextMenuOverlay handleClickOutside] Event target:", event.target);
		console.log("[ContextMenuOverlay handleClickOutside] Menu element:", menuElement);
		console.log("[ContextMenuOverlay handleClickOutside] Path contains menu?", path?.includes(menuElement));
		if (menuElement && path && !path.includes(menuElement)) {
			console.log("[ContextMenuOverlay handleClickOutside] Click detected outside menu. Dismissing.");
			onDismiss();
		} else {
			console.log("[ContextMenuOverlay handleClickOutside] Click inside menu or path issue. Ignoring.");
		}
	}

	// --- Effects ---
	$effect(() => {
		// Calculate adjusted position when position or menuElement changes
		if (menuElement) {
			console.log("[ContextMenuOverlay] Effect running. Has menuElement.");
			void tick().then(() => {
				if (!menuElement) return; // Guard clause inside async
				console.log("[ContextMenuOverlay] Effect tick complete. Measuring element.");
				const menuWidth = menuElement.offsetWidth;
				const menuHeight = menuElement.offsetHeight;
				const windowWidth = window.innerWidth;
				const windowHeight = window.innerHeight;

				const screenPadding = 10;
				let newX = Math.min(position.x, windowWidth - menuWidth - screenPadding);
				newX = Math.max(screenPadding, newX);

				let newY = Math.min(position.y, windowHeight - menuHeight - screenPadding);
				newY = Math.max(screenPadding, newY);

				adjustedPosition = { x: newX, y: newY };
				console.log("[ContextMenuOverlay] Setting adjustedPosition:", adjustedPosition);

				// Optional: Focus the menu after positioning for keyboard nav
				menuElement.focus();
			});
		} else {
			console.log("[ContextMenuOverlay] Effect running. No menuElement yet.");
			// Reset if menuElement is not available (e.g., on initial render before bind)
			adjustedPosition = { x: 0, y: 0 };
		}
	});

	// --- Lifecycle for Listeners ---
	onMount(() => {
		console.log("[ContextMenuOverlay] Mounted, adding listeners.");
		document.addEventListener('keydown', handleKeydown, true);
		document.addEventListener('click', handleClickOutside, true);
	});

	onDestroy(() => {
		console.log("[ContextMenuOverlay] Destroyed, removing listeners.");
		document.removeEventListener('keydown', handleKeydown, true);
		document.removeEventListener('click', handleClickOutside, true);
	});

</script>

<div
	bind:this={menuElement}
	class="context-menu-overlay fixed z-[100] min-w-[150px] rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1"
	style="left: {adjustedPosition.x}px; top: {adjustedPosition.y}px;"
	transition:fade={{ duration: 100 }}
	role="menu"
	aria-orientation="vertical"
	aria-labelledby="context-menu-heading"
    tabindex="-1"
>
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
					onclick={(event) => handleItemClick(event, item.action)}
                    role="menuitem"
				>
					{item.label}
				</button>
			</li>
		{/each}
	</ul>
</div>

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