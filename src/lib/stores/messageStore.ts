import { writable } from 'svelte/store';
// Import the definitive Message type from types.d.ts
import type { Message } from '$lib/types.d.ts'; 

// Define the structure for the store value
// Maps channelId (as string for key) to an array of Messages
export type MessageStoreData = Record<string, Message[] | undefined>;

// Create the writable store
export const messageStore = writable<MessageStoreData>({});

// Helper function to add a message to the store
// Ensure this function accepts the correct Message type
export function addMessageToStore(newMessage: Message) { 
    // Use channel_id (bigint) from the Message type
    if (!newMessage?.channel_id) return;
    
    // Convert bigint channel_id to string for use as Record key
    const channelIdStr = newMessage.channel_id.toString();

    messageStore.update(currentMessages => {
        const channelMessages = currentMessages[channelIdStr] || [];
        
        // Check if message already exists
        const messageExists = channelMessages.some(msg => {
             return msg.id === newMessage.id;
        });

        if (!messageExists) {
             currentMessages[channelIdStr] = [...channelMessages, newMessage];
        }
        // Ensure a new object is returned for reactivity
        return { ...currentMessages }; 
    });
}

// Helper function to set the initial batch of messages for a channel
export function setInitialMessagesForChannel(channelId: bigint, initialMessages: Message[]) {
    if (!channelId) return;
    
    const channelIdStr = channelId.toString();

    messageStore.update(currentMessages => {
        // Replace existing messages for this channel with the initial batch
        currentMessages[channelIdStr] = initialMessages;
        
        // Ensure a new object is returned for reactivity
        return { ...currentMessages }; 
    });
}

// NEW Helper function to remove a message from the store
export function removeMessageFromStore(channelId: bigint, messageId: bigint) {
    if (!channelId || !messageId) return;

    const channelIdStr = channelId.toString();

    messageStore.update(currentMessages => {
        const channelMessages = currentMessages[channelIdStr];
        if (channelMessages) {
            const updatedMessages = channelMessages.filter(msg => msg.id !== messageId);
            // Only update if the message was actually found and removed
            if (updatedMessages.length < channelMessages.length) {
                 currentMessages[channelIdStr] = updatedMessages;
                 // Ensure a new object is returned for reactivity
                 return { ...currentMessages }; 
            }
        }
        // Return original state if no changes were made
        return currentMessages;
    });
}

// TODO: Add functions to handle message edits, deletions etc. if needed 