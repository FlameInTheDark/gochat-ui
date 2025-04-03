<script>
    import { createEventDispatcher } from 'svelte';
    import { loginUser } from '$lib/api/auth'; // Import real function
    import { ApiError } from '$lib/api/client';
    import { m } from '$lib/paraglide/messages.js';

    const dispatch = createEventDispatcher();

    let emailInput = ''; // Changed from usernameInput
    let passwordInput = '';
    let isLoading = false;
    let errorMessage = '';

    async function handleLogin() {
        isLoading = true;
        errorMessage = '';
        console.log('Attempting login with:', emailInput);
        try {
            // Use the actual API call
            const response = await loginUser({ email: emailInput, password: passwordInput }); 

            // Dispatch event on successful login (token is handled by loginUser/apiClient)
            dispatch('loginsuccess', {
                // We don't get username back from login, parent component will fetch user data
                // username: emailInput // Pass email as identifier for now if needed
            });

        } catch (error) {
            console.error('Login failed:', error);
            if (error instanceof ApiError) {
                if (error.status === 401) {
                     errorMessage = 'Invalid email or password.';
                } else {
                     errorMessage = `Login failed: ${error.body || error.message}`;
                }
            } else {
                errorMessage = 'An unexpected error occurred. Please try again.';
            }
        }
        finally {
            isLoading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleLogin} class="space-y-4">
    <h2 class="text-xl font-semibold text-white mb-4">{m.login_title()}</h2>

    {#if errorMessage}
        <div class="p-3 bg-red-600/30 border border-red-500 rounded text-red-200">
            {errorMessage}
        </div>
    {/if}

    <div>
        <label for="login-email" class="block text-sm font-medium text-gray-300 text-left mb-1">Email</label>
        <input
            type="email" 
            id="login-email" 
            bind:value={emailInput} 
            required
            disabled={isLoading}
            class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-white"
            placeholder="Enter your email"
            autocomplete="email" 
        />
    </div>
    <div>
        <label for="login-password" class="block text-sm font-medium text-gray-300 text-left mb-1">{m.login_password_label()}</label>
        <input
            type="password"
            id="login-password"
            bind:value={passwordInput}
            required
            disabled={isLoading}
            class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-white"
            placeholder="Enter your password"
            autocomplete="current-password"
        />
    </div>
    <button
        type="submit"
        disabled={isLoading || !emailInput || !passwordInput}
        class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
        {#if isLoading}
             <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
        {:else}
            {m.login_button()}
        {/if}
    </button>

    <div class="mt-4 text-center">
        <p class="text-sm text-gray-400">
            Need an account? 
            <a href="/register" class="font-medium text-blue-400 hover:text-blue-300">
                Register
            </a>
        </p>
    </div>
</form>

<style>
    /* Add component-specific styles if needed */
</style> 