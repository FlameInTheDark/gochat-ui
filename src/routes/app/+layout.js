import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getUserMe } from '$lib/api/user.js';
import { setAuthToken, ApiError } from '$lib/api/client.js';

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch }) { // Use SvelteKit's fetch
    let currentUser = null;
    let loadError = null;
    let needsRedirect = false;

    // Check for token only in browser initially, or rely on fetch context (cookies) server-side
    const initialToken = browser ? localStorage.getItem('authToken') : null; // Might be null server-side

    console.log("Running /app layout load function...");

    // Attempt to fetch user data IF we think we might be logged in (token exists client-side)
    // Server-side fetch will rely on cookies handled by apiClient/axios
    if (browser && !initialToken) {
        console.log("/app layout: No token found client-side, redirecting to login.");
        needsRedirect = true; // No token, definitely needs login
    } else {
        try {
            // Pass SvelteKit's fetch to getUserMe -> apiClient -> axios
            // This ensures cookies are handled correctly during SSR if needed
            currentUser = await getUserMe(fetch);
            console.log("/app layout: Fetched currentUser:", currentUser);
        } catch (error) {
            console.error("/app layout: Error fetching user:", error);
            loadError = error instanceof Error ? error.message : 'Unknown error';
            if (error instanceof ApiError && error.status === 401) {
                // Unauthorized - token is invalid or expired
                if (browser) {
                    setAuthToken(null); // Clear bad token
                }
                needsRedirect = true; // Force login
                loadError = 'Session expired. Please log in.';
            } else {
                 // Keep loadError for display, but don't necessarily redirect for other errors
                 loadError = error?.body || error?.message || 'Failed to load user data.';
            }
            currentUser = null; // Ensure user is null on error
        }
    }

    // Perform redirect in the browser *after* load function completes
    if (needsRedirect && browser) {
        console.log("/app layout: Triggering goto('/')");
        await goto('/'); // Redirect to home/login page
    }

    return {
        currentUser, // Can be null if not logged in or fetch failed
        loadError    // Pass error information if needed
    };
} 