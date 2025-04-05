<!-- src/lib/components/modals/CreateServerModal.svelte -->
<script lang="ts">
	import { createGuild } from '$lib/api/servers.js';
	import * as m from '$lib/paraglide/messages.js';
	import type { Guild } from '$lib/types'; // Import Guild type

	// --- Props ---
	interface Props {
		onCreateSuccess: (guild: Guild) => void;
		onDismiss: () => void;
	}
	const { onCreateSuccess, onDismiss }: Props = $props();

	// --- State ---
	let serverName = $state('');
	let creating = $state(false);
	let createError: string | null = $state(null);

	// --- Event Handlers ---
	async function handleCreate() {
		if (!serverName.trim() || creating) return; 

		creating = true;
		createError = null;

		try {
			const newGuild = await createGuild({ name: serverName.trim() });
			onCreateSuccess(newGuild); // Call prop on success
			onDismiss(); // Dismiss after success prop call
		} catch (error: any) {
			console.error("Failed to create server:", error);
			createError = error?.body?.message || error?.message || 'Failed to create server. Please try again.';
		} finally {
			creating = false;
		}
	}

	function handleClose() {
		if (creating) return; 
		onDismiss(); // Call dismiss prop
	}

	// --- Focus Trap Action ---
	function trapFocus(node: HTMLElement) {
		const focusableElements = node.querySelectorAll<HTMLElement>(
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Tab') {
				if (event.shiftKey) {
					if (document.activeElement === firstElement) {
						lastElement?.focus();
						event.preventDefault();
					}
				} else {
					if (document.activeElement === lastElement) {
						firstElement?.focus();
						event.preventDefault();
					}
				}
			} else if (event.key === 'Escape') {
				onDismiss(); // Use dismiss prop for Escape key
			}
		}

		if (firstElement instanceof HTMLElement) {
			firstElement.focus();
		}

		node.addEventListener('keydown', handleKeydown);

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	}
</script>

<!-- Modal Content Root Element -->
<div class="bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md" use:trapFocus>
	<h2 id="create-server-title" class="text-xl font-semibold text-white mb-4">
		{m.create_server_title()}
	</h2>
	<p class="text-sm text-gray-300 mb-4">
		{m.create_server_description()}
	</p>

	<form onsubmit={handleCreate}>
		<label for="server-name" class="block text-xs font-medium text-gray-400 uppercase mb-1.5">
			{m.create_server_name_label()}
		</label>
		<input
			type="text"
			id="server-name"
			bind:value={serverName}
			required
			disabled={creating}
			class="w-full bg-gray-800 border border-gray-900 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
			placeholder={m.create_server_name_placeholder()}
		/>

		{#if createError}
			<p class="text-red-400 text-sm mb-4">{createError}</p>
		{/if}

		<div class="flex justify-end gap-3 mt-2">
			<button
				type="button"
				onclick={handleClose}
				disabled={creating}
				class="px-4 py-2 rounded bg-transparent text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{m.cancel_button()}
			</button>
			<button
				type="submit"
				class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				disabled={!serverName.trim() || creating}
			>
				{#if creating}
					<span>Creating...</span>
				{:else}
					{m.create_button()}
				{/if}
			</button>
		</div>
	</form>
</div> 