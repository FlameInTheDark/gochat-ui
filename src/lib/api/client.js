import { browser } from '$app/environment';
// Use static public env var (Ensure PUBLIC_API_BASE_URL is in .env)
import { PUBLIC_API_BASE_URL } from '$env/static/public'; 
import axios from 'axios'; // Import axios

// Remove temporary workaround
// const PUBLIC_API_BASE_URL = 'http://localhost:3000/api/v1';

// Define a custom error class
export class ApiError extends Error {
    /** @type {number | undefined} */
    status;
    /** @type {any} */
    body;
    /** @type {import('axios').AxiosRequestConfig | undefined} */
    config;

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

// Function to get the auth token
function getAuthToken() {
    if (browser) {
        return localStorage.getItem('authToken');
    }
    return null;
}

// Function to set the auth token
/** @param {string | null} token */
export function setAuthToken(token) {
    if (browser) {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }
}

// Create an axios instance with default configuration
const axiosInstance = axios.create({
    baseURL: PUBLIC_API_BASE_URL,
    timeout: 10000, // Example timeout: 10 seconds
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to inject the auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ? `| Data: ${JSON.stringify(config.data)}` : '');
        return config;
    },
    (error) => {
        console.error('Axios Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for centralized error handling
axiosInstance.interceptors.response.use(
    (response) => {
        // Successful response (2xx status code)
        return response.data; // Directly return the data
    },
    (error) => {
        // Handle errors (non-2xx status codes or network errors)
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            const config = error.config;
            console.error(`API Error: ${status}`, errorData, `| Request: ${config?.method?.toUpperCase()} ${config?.url}`);
            throw new ApiError(
                error.message,
                status,
                errorData,
                config
            );
        } else {
            // Handle non-Axios errors (e.g., network issues before request sent)
            console.error('Non-Axios Error:', error);
            throw new ApiError(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

/**
 * Makes an authenticated request to the API using axios.
 * Delegates to the pre-configured axios instance.
 * @param {string} endpoint
 * @param {string} [method='GET']
 * @param {object} [data] - Request data/body
 * @param {import('axios').AxiosRequestConfig} [config] - Optional axios config overrides
 * @returns {Promise<any>}
 * @throws {ApiError}
 */
export function apiClient(endpoint, method = 'GET', data = undefined, config = {}) {
    return axiosInstance({
        url: endpoint,
        method,
        data,
        ...config, // Merge optional config overrides
    });
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
 * @property {number} id
 * @property {string} name
 * @property {number} icon
 * @property {number} owner
 * @property {boolean} public
 */

/**
 * @typedef {object} User
 * @property {number} id
 * @property {string} name
 * @property {string} discriminator
 * @property {number} avatar - Assuming avatar is an ID, adjust if it's a URL string
 */ 