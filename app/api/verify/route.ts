import { NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyUserToken(token);

    if (!decoded) {
        return NextResponse.json({ valid: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json({ valid: true, user: decoded });
}
