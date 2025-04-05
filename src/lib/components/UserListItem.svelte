<script lang="ts">
    import type { Member } from '$lib/api/members';
    import * as m from '$lib/paraglide/messages.js'; // Import messages

    export let member: Member;

    // Map status to Tailwind color classes
    const statusColors: Record<Member['status'], string> = {
        online: 'bg-green-500',
        idle: 'bg-yellow-500',
        dnd: 'bg-red-500',
        offline: 'bg-gray-500',
    };
</script>

<button 
    data-user-id={member.id} 
    class="flex items-center p-1.5 rounded-md w-full text-left hover:bg-gray-700/50 group transition-colors duration-100 ease-in-out"
>
    <!-- Avatar with Status -->
    <div class="relative mr-2 flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-gray-600">
            {#if member.avatarUrl}
                <img src={member.avatarUrl} alt="{member.name}'s avatar" class="w-full h-full rounded-full object-cover" />
            {:else}
                <!-- Placeholder/Fallback Avatar -->
                <div class="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold select-none">
                    {member.name.substring(0, 1).toUpperCase()}
                </div>
            {/if}
        </div>
        <!-- Status Indicator -->
        {#if member.status !== 'offline'}
            <div class={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700 ${statusColors[member.status] || statusColors.offline}`}></div>
        {/if}
    </div>

    <!-- Name -->
    <span 
        class="truncate text-sm font-medium {member.status === 'offline' ? 'text-gray-400' : 'text-gray-200'} group-hover:text-gray-100 transition-colors duration-100 ease-in-out"
        title={member.status === 'offline' ? m.offline_status() : m.online_status()}
    >
        {member.name}
    </span>

    <!-- TODO: Add context menu on right-click or hover actions -->
</button> 