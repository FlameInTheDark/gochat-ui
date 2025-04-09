<script>
    import { confirmRegistration } from '$lib/api/auth';
    import { ApiError } from '$lib/api/client';
    import { goto } from '$app/navigation';

    /** @type {bigint} User ID from URL */
    export let userId;
    /** @type {string} Confirmation token from URL */
    export let token;

    let name = ''; // Display Name
    let discriminator = ''; // Unique Username/Handle
    let password = '';
    let confirmPassword = ''; // Add confirm password field
    let isLoading = false;
    let errorMessage = '';
    let successMessage = '';

    $: passwordsMatch = password === confirmPassword;

    async function handleSubmit() {
        if (!userId || !token) {
            errorMessage = 'Missing confirmation details from link.';
            return;
        }

        // --- Validation --- 
        errorMessage = ''; // Clear previous errors

        if (!name.trim()) {
             errorMessage = 'Display Name cannot be empty.';
             return;
        }
        if (!discriminator.trim()) { // Basic check for unique username
             errorMessage = 'Username cannot be empty.';
             return;
        }
         // Add more robust username validation later (length, allowed characters)

        if (password.length < 6) { 
             errorMessage = 'Password must be at least 6 characters long.';
             return;
        }
        if (!passwordsMatch) {
            errorMessage = 'Passwords do not match.';
            return;
        }
        // --- End Validation --- 

        isLoading = true;
        successMessage = '';

        try {
            await confirmRegistration({
                id: userId,
                token: token,
                name: name.trim(),
                password: password,
                discriminator: discriminator.trim()
            });
            successMessage = 'Account confirmed successfully! You can now log in.';
            setTimeout(() => {
                goto('/');
            }, 2000); 
        } catch (error) {
            if (error instanceof ApiError) {
                 if (error.status === 409) {
                    // API uses 409 for non-unique discriminator (unique username)
                    errorMessage = 'That username is already taken. Please choose another.';
                } else if (error.status === 400) {
                    errorMessage = `Confirmation failed: ${error.body || 'Invalid data provided.'}`;
                } else if (error.status === 401) {
                     errorMessage = 'Invalid or expired confirmation link.';
                } else {
                    errorMessage = `Confirmation failed: ${error.body || error.message}`;
                }
            } else {
                errorMessage = 'An unexpected error occurred. Please try again.';
                console.error('Unexpected confirmation error:', error);
            }
        }
        finally {
            isLoading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <h2 class="text-xl font-semibold text-white mb-4">Complete Registration</h2>
    
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
        <label for="confirm-name" class="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
        <input 
            type="text" 
            id="confirm-name" 
            bind:value={name} 
            required 
            disabled={isLoading}
            placeholder="How you appear to others"
            class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
    </div>

    <div>
        <label for="confirm-discriminator" class="block text-sm font-medium text-gray-300 mb-1">Username</label>
        <input 
            type="text" 
            id="confirm-discriminator" 
            bind:value={discriminator} 
            required 
            disabled={isLoading}
            placeholder="Unique username (e.g., flameinthedark)"
            pattern="^[a-zA-Z0-9_.]*$" 
            title="Username can only contain letters, numbers, underscores, and periods."
            class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            autocomplete="username"
        />
    </div>

    <div>
        <label for="confirm-password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <input 
            type="password" 
            id="confirm-password" 
            bind:value={password} 
            required 
            minlength="6" 
            disabled={isLoading}
            placeholder="Create a password (min. 6 characters)"
            class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            autocomplete="new-password"
        />
    </div>

    <div>
        <label for="confirm-password-check" class="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
        <input 
            type="password" 
            id="confirm-password-check" 
            bind:value={confirmPassword} 
            required 
            minlength="6" 
            disabled={isLoading}
            placeholder="Re-enter your password"
            class="w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 {
                password && confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-700'
            }"
            autocomplete="new-password"
        />
        {#if password && confirmPassword && !passwordsMatch}
            <p class="text-xs text-red-400 mt-1">Passwords do not match.</p>
        {/if}
    </div>

    <button 
        type="submit" 
        disabled={isLoading || !name || !discriminator || !password || !confirmPassword || !passwordsMatch}
        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
        {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Confirming...
        {:else}
            Confirm Account
        {/if}
    </button>
</form>

<style>
    /* Add any additional styles if needed */
</style> 