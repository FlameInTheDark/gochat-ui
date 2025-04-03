<script>
    import { registerUser } from '$lib/api/auth';
    import { ApiError } from '$lib/api/client';

    let email = '';
    let isLoading = false;
    let errorMessage = '';
    let successMessage = '';

    async function handleSubmit() {
        isLoading = true;
        errorMessage = '';
        successMessage = '';

        try {
            const response = await registerUser({ email });
            successMessage = response || 'Registration request sent! Please check your email.';
            email = ''; // Clear form on success
        } catch (error) {
            if (error instanceof ApiError) {
                // Handle specific API errors based on status code
                if (error.status === 302) {
                    errorMessage = 'This email is already registered. Try logging in.';
                } else if (error.status === 400) {
                    errorMessage = 'Invalid email format. Please check your input.';
                } else if (error.status === 429) {
                    errorMessage = 'Too many requests. Please try again later.';
                } else {
                    // Generic message for other API errors
                    errorMessage = `Registration failed: ${error.body || error.message}`;
                }
            } else {
                // Handle network errors or other unexpected errors
                errorMessage = 'An unexpected error occurred. Please try again.';
                console.error('Unexpected registration error:', error);
            }
        }
        finally {
            isLoading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <h2 class="text-xl font-semibold text-white mb-4">Register</h2>
    
    {#if successMessage}
        <div class="p-3 bg-green-600/30 border border-green-500 rounded text-green-200">
            {successMessage}
        </div>
    {/if}

    {#if errorMessage}
        <div class="p-3 bg-red-600/30 border border-red-500 rounded text-red-200">
            {errorMessage}
        </div>
    {/if}

    <div>
        <label for="register-email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input 
            type="email" 
            id="register-email" 
            bind:value={email} 
            required 
            disabled={isLoading}
            placeholder="you@example.com"
            class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
    </div>

    <button 
        type="submit" 
        disabled={isLoading || !email}
        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
        {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Registering...
        {:else}
            Register
        {/if}
    </button>
</form>

<style>
    /* Add any additional styles if needed */
</style> 