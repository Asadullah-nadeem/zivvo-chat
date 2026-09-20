import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { saveUserLogin } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string' || !username.trim()) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const cleanUsername = username.trim();

        // Asynchronously save/update user in PostgreSQL
        saveUserLogin(cleanUsername).catch(console.error);

        // Sign JWT token valid for 24 hours
        const token = jwt.sign({ username: cleanUsername }, JWT_SECRET, { expiresIn: '24h' });

        return NextResponse.json({ token, username: cleanUsername });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid request';
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
