/** @typedef {{id: string, authorId: string, authorName: string, authorAvatarUrl: string | null, timestamp: string, content: string, edited?: boolean }} Message */
/** @typedef {Record<string, Message[]>} MockMessageData */

// Mock message data keyed by channel ID
/** @type {MockMessageData} */
const mockMessagesByChannel = {
    '1001': [ // #general in Svelte Nerds (formerly svelte-1)
        { id: '777000001', authorId: '555000222', authorName: 'Bob', authorAvatarUrl: 'https://i.pravatar.cc/40?img=1', timestamp: '2023-10-26T10:00:00Z', content: 'Morning everyone! Any cool SvelteKit updates?' },
        { id: '777000002', authorId: '555000111', authorName: 'Alice', authorAvatarUrl: null, timestamp: '2023-10-26T10:01:30Z', content: 'Just the usual bug fixes I think. Check the repo!' },
        { id: '777000003', authorId: '555000333', authorName: 'Charlie', authorAvatarUrl: 'https://i.pravatar.cc/40?img=3', timestamp: '2023-10-26T10:05:00Z', content: 'Anyone tried the new Paraglide JS library? Looks interesting for i18n.', edited: true },
    ],
    '1002': [ // #help in Svelte Nerds (formerly svelte-2)
        { id: '777000004', authorId: '555000444', authorName: 'David', authorAvatarUrl: null, timestamp: '2023-10-26T11:20:00Z', content: 'How do I bind component props reactively?' },
    ],
    '2001': [ // #general in Tailwind Fanatics (formerly tw-1)
        { id: '777000005', authorId: '555000555', authorName: 'Eve', authorAvatarUrl: 'https://i.pravatar.cc/40?img=5', timestamp: '2023-10-26T09:15:00Z', content: 'Loving the new `container` queries!' },
    ],
    '3001': [ // #frontend in GoChat Dev (formerly gc-1)
        { id: '777000006', authorId: '555000666', authorName: 'Frank', authorAvatarUrl: 'https://i.pravatar.cc/40?img=7', timestamp: '2023-10-25T15:00:00Z', content: 'Started working on the login page UI.' },
        { id: '777000007', authorId: '555000111', authorName: 'Alice', authorAvatarUrl: null, timestamp: '2023-10-25T15:02:00Z', content: 'Nice! Using SvelteKit?' },
        { id: '777000008', authorId: '555000666', authorName: 'Frank', authorAvatarUrl: 'https://i.pravatar.cc/40?img=7', timestamp: '2023-10-25T15:03:00Z', content: 'Yep, with Tailwind for styling.' },
    ],
    // Add more channels as needed...
};

// Mock message data for DMs, keyed by the OTHER user's ID (or group DM ID)
/** @type {MockMessageData} */
const mockMessagesByDm = {
    '8001': [ // Bob
        { id: '999000001', authorId: '8001', authorName: 'Bob', authorAvatarUrl: 'https://i.pravatar.cc/40?img=1', timestamp: '2023-10-27T09:00:00Z', content: 'Hey, how\'s the project going?' },
        { id: '999000002', authorId: 'YOUR_USER_ID', authorName: 'You', authorAvatarUrl: null, timestamp: '2023-10-27T09:01:00Z', content: 'Pretty good, almost done with the layout refactor.' },
        { id: '999000003', authorId: '8001', authorName: 'Bob', authorAvatarUrl: 'https://i.pravatar.cc/40?img=1', timestamp: '2023-10-27T09:01:30Z', content: 'Sure, I can help with that Svelte code.' },
    ],
    '8002': [ // Eve
        { id: '999000004', authorId: '8002', authorName: 'Eve', authorAvatarUrl: 'https://i.pravatar.cc/40?img=5', timestamp: '2023-10-27T11:10:00Z', content: 'Did you see the new Tailwind release?' },
        { id: '999000005', authorId: 'YOUR_USER_ID', authorName: 'You', authorAvatarUrl: null, timestamp: '2023-10-27T11:12:00Z', content: 'Not yet, what\'s new?' },
    ],
    '9001': [ // Project GoChat Planning (Group DM)
        { id: '999000006', authorId: '8001', authorName: 'Bob', authorAvatarUrl: 'https://i.pravatar.cc/40?img=1', timestamp: '2023-10-26T16:00:00Z', content: 'We should define the API endpoints soon.' },
        { id: '999000007', authorId: '8002', authorName: 'Eve', authorAvatarUrl: 'https://i.pravatar.cc/40?img=5', timestamp: '2023-10-26T16:05:00Z', content: 'Agreed. I\'ll draft something up.' },
        { id: '999000008', authorId: 'YOUR_USER_ID', authorName: 'You', authorAvatarUrl: null, timestamp: '2023-10-26T16:06:00Z', content: 'Sounds good.' },
        { id: '999000009', authorId: '8001', authorName: 'Bob', authorAvatarUrl: 'https://i.pravatar.cc/40?img=1', timestamp: '2023-10-27T08:30:00Z', content: 'Let\'s sync up tomorrow morning.' },
    ],
    // Add more DMs as needed...
};

/**
 * Fetches the list of messages for a given channel.
 * @param {string} channelId The ID of the channel.
 * @returns {Promise<Message[]>}
 */
export async function getMessages(channelId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 180));

    // In a real app, fetch from `/api/channels/${channelId}/messages`
    // You might also add parameters for pagination (e.g., before/after message IDs)
    console.log(`Returning mock messages for channel ${channelId}`);
    return Promise.resolve(mockMessagesByChannel[channelId] || []);
}

/**
 * Fetches the list of messages for a given DM conversation.
 * @param {string} userId The ID of the other user or group DM.
 * @returns {Promise<Message[]>}
 */
export async function getMessagesForDm(userId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150)); 

    // In a real app, fetch from `/api/dms/${userId}/messages`
    console.log(`Returning mock messages for DM ${userId}`);
    return Promise.resolve(mockMessagesByDm[userId] || []);
}

// Add more message functions later (e.g., sendMessage, editMessage, deleteMessage) 