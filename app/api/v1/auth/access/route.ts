import { NextResponse } from 'next/server';
import { generateUserToken } from '@/lib/auth';
import { saveUserLogin, checkIpRateLimit, recordRoomToken } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, roomToken } = body;

        if (!username || typeof username !== 'string' || !username.trim()) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const cleanUsername = username.trim();

        // Extract client IP address from headers
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                         request.headers.get('x-real-ip') || 
                         '127.0.0.1';

        // 1. IP Rate Limiting Security Check: Block if 3 or more attempts
        const rateLimitResult = await checkIpRateLimit(clientIp, cleanUsername);
        if (!rateLimitResult.allowed) {
            console.warn(`⛔ [SECURITY BLOCK] IP ${clientIp} blocked for user "${cleanUsername}" (Attempts: ${rateLimitResult.count})`);
            return NextResponse.json({ 
                error: rateLimitResult.message || 'Access Blocked: Too many active room token attempts (3 or more) from your IP address.', 
                blocked: true,
                count: rateLimitResult.count
            }, { status: 429 });
        }

        // 2. Save User Login in PostgreSQL
        saveUserLogin(cleanUsername).catch(console.error);

        // 3. Generate Cryptographic JWT Token
        const { token, userId } = generateUserToken(cleanUsername);

        // 4. Record Room Token with IP & Name in DB & Redis
        const activeRoomToken = roomToken || token;
        recordRoomToken(activeRoomToken, cleanUsername, clientIp).catch(console.error);

        return NextResponse.json({ 
            token, 
            username: cleanUsername, 
            userId,
            ipAddress: clientIp
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid request';
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
