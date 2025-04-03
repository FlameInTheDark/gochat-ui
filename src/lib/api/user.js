import { apiClient, ApiError } from './client';

// --- JSDoc Types ---
/**
 * @typedef {import('./client').User} User
 */

// --- API Functions ---

/**
 * Fetches the current logged-in user's data.
 * Requires authentication token to be set.
 * @param {typeof fetch} [fetchFn] - Optional fetch function (for server-side use).
 * @returns {Promise<User>} - The user data.
 * @throws {ApiError} - Throws an ApiError on failure (e.g., 401 Unauthorized).
 */
export async function getUserMe(fetchFn) {
    try {
        // The spec uses GET /user/{user_id} with 'me' as the ID
        const user = await apiClient('/user/me', 'GET');
        return user;
    } catch (error) {
        console.error('Failed to fetch current user:', error);
        // Check if it's an unauthorized error, might want specific handling
        // if (error instanceof ApiError && error.status === 401) { ... }
        throw error; // Re-throw for the caller
    }
}

// Add other user-related API functions later (e.g., modifyUser) 