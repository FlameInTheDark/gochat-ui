<script lang="ts">
    import { goto } from '$app/navigation';

    /** @type {bigint | null} Server icon ID */
    export let iconId: bigint | null = null;
    /** @type {string} Server name (used for initials fallback and tooltip) */
    export let name = 'Server';
    /** @type {boolean} Whether this server is currently selected */
    export let active = false;
    /** @type {string} ID of the server (passed as string) */
    export let id: string;

    // Placeholder logic for constructing image URL from ID
    // TODO: Replace with actual CDN/API endpoint logic
    $: actualImageUrl = iconId ? `/images/icons/${iconId.toString()}.png` : null;

    // Generate initials from the server name
    $: initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    function navigate() {
        if (id) {
            goto(`/app/${id}`);
        } else {
            console.error('Missing server ID for navigation');
        }
    }

    // TODO: Add tooltip functionality later using title attribute or a dedicated component

</script>

<button
    type="button"
    data-server-id={id} 
    on:click={navigate}
    class:active
    class="relative flex items-center justify-center w-12 h-12 mb-2 rounded-[50%] hover:rounded-2xl bg-gray-700 text-gray-200 hover:bg-blue-600 transition-all duration-200 ease-in-out group focus:outline-none"
    class:rounded-2xl={active}
    class:bg-blue-600={active}
    class:hover:rounded-2xl={!active}
    title={name}
    aria-label={name}
>
    <!-- Active background: controlled by class:bg-blue-600 -->
    <!-- Active shape: controlled by class:rounded-2xl -->
    <!-- Default background: controlled by class:bg-gray-700 -->
    <!-- Hover background: controlled by class:hover:bg-blue-600 -->
    <!-- Hover shape: controlled by class:hover:rounded-2xl -->
    <!-- Basic tooltip: controlled by title attribute -->

    {#if actualImageUrl}
        <img src={actualImageUrl} alt={name} class="w-full h-full object-cover rounded-full transition-all duration-200 ease-in-out group-hover:rounded-2xl {active ? 'rounded-2xl' : ''}" />
    {:else}
        <span class="text-white font-medium select-none">{initials}</span>
    {/if}

    <!-- TODO: Implement better Tooltip component -->
    <!-- <div class="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        {name}
    </div> -->
</button>

<style>
    /* Add specific focus styles if needed for the button */
    button:focus-visible {
      /* Example: outline: 2px solid blue; */
    }
</style> 