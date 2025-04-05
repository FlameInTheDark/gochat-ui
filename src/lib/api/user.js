import { apiClient, ApiError } from './client';

// --- JSDoc Types ---
/**
 * @typedef {import('./client').User} User
 */

// --- API Functions ---

/**
 * Fetches the current user's data using the authentication cookie.
 * @returns {Promise<import('./client').User | null>}
 */
export async function getUserMe() {
    try {
        const user = await apiClient('/user/me', 'GET');
        return user;
    } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            throw error;
        }
        console.error('API Error fetching current user:', error);
        throw error; 
    }
}

/**
 * Fetches data for a specific user by ID.
 * @param {bigint} userId The ID of the user.
 * @returns {Promise<User | null>}
 * @throws {ApiError}
 */
export async function getUser(userId) {
    try {
        // Use bigint for ID in URL
        const user = await apiClient(`/user/${userId}`, 'GET');
        return user;
    } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        if (error instanceof ApiError && error.status === 404) {
            return null; // Return null if user not found
        }
        throw error; // Re-throw other errors
    }
}

/**
 * Modifies the current user's data.
 * @param {object} data - The data to modify (e.g., { Name: 'New Name' })
 * @returns {Promise<any>}
 */
export async function modifyUserMe(data) {
    try {
        // Call apiClient as a function, passing data
        // No need for manual headers here, interceptor handles client-side
        const responseData = await apiClient(
            "/me", 
            'PATCH', 
            data // Pass data as request body
        );
        return responseData;
    } catch (error) {
        console.error("API Error modifying user:", error);
        throw error; // Re-throw or handle specific errors
    }
}

// Add other user-related API functions later (e.g., modifyUser) 