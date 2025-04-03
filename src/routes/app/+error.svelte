<script>
    import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center justify-center h-full p-6 text-center">
    <h1 class="text-4xl font-bold text-red-400 mb-4">Oops! ({$page.status})</h1>
    <p class="text-lg text-gray-300 mb-6">{$page.error?.message || 'Something went wrong.'}</p>

    {#if $page.status === 404}
        <p class="text-gray-400">Maybe try selecting a different server or channel?</p>
    {:else}
        <p class="text-gray-400">Please try refreshing the page or contact support if the problem persists.</p>
        <!-- You could add more details for non-404 errors if available -->
        <!-- {#if $page.error?.stack}
            <pre class="mt-4 text-xs text-left bg-gray-800 p-2 rounded overflow-auto">{$page.error.stack}</pre>
        {/if} -->
    {/if}

    <a href="/app" class="mt-8 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
        Go to App Home
    </a>
</div> 