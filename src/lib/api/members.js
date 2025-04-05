import { apiClient } from './client';

/** @typedef {{id: string, name: string, avatarUrl: string | null, status: 'online' | 'idle' | 'dnd' | 'offline', channels?: string[]}} Member */
/** @typedef {Record<string, Member[]>} MockMemberData */

// Mock member data keyed by server ID
/** @type {MockMemberData} */
const mockMembersByServer = {
    '123456789012345678': [ // Svelte Nerds
        { id: '555000111', name: 'Alice', avatarUrl: null, status: 'online', channels: ['1001', '1002', '1003', '1004'] }, // In all
        { id: '555000222', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/40?img=1', status: 'idle', channels: ['1001', '1003'] }, // In general, showcase
        { id: '555000333', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/40?img=3', status: 'dnd', channels: ['1001', '1004'] }, // In general, lounge
        { id: '555000444', name: 'David', avatarUrl: null, status: 'offline', channels: ['1002'] }, // Only in help
    ],
    '987654321098765432': [ // Tailwind Fanatics
        { id: '555000111', name: 'Alice', avatarUrl: null, status: 'online', channels: ['2001', '2002', '2003'] }, // In all
        { id: '555000555', name: 'Eve', avatarUrl: 'https://i.pravatar.cc/40?img=5', status: 'online', channels: ['2001', '2003'] }, // In general, pairing
    ],
    '112233445566778899': [ // GoChat Dev
        { id: '555000111', name: 'Alice', avatarUrl: null, status: 'online', channels: ['3001', '3002', '3003'] }, // In all
        { id: '555000666', name: 'Frank', avatarUrl: 'https://i.pravatar.cc/40?img=7', status: 'online', channels: ['3001', '3002'] }, // In frontend, backend
        { id: '555000777', name: 'Grace', avatarUrl: 'https://i.pravatar.cc/40?img=8', status: 'offline', channels: ['3003'] }, // Only in bugs
    ],
    '101112131415161718': [
        { id: '555000111', name: 'Alice', avatarUrl: null, status: 'online', channels: ['4001'] }, // Only in random
    ],
};

/**
 * @param {string} serverId
 */
export async function getMembers(serverId) {
    // Mock implementation doesn't use fetchFn, but added for consistency
    console.warn(`API for fetching all members for server ${serverId} not implemented yet. Using mock data.`);
    await new Promise(resolve => setTimeout(resolve, 120));
    // @ts-ignore
    return Promise.resolve(mockMembersByServer[serverId] || []);
}

/**
 * @param {bigint} guildId
 */
export async function getCurrentUserGuildMember(guildId) {
    try {
        const member = await apiClient(`/user/me/guilds/${guildId}/member`, 'GET');
        return member;
    } catch (error) {
        console.error(`Failed to fetch current user member for guild ${guildId}:`, error);
        // Optionally handle 404 specifically if needed
        // if (error instanceof ApiError && error.status === 404) return null;
        throw error; // Re-throw for now
    }
}

// Add getMemberProfile later if needed (e.g., GET /guild/{guildId}/members/{userId})

// Add more member functions later (e.g., getMemberProfile) 