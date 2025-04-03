// Mock data - replace with actual API call later (e.g., using Axios)
const mockServers = [
	{ id: '123456789012345678', name: 'Svelte Nerds', imageUrl: 'https://svelte.dev/favicon.png', hasNotification: true },
	{ id: '987654321098765432', name: 'Tailwind Fanatics', imageUrl: 'https://tailwindcss.com/favicons/favicon-32x32.png?v=3', hasNotification: false },
	{ id: '112233445566778899', name: 'GoChat Dev', imageUrl: null, hasNotification: false }, // Fallback to initials
    { id: '101112131415161718', name: 'Another Server With A Long Name', imageUrl: null, hasNotification: true },
];

/** @typedef {{id: string, name: string, imageUrl: string | null, hasNotification: boolean}} Server */

/**
 * Fetches the list of servers for the current user.
 * @returns {Promise<Server[]>}
 */
export async function getServers() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // In a real app, you would use Axios or fetch here:
    // try {
    //     const response = await axios.get('/api/servers');
    //     return response.data;
    // } catch (error) {
    //     console.error("Error fetching servers:", error);
    //     return []; // Return empty array on error
    // }

    console.log("Returning mock server data");
    return Promise.resolve(mockServers);
}

/**
 * Fetches details for a specific server.
 * @param {string} serverId The ID of the server.
 * @returns {Promise<Server | null>} The server details or null if not found.
 */
export async function getServerDetails(serverId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));

    const server = mockServers.find(s => s.id === serverId);
    console.log(`Returning mock details for server ${serverId}: ${server ? 'Found' : 'Not Found'}`);
    return Promise.resolve(server || null);
}

// We can add more server-related API functions here later,
// e.g., createServer, etc. 