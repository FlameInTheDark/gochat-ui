import { json } from '@sveltejs/kit';

// Max age for the cookie (e.g., 1 day)
const MAX_AGE = 60 * 60 * 24; 

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
    try {
        const { token } = await request.json();

        if (!token) {
            return json({ error: 'Token is required' }, { status: 400 });
        }

        // Set the HttpOnly cookie
        cookies.set('auth_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure in production
            sameSite: 'lax', // Or 'strict' depending on your needs
            maxAge: MAX_AGE
        });

        return json({ success: true });

    } catch (error) {
        console.error('[API /api/auth/set-token] Error:', error);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
} 