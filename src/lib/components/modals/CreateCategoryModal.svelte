<script lang="ts">
    import { createCategory } from '$lib/api/channels.js'; // Use createCategory API
    import * as m from '$lib/paraglide/messages.js';
    import type { Channel } from '$lib/types';

    // --- Props ---
    interface Props {
        serverId: bigint;
        onCreateSuccess: (newCategory: Channel) => void;
        onDismiss: () => void;
    }
    const { serverId, onCreateSuccess, onDismiss }: Props = $props();

    // --- State ---
    let categoryName = $state('');
    let creating = $state(false);
    let createError: string | null = $state(null);

    // --- Event Handlers ---
    async function handleCreate() {
        if (!categoryName.trim() || creating) return; 

        creating = true;
        createError = null;

        // API expects name and private status
        const categoryData = {
            name: categoryName.trim(),
            private: false // Default to public category
        };

        try {
            // API function expects guildId and categoryData { name, private }
            const newCategory = await createCategory(serverId, categoryData);
            console.log("Category created via modal:", newCategory);
            onCreateSuccess(newCategory); 
            onDismiss(); 
        } catch (error: any) {
            console.error("Failed to create category:", error);
            createError = error?.body?.message || error?.message || 'Failed to create category.';
        } finally {
            creating = false;
        }
    }
</script>

<div class="bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md">
    <h2 id="create-category-title" class="text-xl font-semibold text-white mb-4">
        Create Category
    </h2>

    <form onsubmit={handleCreate}>
        <div class="mb-4">
            <label for="category-name" class="block text-xs font-medium text-gray-400 uppercase mb-1.5">
                Category Name
            </label>
            <input
                type="text"
                id="category-name"
                bind:value={categoryName}
                required
                disabled={creating}
                class="w-full bg-gray-800 border border-gray-900 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="new-category"
            />
        </div>
        
        {#if createError}
            <p class="text-red-400 text-sm mb-4">{createError}</p>
        {/if}

        <div class="flex justify-end gap-3 mt-6">
            <button
                type="button"
                onclick={onDismiss}
                disabled={creating}
                class="px-4 py-2 rounded bg-transparent text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!categoryName.trim() || creating}
            >
                {#if creating}
                    <span>Creating...</span>
                {:else}
                    Create Category
                {/if}
            </button>
        </div>
    </form>
</div> 