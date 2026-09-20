import { NextResponse } from 'next/server';
import { getDbStats } from '@/lib/db';

export async function GET() {
    const dbStats = await getDbStats();
    return NextResponse.json({
        ...dbStats,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
}
