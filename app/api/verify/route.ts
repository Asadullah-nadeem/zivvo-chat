import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return NextResponse.json({ valid: true, user: decoded });
    } catch {
        return NextResponse.json({ valid: false, error: 'Invalid or expired token' }, { status: 401 });
    }
}
