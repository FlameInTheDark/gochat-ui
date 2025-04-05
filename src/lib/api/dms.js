import { apiClient } from "./client";

/** 
 * @typedef {object} DirectMessageConversation
 * @property {string} id - Unique ID (user ID for DMs, group ID for group DMs)
 * @property {'DM' | 'GROUP'} type
 * @property {string[]} recipientIds - IDs of users involved (excluding self for DMs)
 * @property {string} name - Display name (user name for DMs, group name for groups)
 * @property {string | null} iconUrl - Avatar URL for DMs, potential group icon for groups
 * @property {{ content: string, timestamp: string } | null} [lastMessage] - Preview of the last message
 * @property {{id: string, name: string}[]} [members] - Optional: Array of member objects (primarily for groups)
 */

// Mock DM Data

const mockDirectMessages = [
    {
        id: '8001', // Numeric String ID
        type: 'DM', recipientIds: ['555000222'], name: 'Bob',
        iconUrl: 'https://i.pravatar.cc/40?img=1',
        lastMessage: { content: 'Sure, I can help with that Svelte code.', timestamp: '2023-10-26T14:30:00Z' }
    },
    {
        id: '8002', // Numeric String ID
        type: 'DM', recipientIds: ['555000555'], name: 'Eve',
        iconUrl: 'https://i.pravatar.cc/40?img=5',
        lastMessage: { content: 'Did you see the new Tailwind release?', timestamp: '2023-10-26T09:16:00Z' }
    },
    {
        id: '9001', // Numeric String ID (Group)
        type: 'GROUP', recipientIds: ['555000333', '555000666'], name: 'Project GoChat Planning',
        iconUrl: null,
        lastMessage: { content: "Let's sync up tomorrow morning.", timestamp: '2023-10-25T18:00:00Z' },
        members: [ {id: 'YOUR_USER_ID', name: 'You'}, {id: '8001', name: 'Bob'}, {id: '8002', name: 'Eve'} ] // Added names
    },
    {
        id: '8003', // Numeric String ID
        type: 'DM', recipientIds: ['555000777'], name: 'Grace',
        iconUrl: 'https://i.pravatar.cc/40?img=8', lastMessage: null
    },
];

// Fetches the list of Direct Message conversations
export async function getDirectMessages() {
    // TODO: Fetch actual DMs from API endpoint (e.g., /user/me/channels?type=DM)
    // REMOVED: console.log(...)
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
    return Promise.resolve(mockDirectMessages);
}

/**
 * Create a DM channel with a specific user.
 * @param {bigint} recipientId 
 * @returns {Promise<import("$lib/types").Channel>} // Use JSDoc import type
 */
export async function createDM(recipientId) {
    try {
        const response = await apiClient('/user/me/channels', 'POST', { recipient_id: recipientId });
        // REMOVED: console.log(...)
        // API might return the channel object or just success
        // Assuming it returns the channel for now
        return response;
    } catch (error) {
        console.error(`Failed to create DM with user ${recipientId}:`, error);
        throw error;
    }
}

/**
 * Create a group DM channel.
 * @param {{ recipients_id: bigint[] }} payload 
 * @returns {Promise<import("$lib/types").Channel>} // Use JSDoc import type
 */
export async function createGroupDM(payload) {
    try {
        const response = await apiClient('/user/me/channels/group', 'POST', payload);
        // REMOVED: console.log(...)
        return response;
    } catch (error) {
        console.error('Failed to create group DM:', error);
        throw error;
    }
}

/**
 * Creates a new DM channel with a recipient.
 * @param {bigint} recipientId The ID of the user to create a DM with.
 * @returns {Promise<import("$lib/types").Channel>} // Use JSDoc import type
 */
export async function createDMChannel(recipientId) {
    const payload = { recipient_id: recipientId };
    try {
        // Assuming the API returns the created Channel object on success
        const newChannel = await apiClient('/user/me/channels', 'POST', payload);
        // TODO: Adapt if API only returns "ok" or an ID
        return newChannel; 
    } catch (error) {
        console.error(`Failed to create DM channel with user ${recipientId}:`, error);
        throw error;
    }
}

// Add getFriends, etc. later 