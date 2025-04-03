import { apiClient, setAuthToken, ApiError } from './client';

// --- JSDoc Types --- (Add more from spec as needed)

/**
 * @typedef {import('./client').LoginRequest} LoginRequest
 */

/**
 * @typedef {import('./client').LoginResponse} LoginResponse
 */

/**
 * @typedef {object} RegisterRequest
 * @property {string} email
 */

/**
 * @typedef {object} ConfirmationRequest
 * @property {number} id - User ID from confirmation link.
 * @property {string} token - Confirmation token from link.
 * @property {string} name - Desired display name.
 * @property {string} password - Chosen password.
 * @property {string} discriminator - Desired unique username (e.g., "flameinthedark").
 */

// --- API Functions ---

/**
 * Sends a registration request to the API.
 * @param {RegisterRequest} registrationData
 * @returns {Promise<string | undefined>} - Success message or undefined on success.
 * @throws {ApiError} - Throws an ApiError on failure.
 */
export async function registerUser(registrationData) {
    try {
        // The spec indicates 201 returns a string message
        const responseMessage = await apiClient('/auth/registration', 'POST', registrationData);
        return responseMessage; // May be undefined if API returns no body on success
    } catch (error) {
        console.error('Registration failed:', error);
        // Re-throw the error to be handled by the UI
        throw error; 
    }
}

/**
 * Sends a login request to the API.
 * @param {LoginRequest} loginData
 * @returns {Promise<LoginResponse>} - The login response containing the token.
 * @throws {ApiError} - Throws an ApiError on failure.
 */
export async function loginUser(loginData) {
    try {
        const response = await apiClient('/auth/login', 'POST', loginData);
        if (response?.token) {
            setAuthToken(response.token); // Store the token
        } else {
            // Handle case where token is missing in response
            throw new ApiError('Login successful, but no token received.', 200, response);
        }
        return response;
    } catch (error) {
        console.error('Login failed:', error);
        setAuthToken(null); // Clear token on login failure
        throw error;
    }
}

/**
 * Logs the user out by clearing the stored token.
 */
export function logoutUser() {
    setAuthToken(null);
    // Optionally: Add API call to invalidate token on the server if needed
}

/**
 * Sends the final confirmation data to complete registration.
 * @param {ConfirmationRequest} confirmationData
 * @returns {Promise<string | undefined>} - Success message or undefined.
 * @throws {ApiError}
 */
export async function confirmRegistration(confirmationData) {
    try {
        // Spec: 201 returns a string message
        const responseMessage = await apiClient('/auth/confirmation', 'POST', confirmationData);
        console.log("Confirmation successful:", responseMessage);
        return responseMessage; // Or a standard success indicator
    } catch (error) {
        console.error('Confirmation failed:', error);
        throw error; // Re-throw for the UI
    }
} 