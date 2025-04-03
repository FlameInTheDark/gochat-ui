import { error } from '@sveltejs/kit';
import { getDirectMessages } from '$lib/api/dms.js';
// We'll need to add this function and mock data later
import { getMessagesForDm } from '$lib/api/messages.js'; 

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    console.log(`Loading data for /app/me/${params.user_id}`);
    const userId = params.user_id;

    try {
        // Fetch all DMs to find the details for this specific one
        const allDms = await getDirectMessages(); // Assuming this returns the array
        const dmDetails = allDms.find(dm => dm.id === userId);

        if (!dmDetails) {
            throw error(404, `DM conversation with ID ${userId} not found`);
        }

        // Fetch messages for this specific DM
        // TODO: Implement getMessagesForDm and add mock data in messages.js
        const messages = await getMessagesForDm(userId); 

        return {
            dmDetails,
            messages,
            userId // Pass userId along for potential use in the component
        };
    } catch (err) {
        console.error(`Error loading data for DM ${userId}:`, err);
        // Propagate error or handle gracefully
        if (err && typeof err === 'object' && 'status' in err) { // Check if it looks like a SvelteKit error
            throw err;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw error(500, `Failed to load DM conversation: ${message}`);
    }
} 