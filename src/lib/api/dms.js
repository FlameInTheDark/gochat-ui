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
    await new Promise(resolve => setTimeout(resolve, 80));
    console.log("Returning mock Direct Messages (Array)");
    // Sort the array directly
    const sortedMessages = [...mockDirectMessages]; // Create a copy before sorting
    sortedMessages.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        // @ts-ignore 
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });
    return Promise.resolve(sortedMessages);
}

// Add getFriends, etc. later 