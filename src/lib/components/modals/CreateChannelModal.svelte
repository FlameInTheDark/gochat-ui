<script lang="ts">
    import { onMount } from 'svelte';
    import { createChannel } from '$lib/api/channels.js';
    import * as m from '$lib/paraglide/messages.js';
    import type { Channel } from '$lib/types';
    import { ChannelType } from '$lib/enums';

    // --- Props ---
    interface Props {
        serverId: bigint;
        onCreateSuccess: (newChannel: Channel) => void;
        onDismiss: () => void;
    }
    const { serverId, onCreateSuccess, onDismiss }: Props = $props();

    // --- State ---
    let channelName = $state('');
    let channelType = $state(ChannelType.GUILD_TEXT); // Default to text
    let creating = $state(false);
    let createError: string | null = $state(null);

    // --- Event Handlers ---
    async function handleCreate() {
        if (!channelName.trim() || creating) return; 

        creating = true;
        createError = null;

        const channelData = {
            name: channelName.trim(),
            type: channelType,
            parent_id: undefined, // For now, create top-level channels
            private: false 
        };

        try {
            const newChannel = await createChannel(serverId, channelData);
            console.log("Channel created via modal:", newChannel);
            onCreateSuccess(newChannel); // Call prop on success
            onDismiss(); // Dismiss after success prop call
        } catch (error: any) {
            console.error("Failed to create channel:", error);
            createError = error?.body?.message || error?.message || 'Failed to create channel.';
        } finally {
            creating = false;
        }
    }

    onMount(() => {
        console.log("[CreateChannelModal] Mounted.");
    });

    // Note: trapFocus action not included here for brevity, assume it can be added if needed
</script>

<!-- Modal Content -->
<div class="bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md">
    <h2 id="create-channel-title" class="text-xl font-semibold text-white mb-4">
        Create Channel
    </h2>

    <form onsubmit={handleCreate}>
        <div class="mb-4">
            <label for="channel-name" class="block text-xs font-medium text-gray-400 uppercase mb-1.5">
                Channel Name
            </label>
            <input
                type="text"
                id="channel-name"
                bind:value={channelName}
                required
                disabled={creating}
                class="w-full bg-gray-800 border border-gray-900 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="new-channel"
            />
        </div>
        
        <fieldset class="mb-4">
             <legend class="block text-xs font-medium text-gray-400 uppercase mb-1.5">
                Channel Type
            </legend>
            <div class="flex gap-4">
                <label class="flex items-center text-gray-200">
                    <input 
                        type="radio" 
                        bind:group={channelType} 
                        value={ChannelType.GUILD_TEXT} 
                        name="channelType"
                        class="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-600 bg-gray-800"
                        disabled={creating}
                    />
                    Text Channel
                </label>
                <label class="flex items-center text-gray-200">
                    <input 
                        type="radio" 
                        bind:group={channelType} 
                        value={ChannelType.GUILD_VOICE} 
                        name="channelType"
                        class="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-600 bg-gray-800"
                        disabled={creating}
                    />
                    Voice Channel
                </label>
            </div>
        </fieldset>

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
                disabled={!channelName.trim() || creating}
            >
                {#if creating}
                    <span>Creating...</span>
                {:else}
                    Create Channel
                {/if}
            </button>
        </div>
    </form>
</div> 