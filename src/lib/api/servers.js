import { apiClient, ApiError } from './client';

/** @typedef {import('./client').Guild} Guild */

/**
 * @typedef {object} CreateGuildPayload
 * @property {string} name
 * @property {string | null} [icon] - Base64 encoded image data or null
 */

/**
 * Fetches the list of guilds (servers) for the current user.
 * @returns {Promise<Guild[]>}
 */
export async function getServers() {
    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 150));

    // In a real app, you would use Axios or fetch here:
    try {
        // The actual API endpoint from the Swagger spec
        const responseData = await apiClient('/user/me/guilds', 'GET');
        // Assuming the API returns an array of Guild objects
        // TODO: Add validation/transformation if the API response structure differs
        return responseData || [];
    } catch (error) {
        console.error("Error fetching servers:", error);
        return []; // Return empty array on error
    }

    // console.log("Returning mock server data");
    // return Promise.resolve(mockServers);
}

/**
 * Fetches details for a specific server.
 * @param {bigint} guildId The ID of the guild (server).
 * @returns {Promise<Guild | null>} The guild details or null if not found.
 */
export async function getServerDetails(guildId) {
    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 50));

    // const server = mockServers.find(s => s.id === serverId);
    // console.log(`Returning mock details for server ${serverId}: ${server ? 'Found' : 'Not Found'}`);
    // return Promise.resolve(server || null);

    try {
        const responseData = await apiClient(`/guild/${guildId}`, 'GET');
        // Assuming the API returns a single Guild object
        // TODO: Add validation/transformation if the API response structure differs
        return responseData || null;
    } catch (error) {
        // Handle specific errors like 404 (Not Found) if needed
        console.error(`Error fetching server details for ID ${guildId}:`, error);
        return null; // Return null on error
    }
}

// We can add more server-related API functions here later,
// e.g., createServer, etc.

/**
 * Creates a new guild (server).
 * @param {{name: string, icon_id?: number, public?: boolean}} guildData The data for the new guild.
 * @returns {Promise<Guild>} The created guild object.
 */
export async function createGuild(guildData) {
	// TODO: Handle icon upload separately if needed, icon_id might be set after upload
	const responseData = await apiClient('/guild', 'POST', guildData);
	return responseData; // Assuming the API returns the created guild object
}

/**
 * Fetches the guilds for the currently authenticated user.
 * Assumes the apiClient handles adding the auth token.
 * @returns {Promise<Guild[] | null>}
 * @throws {ApiError}
 */
export async function getCurrentUserGuilds() {
    try {
        const guilds = await apiClient('/user/me/guilds', 'GET');
        if (Array.isArray(guilds)) {
            return guilds;
        } else {
            console.warn('[servers.js] API response for guilds was not an array:', guilds);
            return null;
        }
    } catch (error) {
        console.error('API Error fetching current user guilds:', error);
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
             console.log('[servers.js] Unauthorized fetching guilds.');
             throw error;
        } 
        return null; 
    }
}

/**
 * Creates a new server/guild.
 * @param {CreateGuildPayload} payload
 * @returns {Promise<Guild>}
 */
export async function createServer(payload) {
    try {
        const newServer = await apiClient('/guild', 'POST', payload);
        return newServer;
    } catch (error) {
        console.error('API Error creating server:', error);
        throw error;
    }
} 