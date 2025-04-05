<script lang="ts">
	import '../app.css';
	// import AppOverlays from '$lib/components/AppOverlays.svelte';
	// import ContextMenuOverlay from '$lib/components/ContextMenuOverlay.svelte';
	// import { contextMenuStore } from '$lib/stores/contextMenuStore';
	// import { onDestroy, onMount } from 'svelte';

	let { children } = $props();

	// let contextMenuOverlayElement = $state<HTMLElement | undefined>(undefined);
	// let isContextMenuOpen = $state(false);
	// const unsubscribe = contextMenuStore.subscribe(state => {
	// 	isContextMenuOpen = state.isOpen;
	// });
	// function registerOverlayElement(element: HTMLElement | undefined) {
	// 	contextMenuOverlayElement = element;
	// }

	// onMount(() => {
	// 	// Add listeners to document body instead of the div
	// 	// document.body.addEventListener('click', handleGlobalClick);
	// 	// document.body.addEventListener('keydown', handleGlobalKeydown);

	// 	// Cleanup function
	// 	return () => {
	// 		// document.body.removeEventListener('click', handleGlobalClick);
	// 		// document.body.removeEventListener('keydown', handleGlobalKeydown);
	// 	};
	// });

	// onDestroy(unsubscribe);
</script>

<div
	class="app-container w-full h-full"
>
	{@render children()}

</div>

<style>
	.app-container {
		min-height: 100vh;
		position: relative;
		outline: none;
	}
</style>
