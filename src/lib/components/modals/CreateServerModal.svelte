<!-- src/lib/components/modals/CreateServerModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let serverName = '';
	const dispatch = createEventDispatcher();

	function handleCreate() {
		if (!serverName.trim()) return; // Basic validation
		dispatch('create', { name: serverName.trim() });
		// The store/overlay will handle closing
	}

	function handleClose() {
		dispatch('close');
	}

	// Trap focus within the modal (basic implementation)
	function trapFocus(node: HTMLElement) {
		const focusableElements = node.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Tab') {
				if (event.shiftKey) {
					// Shift + Tab
					if (document.activeElement === firstElement) {
						lastElement.focus();
						event.preventDefault();
					}
				} else {
					// Tab
					if (document.activeElement === lastElement) {
						firstElement.focus();
						event.preventDefault();
					}
				}
			} else if (event.key === 'Escape') {
				handleClose();
			}
		}

		// Focus the first element when the modal mounts
		firstElement?.focus();

		node.addEventListener('keydown', handleKeydown);

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	}
</script>

<div
	class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
	on:click|self={handleClose}
	role="dialog"
	aria-modal="true"
	aria-labelledby="create-server-title"
>
	<div class="bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md" use:trapFocus>
		<h2 id="create-server-title" class="text-xl font-semibold text-white mb-4">
			Create Your Server
		</h2>
		<p class="text-sm text-gray-300 mb-4">
			Give your new server a name. You can always change it later.
		</p>

		<form on:submit|preventDefault={handleCreate}>
			<label for="server-name" class="block text-xs font-medium text-gray-400 uppercase mb-1.5">
				Server Name
			</label>
			<input
				type="text"
				id="server-name"
				bind:value={serverName}
				required
				class="w-full bg-gray-800 border border-gray-900 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
				placeholder="My Awesome Server"
			/>

			<div class="flex justify-end gap-3">
				<button
					type="button"
					on:click={handleClose}
					class="px-4 py-2 rounded bg-transparent text-gray-200 hover:bg-gray-600 transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					disabled={!serverName.trim()}
				>
					Create
				</button>
			</div>
		</form>
	</div>
</div> 