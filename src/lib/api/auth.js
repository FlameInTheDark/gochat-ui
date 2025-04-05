import { apiClient, ApiError } from './client';
import { setAuthCookie } from './client';

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
        return await apiClient('/auth/registration', 'POST', registrationData);
    } catch (error) {
        console.error('Registration failed:', error);
        throw error; 
    }
}

/**
 * Sends a login request to the API.
 * Returns the response which includes the token (but doesn't store it here).
 * @param {LoginRequest} loginData
 * @returns {Promise<LoginResponse>} - The login response containing the token.
 * @throws {ApiError} - Throws an ApiError on failure.
 */
export async function loginUser(loginData) {
    try {
        const response = await apiClient('/auth/login', 'POST', loginData);
        if (response?.token) {
            setAuthCookie(response.token);
        } else {
            throw new ApiError('Login successful, but no token in response body.', 200, response);
        }
        return response;
    } catch (error) {
        console.error('Login failed:', error);
        setAuthCookie(null);
        throw error;
    }
}

/**
 * Clears the auth cookie.
 */
export function logoutUser() {
    // Client-side only: Clear the cookie
    if (browser) {
        setAuthCookie(null); 
    }
    // TODO: Add API call to invalidate token/session on backend if necessary
}

/**
 * Sends the final confirmation data to complete registration.
 * @param {ConfirmationRequest} confirmationData
 * @returns {Promise<string | undefined>} - Success message or undefined.
 * @throws {ApiError}
 */
export async function confirmRegistration(confirmationData) {
    try {
        return await apiClient('/auth/confirmation', 'POST', confirmationData);
    } catch (error) {
        console.error('Confirmation failed:', error);
        throw error;
    }
} 