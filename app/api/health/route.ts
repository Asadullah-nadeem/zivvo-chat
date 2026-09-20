import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'ZivvoChat Next.js API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
}
