<!-- src/lib/components/UserArea.svelte -->
<script lang="ts">
    // Import User type for JSDoc
    import type { User } from '$lib/api/client.js';

    /** 
     * The current user data, passed from a parent layout.
     * @type {User | null}
     */
    export let user = null;

    // TODO: Add actual avatar logic later using user.avatar (might need base URL or lookup)
    const getAvatarUrl = (avatarId) => {
        // Placeholder - replace with actual logic 
        // return avatarId ? `/api/v1/avatar/${avatarId}.png` : null;
        return null; 
    }
</script>

<div class="mt-auto p-2 bg-gray-850 flex items-center flex-shrink-0 h-14">
    {#if user}
        <!-- User Logged In -->
        {@const avatarUrl = getAvatarUrl(user.avatar)}
        <div class="w-8 h-8 rounded-full bg-gray-600 mr-2 flex-shrink-0 overflow-hidden">
            {#if avatarUrl}
                 <img src={avatarUrl} alt="{user.name}'s avatar" class="w-full h-full object-cover" />
            {:else}
                <!-- Placeholder/Fallback Avatar -->
                <div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold select-none">
                    {user.name.substring(0, 1).toUpperCase()}
                </div>
            {/if}
        </div>
        <div class="flex-grow truncate mr-1">
            <div class="text-sm font-semibold text-white truncate" title={user.name}>{user.name}</div>
            <div class="text-xs text-gray-400">#{user.discriminator}</div>
        </div>
    {:else}
        <!-- User Not Logged In / Loading -->
        <div class="w-8 h-8 rounded-full bg-gray-600 mr-2 animate-pulse"></div>
        <div class="flex-grow truncate mr-1">
            <div class="h-4 bg-gray-600 rounded w-3/4 mb-1 animate-pulse"></div>
            <div class="h-3 bg-gray-600 rounded w-1/2 animate-pulse"></div>
        </div>
    {/if}

    <!-- Action Buttons (Keep as is for now) -->
    <div class="flex space-x-1 flex-shrink-0">
        <button aria-label="Mute Mic" class="text-gray-400 hover:text-gray-200 p-1">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5.076 8.015A6.96 6.96 0 0112 5a6.974 6.974 0 016.924 3.015.5.5 0 00.852-.53C18.938 5.408 15.75 3 12 3S5.062 5.407 4.224 7.485a.5.5 0 00.852.53zM3.003 9.49A9.03 9.03 0 0112 7a9.03 9.03 0 018.997 2.49.5.5 0 10.895-.445A10.03 10.03 0 0012 6a10.03 10.03 0 00-9.892 3.045.5.5 0 10.895.445zM12 10a1 1 0 110 2 1 1 0 010-2zm0-3a1 1 0 110 2 1 1 0 010-2zm-2.53.47a.5.5 0 10-.71.71 1.5 1.5 0 012.12-.001.5.5 0 00.71-.71 2.5 2.5 0 00-3.54.001zm5.06 0a.5.5 0 10-.71.71 1.5 1.5 0 012.12-.001.5.5 0 10.71-.71 2.5 2.5 0 00-3.54.001z"/></svg>
        </button>
        <button aria-label="Deafen" class="text-gray-400 hover:text-gray-200 p-1">
             <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M19.95 11.01A10.002 10.002 0 0010 3a9.97 9.97 0 00-7.74 3.99L1.06 8.16A.5.5 0 00.5 8.5v3a.5.5 0 00.5.5H4a.5.5 0 00.37-.84L3.5 10.12A8.002 8.002 0 0110 5a8.002 8.002 0 016.5 5.12l-.87 1.04A.5.5 0 0016 12h3.5a.5.5 0 00.5-.5v-3a.5.5 0 00-.84-.37l-1.15 1.38zM17 15.88A8.002 8.002 0 0110 19a8.002 8.002 0 01-6.5-5.12l.87-1.04A.5.5 0 004 12H.5a.5.5 0 00-.5.5v3a.5.5 0 00.84.37l1.15-1.38A10.002 10.002 0 0010 21a9.97 9.97 0 007.74-3.99l1.19 1.13a.5.5 0 00.84-.37v-3a.5.5 0 00-.5-.5H16a.5.5 0 00-.37.84l.87 1.04z" clip-rule="evenodd"/></svg>
        </button>
        <button aria-label="User Settings" class="text-gray-400 hover:text-gray-200 p-1">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.566.379-1.566 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.566 2.6 1.566 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.566-.379 1.566-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
        </button>
    </div>
</div>

<style>
  .bg-gray-850 {
      background-color: #292b2f; /* Slightly different dark for user area */
  }
  /* Add other specific styles if needed */
</style> 