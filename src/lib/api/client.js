import { browser } from '$app/environment';
// Use dynamic public env var (must be prefixed with PUBLIC_ in .env or set at runtime)
import { env } from '$env/dynamic/public'; 
import axios from 'axios'; // Restore Axios import
import JSONBig from 'json-bigint'; // Keep json-bigint

// Remove temporary workaround
// const PUBLIC_API_BASE_URL = 'http://localhost:3000/api/v1';

// Initialize JSONBig parser instance ONCE
const JSONBigNative = JSONBig({ useNativeBigInt: true });

// Define a custom error class (restore Axios config type)
export class ApiError extends Error {
    /** @type {number | undefined} */
    status;
    /** @type {any} */
    body;
    /** @type {import('axios').AxiosRequestConfig | undefined} */
    config; // Restore Axios config

    /**
     * @param {string} message
     * @param {number | undefined} [status]
     * @param {any} [body]
     * @param {import('axios').AxiosRequestConfig | undefined} [config]
     */
    constructor(message, status = undefined, body = undefined, config = undefined) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
        this.config = config;
    }
}

// Function to get the auth token value from cookies
export function getAuthToken() {
    if (!browser) return null; // Cookies only available in browser

    const rawCookies = document.cookie;
    const cookies = rawCookies.split('; ');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'auth_token') {
            const tokenValue = decodeURIComponent(value);
            return tokenValue;
        }
    }
    return null;
}

// NEW: Function to set the auth token cookie client-side
/**
 * Sets the auth_token cookie.
 * @param {string | null} token The token value, or null to clear.
 */
export function setAuthCookie(token) {
    if (!browser) return;

    if (token) {
        // Set cookie, NOT HttpOnly, secure in prod ideally
        // Set Max-Age for persistence (e.g., 1 day)
        const maxAge = 60 * 60 * 24; // 1 day in seconds
        document.cookie = `auth_token=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`; // Add Secure if using HTTPS
    } else {
        // Clear cookie
        document.cookie = `auth_token=; Path=/; Max-Age=0; SameSite=Lax`; // Add Secure if using HTTPS
    }
}

// Create an axios instance with default configuration
const axiosInstance = axios.create({
    baseURL: env.PUBLIC_API_BASE_URL,
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    },
    // Keep json-bigint for parsing
    transformResponse: [data => {
        if (typeof data === 'string') {
            try {
                return JSONBig({ useNativeBigInt: true }).parse(data);
            } catch (e) {
                return data;
            }
        }
        return data;
    }]
});

// Restore the request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken(); // Check cookie
        if (token) {
            // Set Authorization header directly (Axios ensures config.headers exists)
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // No token found
        }
        return config;
    },
    (error) => {
        // REMOVED: console.error('Axios Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for centralized error handling (restore Axios error check)
axiosInstance.interceptors.response.use(
    (response) => {
        // Return the transformed data (with BigInt)
        return response.data;
    },
    (error) => {
        // Handle errors (non-2xx status codes or network errors)
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            const config = error.config;
            // REMOVED: console.error(`API Error: ${status}`, errorData, `| Request: ${config?.method?.toUpperCase()} ${config?.url}`);
            throw new ApiError(
                error.message,
                status,
                errorData,
                config
            );
        } else {
            // Handle non-Axios errors 
            // REMOVED: console.error('Non-Axios Error:', error);
            throw new ApiError(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

// Log confirmation that interceptors are set
// REMOVED: console.log('[client.js] Axios instance created and interceptors configured.');

/**
 * Generic API client function using fetch.
 * Handles base URL, auth token, JSON parsing/stringifying with BigInt support.
 * @param {string} endpoint The API endpoint (e.g., '/users/me').
 * @param {'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'} [method='GET'] The HTTP method.
 * @param {any} [body] The request body for POST/PATCH/PUT.
 * @returns {Promise<any>} The parsed JSON response.
 * @throws {ApiError} Throws an ApiError for non-2xx responses.
 */
export async function apiClient(endpoint, method = 'GET', body = null) {
    const baseUrl = env.PUBLIC_API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;

    // Create headers object
    const headers = new Headers();
    headers.append('Accept', 'application/json');

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    /** @type {RequestInit} */
    const options = {
        method,
        headers,
        mode: 'cors', 
        cache: 'no-cache',
        body: undefined // Initialize body (RequestInit allows string | ReadableStream | Blob | etc. or undefined/null)
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        headers.append('Content-Type', 'application/json');
        try {
            options.body = JSONBigNative.stringify(body);
        } catch (err) {
             console.error("Failed to stringify request body with JSONBig:", body, err);
             throw new ApiError('Failed to serialize request body', 500, null);
        }
    }

    try {
        // Cast options to RequestInit before fetch
        const response = await fetch(url, /** @type {RequestInit} */ (options));

        let responseBody = null;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            if (text) {
                try {
                    responseBody = JSONBigNative.parse(text);
                } catch (parseError) {
                    console.error('Failed to parse JSON response:', text, parseError);
                    throw new ApiError('Invalid JSON response', response.status, text);
                }
            }
        } else {
             // Handle non-JSON responses if needed, e.g., plain text
            responseBody = await response.text(); 
        }

        if (!response.ok) {
            throw new ApiError(
                `HTTP error ${response.status}`,
                response.status,
                responseBody 
            );
        }

        return responseBody;

    } catch (error) {
        console.error(`API request failed: ${method} ${url}`, error);
        if (error instanceof ApiError) {
            throw error; // Re-throw known API errors
        }
        const message = error instanceof Error ? error.message : String(error);
        throw new ApiError('Network error or failed request', 0, message);
    }
}

// Type definitions based on OpenAPI spec (add more as needed)

/**
 * @typedef {object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {object} LoginResponse
 * @property {string} token
 */

/**
 * @typedef {object} Guild
 * @property {bigint} id
 * @property {string} name
 * @property {bigint} icon
 * @property {bigint} owner
 * @property {boolean} public
 */

/**
 * @typedef {object} User
 * @property {bigint} id
 * @property {string} name
 * @property {string} discriminator
 * @property {bigint} avatar
 */

// DO NOT export setAuthCookie or getAuthToken directly if only used internally/by auth.js 

/**
 * Uploads a file to a pre-signed URL.
 * @param {string} uploadUrl The pre-signed URL.
 * @param {File} file The file object to upload.
 * @returns {Promise<void>}
 */
export async function uploadFile(uploadUrl, file) {
    try {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                // Let browser set Content-Type based on file type if possible
                // OR set it explicitly if required by the storage provider:
                 'Content-Type': file.type || 'application/octet-stream' 
            }
        });

        if (!response.ok) {
            // Attempt to read error details from storage provider response
            let errorDetails = `HTTP error ${response.status}`;
            try {
                 const text = await response.text();
                 errorDetails += `: ${text}`;
            } catch {}
            throw new Error(`File upload failed: ${errorDetails}`);
        }

        console.log("File uploaded successfully to:", uploadUrl);

    } catch (error) {
        console.error(`Failed to upload file to ${uploadUrl}:`, error);
        throw error;
    }
} 