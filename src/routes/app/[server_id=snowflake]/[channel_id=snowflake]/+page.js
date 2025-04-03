import { error } from '@sveltejs/kit';
import { getMessages } from '$lib/api/messages.js';
import { getChannelDetails } from '$lib/api/channels.js';
import { getServerDetails } from '$lib/api/servers.js';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const { channel_id, server_id } = params;

    console.log(`Loading page data for server ${server_id}, channel ${channel_id}`);

    try {
        // Fetch details and messages in parallel
        const serverDetailsPromise = getServerDetails(server_id);
        const channelDetailsPromise = getChannelDetails(channel_id);
        const messagesPromise = getMessages(channel_id);

        const [serverDetails, channelDetails, messages] = await Promise.all([
            serverDetailsPromise,
            channelDetailsPromise,
            messagesPromise
        ]);

        // Check if server exists
        if (!serverDetails) {
            throw error(404, `Server not found: ${server_id}`);
        }

        // Check if channel exists
        if (!channelDetails) {
            throw error(404, `Channel not found: ${channel_id}`);
        }

        // Optional: Check if the found channel actually belongs to the server_id in the URL
        // (Our mock getChannelDetails doesn't link channel back to server, a real API would)
        // if (channelDetails.serverId !== server_id) { ... }

        return {
            serverId: server_id,
            channelId: channel_id,
            channelName: channelDetails.name,
            channelTopic: channelDetails.topic || "",
            messages: messages,
        };
    } catch (err) {
        // Catch fetch errors or the explicit 404 errors thrown above
        console.error(`Error loading page for channel ${channel_id}:`, err);
        // If it looks like a SvelteKit error (has status), rethrow it
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        // Otherwise, throw a generic 500
        throw error(500, `Failed to load data for channel ${channel_id}`);
    }
} 