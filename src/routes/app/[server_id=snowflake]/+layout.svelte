<script lang="ts">
	// --- Core Imports & Setup --- 
	import UserArea from '$lib/components/UserArea.svelte';
	import ChannelList from '$lib/components/ChannelList.svelte'; // Import the new component
	import UserList from '$lib/components/UserList.svelte'; // Import the new component
	import { page } from '$app/stores';
    import { getServerDetails } from '$lib/api/servers.js';
    import * as m from '$lib/paraglide/messages.js';
    import type { User } from '$lib/api/client.js'; // Keep user type import
    // Removed channel-specific imports

    // --- Props from Parent Layout --- 
    // Get the whole data object passed down from parent's load function
    const { data } = $props<{ data: { currentUser: User | null } }>();
    // Derive currentUser from the data prop
    const currentUser = $derived(data.currentUser);

	// --- Reactive Values & Promises (using $derived) ---
	const activeServerId = $derived($page.params.server_id);
    const activeChannelId = $derived($page.params.channel_id);
	const activeServerIdBigInt = $derived(activeServerId ? BigInt(activeServerId) : null);
    const serverDetailsPromise = $derived(activeServerIdBigInt ? getServerDetails(activeServerIdBigInt) : Promise.resolve(null));

    // --- All channel state and logic is now in ChannelList.svelte ---

</script>

<!-- Wrap the three columns in a flex container -->
<div class="flex flex-grow min-w-0 h-full">
    <!-- Server-specific layout structure -->
    <nav class="channels-sidebar flex flex-col">
        {#await serverDetailsPromise then serverDetails}
            <div class="p-3 h-12 flex items-center shadow-md flex-shrink-0">
                <h2 class="font-semibold text-white truncate">
                    {serverDetails?.name || m.loading_server()}
                </h2>
            </div>
        {/await}

        <!-- Use the ChannelList component -->
        <ChannelList serverId={activeServerId} {activeChannelId} />

        <!-- User Area -->
        <UserArea user={currentUser} /> 
    </nav>

    <!-- Main Content -->
    <main class="main-content flex-grow flex flex-col min-w-0">
        <!-- Use classic slot -->
        <slot /> 
    </main>

    <!-- Use the UserList component -->
    <UserList /> 
</div>

<style>
    /* Define specific styles for this layout's columns */
    .channels-sidebar {
        width: 240px;
        background-color: #2f3136; /* Discord channel list bg */
        flex-shrink: 0;
        /* display: flex; flex-col already applied */
        box-sizing: border-box;
    }
    .main-content {
        /* flex-grow; flex flex-col already applied */
        background-color: #36393f; /* Discord main content bg */
    }
</style> 