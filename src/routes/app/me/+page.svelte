<script lang="ts">
    import DirectMessageLink from '$lib/components/DirectMessageLink.svelte';
    import type { PageData } from './$types';
    import { page } from '$app/stores'; // Import page store

    export let data: PageData;

    // Determine active DM based on the child route param (if any)
    $: activeDmId = $page.params.user_id; // user_id is used for DM routes in our structure

    // Assuming data.dms is the array fetched by load
    $: dms = data.dms || [];

</script>

<div class="flex flex-col h-full">
    <!-- Header -->
    <header class="p-3 h-12 flex items-center shadow-md flex-shrink-0 border-b border-gray-800">
        <!-- Maybe Friends/Online/All/Pending buttons here later -->
        <h1 class="font-semibold text-white">Direct Messages</h1>
    </header>

    <!-- DM List -->
    <div class="flex-grow overflow-y-auto pt-2 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {#if dms.length > 0}
            {#each dms as dm (dm.id)}
                <DirectMessageLink {dm} active={activeDmId === dm.id} />
            {/each}
        {:else if 'error' in data && data.error}
            <p class="text-center text-red-400 p-4">Error loading DMs: {data.error.message}</p>
        {:else}
            <p class="text-center text-gray-500 p-4">No direct messages found.</p>
        {/if}
    </div>
</div>

<style>
    /* Add styles if needed */
</style>
