import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { getUserMe } from '$lib/api/user.js';
import { getAuthToken } from '$lib/api/client.js';
import { ApiError } from '$lib/api/client'; // Import ApiError
// Import the User type if needed for return type annotation
// import type { User } from '$lib/api/client'; 

/** @type {import('./$types').LayoutLoad} */
export async function load({ url }) {
    if (browser) {
        // Client-side: Check for token, fetch user, redirect if needed
        const token = getAuthToken();
        if (!token) {
            // Redirect to login if no token, preserving attempted path
            throw redirect(302, `/?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
        }
        try {
            const user = await getUserMe();
            return { currentUser: user };
        } catch (error) {
            // Handle errors, e.g., invalid token
            console.error('[app/+layout.js load] Error fetching user on client:', error);
            // Clear potentially invalid cookie/token here if applicable
            // Example: clearAuthToken(); 
            // Redirect to login
            throw redirect(302, `/?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
        }
    } else {
        // Server-side: Assume auth handled by page/endpoint guards, just return null initially
        return { currentUser: null }; 
    }
} 