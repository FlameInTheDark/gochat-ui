import { apiClient, ApiError } from './client';

/** @typedef {{id: string, name: string, type: 'text' | 'voice', topic?: string, unread?: boolean}} Channel */
/** @typedef {Record<string, Channel[]>} MockChannelData */

// Mock channel data keyed by server ID
/** @type {MockChannelData} */
const mockChannelsByServer = {
    '123456789012345678': [ // Svelte Nerds
        { id: '1001', name: 'general', type: 'text', topic: 'Talk about SvelteKit', unread: true },
        { id: '1002', name: 'help', type: 'text', topic: 'Ask questions here', unread: false },
        { id: '1003', name: 'showcase', type: 'text', topic: 'Show off your projects', unread: true },
        { id: '1004', name: 'Lounge', type: 'voice' },
    ],
    '987654321098765432': [ // Tailwind Fanatics
        { id: '2001', name: 'general', type: 'text', topic: 'All things Tailwind', unread: false },
        { id: '2002', name: 'config-wizards', type: 'text', topic: 'Advanced config talk', unread: false },
        { id: '2003', name: 'Pairing', type: 'voice' },
    ],
    '112233445566778899': [ // GoChat Dev
        { id: '3001', name: 'frontend', type: 'text', topic: 'UI development chat', unread: false },
        { id: '3002', name: 'backend', type: 'text', topic: 'API and server logic', unread: false },
        { id: '3003', name: 'bugs', type: 'text', topic: 'Report issues', unread: true },
    ],
    '101112131415161718': [ // Another Server...
        { id: '4001', name: 'random', type: 'text', topic: 'Off-topic chat', unread: false },
    ],
};

/**
 * @param {bigint} guildId
 */
export async function getGuildChannels(guildId) {
    try {
        const channels = await apiClient(`/guild/${guildId}/channel`, 'GET');
        return channels || [];
    } catch (error) {
        console.error(`Error fetching channels for guild ${guildId}:`, error);
        return []; // Return empty array on error
    }
}

/**
 * @param {bigint} guildId
 * @param {{name: string, private: boolean, parent_id?: number, type?: number}} channelData
 */
export async function createChannel(guildId, channelData) {
    try {
        const response = await apiClient(`/guild/${guildId}/channel`, 'POST', channelData);
        return response; // Assuming API returns the created channel
    } catch (error) {
        console.error(`Failed to create channel in guild ${guildId}:`, error);
        throw error;
    }
}

/**
 * @param {bigint} guildId
 * @param {bigint} channelId
 */
export async function deleteChannel(guildId, channelId) {
    try {
        const response = await apiClient(`/guild/${guildId}/channel/${channelId}`, 'DELETE');
        return response; // Likely empty or simple success message
    } catch (error) {
        console.error(`Failed to delete channel ${channelId} from guild ${guildId}:`, error);
        throw error;
    }
}

/**
 * @param {bigint} guildId
 * @param {{name: string, private: boolean}} categoryData
 */
export async function createCategory(guildId, categoryData) {
    try {
        const response = await apiClient(`/guild/${guildId}/category`, 'POST', categoryData);
        return response; 
    } catch (error) {
        console.error(`Failed to create category in guild ${guildId}:`, error);
        throw error;
    }
}

/**
 * @param {bigint} guildId
 * @param {bigint} categoryId
 */
export async function deleteCategory(guildId, categoryId) {
    try {
        const response = await apiClient(`/guild/${guildId}/category/${categoryId}`, 'DELETE');
        return response;
    } catch (error) {
        console.error(`Failed to delete category ${categoryId} from guild ${guildId}:`, error);
        throw error;
    }
}

/**
 * @param {bigint} channelId
 */
export async function getChannel(channelId) {
    try {
        const channel = await apiClient(`/channel/${channelId}`, 'GET');
        return channel;
    } catch (error) {
        console.error(`Error fetching channel ${channelId}:`, error);
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * [MOCK] Fetches details for a specific channel across all servers.
 * Note: This is inefficient for mock data but simulates finding a channel by its unique ID.
 * @param {string} channelId The ID of the channel.
 * @returns {Promise<Channel | null>} The channel details or null if not found.
 */
export async function getChannelDetails(channelId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 60));

    for (const serverId in mockChannelsByServer) {
        const channel = mockChannelsByServer[serverId].find(c => c.id === channelId);
        if (channel) {
            return Promise.resolve(channel);
        }
    }

    return Promise.resolve(null); // Channel not found in any server
}

// Add more channel functions later (e.g., getChannelDetails) 