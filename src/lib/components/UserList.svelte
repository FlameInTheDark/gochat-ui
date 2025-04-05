<!-- src/lib/components/UserList.svelte -->
<script lang="ts">
    // Placeholder for future props and logic
    // import type { Member } from '$lib/api/members';

    // Example prop if needed later
    // const { serverId } = $props<{ serverId: string | null }>();

    // TODO: Fetch and display members based on serverId or channelId

</script>

<aside class="user-list-sidebar flex-shrink-0 flex flex-col w-60">
    <!-- Placeholder content -->
    <div class="p-2 pt-4 text-center text-gray-400 text-sm font-semibold uppercase">Members</div> 
    <div class="flex-grow p-2 text-center text-gray-500 text-xs italic">
        (User list will appear here)
    </div> 
</aside>

<style>
    .user-list-sidebar {
        background-color: #2f3136; /* Match channel list background */
        box-sizing: border-box;
        border-left: 1px solid #202225; /* Separator */
    }
    /* Add any specific styles for the user list here */
</style> 