import { apiClient } from './client';

/** @typedef {{id: string, authorId: string, authorName: string, authorAvatarUrl: string | null, timestamp: string, content: string, edited?: boolean }} Message */
/** @typedef {Record<string, Message[]>} MockMessageData */
/** @typedef {import('$lib/types').AttachmentUpload} AttachmentUpload */

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
 * Fetches the list of messages for a given channel from the API.
 * @param {bigint} channelId
 * @returns {Promise<import('$lib/types').Message[]>}
 */
export async function getChannelMessages(channelId) {
    try {
        const rawMessages = await apiClient(`/message/channel/${channelId}`, 'GET');
        
        if (!Array.isArray(rawMessages)) {
            console.error("API response for messages was not an array:", rawMessages);
            return []; // Return empty if response format is unexpected
        }

        // Transform messages to match frontend types and prepend URL
        const messages = rawMessages.map(msg => {
            const transformedAttachments = (msg.attachments || []).map(att => ({
                ...att,
                url: `http://localhost/${att.url.startsWith('/') ? att.url.substring(1) : att.url}`, 
                content_type: 'unknown' // Add placeholder
            }));
            
            return {
                id: msg.id, 
                channel_id: msg.channel_id, 
                content: msg.content ?? '',
                authorId: msg.author?.id, 
                authorName: msg.author?.name,
                authorAvatarUrl: null, // TODO: Map avatar URL if provided by API
                timestamp: msg.updated_at || new Date().toISOString(), // Use updated_at or placeholder
                attachments: transformedAttachments, 
            };
        });

        return messages || [];
    } catch (error) {
        console.error(`Error fetching messages for channel ${channelId}:`, error);
        return []; 
    }
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

/**
 * Sends a message to a channel.
 * @param {bigint} channelId
 * @param {string} content
 * @param {bigint[]} [attachmentIds]
 * @returns {Promise<import('$lib/types').Message>}
 */
export async function sendMessage(channelId, content, attachmentIds = []) {
    // Pass BigInts directly, apiClient will handle serialization
    const payload = { 
        content: content, 
        attachments: attachmentIds 
    };
    try {
        const newMessage = await apiClient(`/message/channel/${channelId.toString()}`, 'POST', payload);
        return newMessage;
    } catch (error) {
        console.error(`Failed to send message to channel ${channelId}:`, error);
        throw error;
    }
}

/**
 * Updates an existing message.
 * @param {bigint} messageId
 * @param {string} content
 */
export async function updateMessage(messageId, content) {
    const payload = { content: content };
    try {
        // Explicitly convert messageId to string for URL path
        const updatedMessage = await apiClient(`/message/${messageId.toString()}`, 'POST', payload);
        return updatedMessage;
    } catch (error) {
        console.error(`Failed to update message ${messageId}:`, error);
        throw error;
    }
}

/**
 * Creates an attachment upload request.
 * @param {bigint} channelId
 * @param {{filename: string, file_size: number, width?: number, height?: number}} attachmentData
 */
export async function createAttachmentUpload(channelId, attachmentData) {
    try {
        // Explicitly convert channelId to string for URL path
        const uploadData = await apiClient(`/message/channel/${channelId.toString()}/attachment`, 'POST', attachmentData);
        return uploadData;
    } catch (error) {
        console.error(`Failed to create attachment upload for channel ${channelId}:`, error);
        throw error;
    }
}

/**
 * Requests an upload URL for an attachment.
 * @param {bigint} channelId The channel ID.
 * @param {{filename: string, fileSize: number, width?: number, height?: number}} fileInfo File metadata.
 * @returns {Promise<import('$lib/types').AttachmentUpload>} 
 */
export async function requestAttachmentUpload(channelId, fileInfo) {
    try {
        const response = await apiClient(`/message/channel/${channelId.toString()}/attachment`, 'POST', {
            filename: fileInfo.filename,
            file_size: fileInfo.fileSize,
            width: fileInfo.width,
            height: fileInfo.height
        });
        return response; 
    } catch (error) {
        console.error(`Failed to request attachment upload for channel ${channelId}:`, error);
        throw error;
    }
}

/**
 * Deletes a specific message.
 * @param {bigint} channelId The ID of the channel the message is in.
 * @param {bigint} messageId The ID of the message to delete.
 * @returns {Promise<any>} // API likely returns success status or maybe the deleted message
 */
export async function deleteMessage(channelId, messageId) {
    try {
        // Explicitly convert IDs to strings for URL path
        const response = await apiClient(`/message/channel/${channelId.toString()}/${messageId.toString()}`, 'DELETE');
        return response;
    } catch (error) {
        console.error(`Failed to delete message ${messageId} from channel ${channelId}:`, error);
        throw error;
    }
} 