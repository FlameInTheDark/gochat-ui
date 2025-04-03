<script>
    import ConfirmationForm from '$lib/components/ConfirmationForm.svelte';

    /** @type {import('./$types').PageData} */
    export let data; // Data from the load function ({ userId, token })

</script>

<div class="min-h-screen flex items-center justify-center bg-gray-800">
    <div class="max-w-md w-full bg-gray-700 p-8 rounded-lg shadow-lg">
        {#if data.userId && data.token}
            <ConfirmationForm userId={Number(data.userId)} token={data.token} />
        {:else}
            <h2 class="text-xl font-semibold text-white mb-4">Invalid Confirmation Link</h2>
            <p class="text-red-400">The confirmation link is incomplete or invalid. Please check the link or try registering again.</p>
            <div class="mt-6 text-center">
                 <a href="/register" class="font-medium text-blue-400 hover:text-blue-300">
                    Go to Registration
                </a>
            </div>
        {/if}
    </div>
</div> 