import { NextResponse } from 'next/server';
import { generateUserToken } from '@/lib/auth';
import { saveUserLogin } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string' || !username.trim()) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const cleanUsername = username.trim();

        // Asynchronously save/update user in PostgreSQL via Drizzle ORM
        saveUserLogin(cleanUsername).catch(console.error);

        // Generate cryptographically secure JWT token with unique userId & nonce
        const { token, userId } = generateUserToken(cleanUsername);

        return NextResponse.json({ 
            token, 
            username: cleanUsername, 
            userId 
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid request';
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
