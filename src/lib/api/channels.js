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
 * Fetches the list of channels for a given server.
 * @param {string} serverId The ID of the server.
 * @returns {Promise<Array<{id: string, name: string, type: 'text' | 'voice', topic?: string, unread?: boolean}>>}
 */
export async function getChannels(serverId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real app, fetch from `/api/servers/${serverId}/channels`
    console.log(`Returning mock channels for server ${serverId}`);
    return Promise.resolve(mockChannelsByServer[serverId] || []);
}

/**
 * Fetches details for a specific channel across all servers.
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
            console.log(`Returning mock details for channel ${channelId}: Found in server ${serverId}`);
            return Promise.resolve(channel);
        }
    }

    console.log(`Returning mock details for channel ${channelId}: Not Found`);
    return Promise.resolve(null); // Channel not found in any server
}

// Add more channel functions later (e.g., getChannelDetails) 