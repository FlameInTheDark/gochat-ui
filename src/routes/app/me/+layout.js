import { getDirectMessages } from '$lib/api/dms.js';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutLoad} */
export async function load() {
    console.log("Loading data for /app/me layout");
    try {
        const dms = await getDirectMessages();
        return {
            dms: dms
        };
    } catch (err) {
        console.error("Error loading DMs for layout:", err);
        // Propagate error to be handled by nearest +error.svelte
        throw error(500, "Failed to load direct messages."); 
    }
} 