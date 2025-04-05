import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    const { userId, token } = params;

    if (!browser) {
        console.log(`SSR Load for /confirm route. Params:`, params);
    }

    console.log(`Loading confirmation page for userId: ${userId}, token: ${token}`);

    if (!userId || !token) {
        // Optional: Throw an error or return a specific state if params are missing
        console.error('Missing userId or token in confirmation route parameters.');
        // throw error(400, 'Invalid confirmation link: Missing details.'); 
    }

    return {
        userId,
        token
    };
} 