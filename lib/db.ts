import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql, count, desc } from 'drizzle-orm';
import crypto from 'crypto';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/zivvochat_db';

export const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: 10
});

export const db = drizzle(pool, { schema });

export let isDbConnected = false;

// In-Memory Backup Metrics
const inMemoryStats = {
    totalUsersCount: 0,
    totalSessionsCount: 0,
    totalMessagesCount: 0,
    usersSet: new Set<string>()
};

/**
 * Generate 64-Character Secure Cryptographic Room Token Key
 */
export function generateSecureRoomToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Check & ensure PostgreSQL connection is live
 */
async function ensureDbConnected(): Promise<boolean> {
    if (isDbConnected) return true;
    try {
        const client = await pool.connect();
        client.release();
        isDbConnected = true;
        return true;
    } catch {
        isDbConnected = false;
        return false;
    }
}

/**
 * Initialize PostgreSQL schemas with Drizzle ORM
 */
export async function initDb(): Promise<boolean> {
    try {
        const client = await pool.connect();
        
        await client.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS room_urls (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                room_token VARCHAR(128) UNIQUE NOT NULL,
                room_name VARCHAR(255) NOT NULL,
                created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS chat_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                room_token VARCHAR(128) NOT NULL,
                room_url_id UUID REFERENCES room_urls(id) ON DELETE SET NULL,
                room_name VARCHAR(255) NOT NULL,
                user1_name VARCHAR(255) NOT NULL,
                user2_name VARCHAR(255) NOT NULL,
                user1_id UUID REFERENCES users(id) ON DELETE SET NULL,
                user2_id UUID REFERENCES users(id) ON DELETE SET NULL,
                started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS call_timestamps (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                user_name VARCHAR(255) NOT NULL,
                event_type VARCHAR(100) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS chat_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
                sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
                sender VARCHAR(255) NOT NULL,
                message_text TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS session_analytics (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
                room_token VARCHAR(128) NOT NULL,
                participant_json JSONB DEFAULT '{}',
                metrics_json JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_room_urls_token ON room_urls(room_token);
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_token ON chat_sessions(room_token);
            CREATE INDEX IF NOT EXISTS idx_call_timestamps_session ON call_timestamps(session_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
        `);
        
        client.release();
        isDbConnected = true;
        console.log('✅ PostgreSQL & Drizzle ORM connected and initialized successfully.');
        return true;
    } catch (err: unknown) {
        isDbConnected = false;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`⚠️ PostgreSQL connection unavailable (${msg}). Running in In-Memory Fallback Mode.`);
        return false;
    }
}

/**
 * Record User Login via Drizzle ORM
 */
export async function saveUserLogin(username: string): Promise<string | null> {
    inMemoryStats.usersSet.add(username);
    inMemoryStats.totalUsersCount = inMemoryStats.usersSet.size;

    const connected = await ensureDbConnected();
    if (!connected) return null;

    try {
        const res = await db.insert(schema.users)
            .values({ username, lastLogin: new Date() })
            .onConflictDoUpdate({
                target: schema.users.username,
                set: { lastLogin: new Date() }
            })
            .returning({ id: schema.users.id });

        const userId = res[0]?.id || null;
        console.log(`💾 DB User Login Saved: ${username} (ID: ${userId})`);
        return userId;
    } catch (e) {
        console.error('DB saveUserLogin error:', e);
        return null;
    }
}

/**
 * Save Secure Room URL Key (32-64 length hex)
 */
export async function createSecureRoomUrl(roomToken: string, roomName: string, username?: string): Promise<string | null> {
    const connected = await ensureDbConnected();
    if (!connected) return null;

    try {
        let creatorId: string | null = null;
        if (username) {
            const user = await db.query.users.findFirst({ where: eq(schema.users.username, username) });
            creatorId = user?.id || null;
        }

        const res = await db.insert(schema.roomUrls).values({
            roomToken,
            roomName,
            createdById: creatorId,
            createdAt: new Date()
        }).returning({ id: schema.roomUrls.id });

        console.log(`💾 DB Room URL Saved: Token ${roomToken.slice(0, 8)}...`);
        return res[0]?.id || null;
    } catch (e) {
        console.error('DB createSecureRoomUrl error:', e);
        return null;
    }
}

/**
 * Record New Video Chat Session via Drizzle ORM
 */
export async function recordSessionStart(roomToken: string, roomName: string, user1: string, user2: string): Promise<string | null> {
    inMemoryStats.totalSessionsCount++;

    const connected = await ensureDbConnected();
    if (!connected) return null;

    try {
        const u1 = await db.query.users.findFirst({ where: eq(schema.users.username, user1) });
        const u2 = await db.query.users.findFirst({ where: eq(schema.users.username, user2) });
        const roomUrlRecord = await db.query.roomUrls.findFirst({ where: eq(schema.roomUrls.roomToken, roomToken) });

        const res = await db.insert(schema.chatSessions).values({
            roomToken,
            roomUrlId: roomUrlRecord?.id || null,
            roomName,
            user1Name: user1,
            user2Name: user2,
            user1Id: u1?.id || null,
            user2Id: u2?.id || null,
            startedAt: new Date()
        }).returning({ id: schema.chatSessions.id });

        const sessionId = res[0]?.id || null;

        if (sessionId) {
            await db.insert(schema.sessionAnalytics).values({
                sessionId,
                roomToken,
                participantJson: { user1: { name: user1, id: u1?.id }, user2: { name: user2, id: u2?.id } },
                metricsJson: { startedAt: new Date().toISOString() }
            });
            console.log(`💾 DB Session Started & Analytics Saved: Room ${roomName} (Session ID: ${sessionId})`);
        }

        return sessionId;
    } catch (e) {
        console.error('DB recordSessionStart error:', e);
        return null;
    }
}

/**
 * Record End of Video Chat Session
 */
export async function recordSessionEnd(roomToken: string): Promise<void> {
    const connected = await ensureDbConnected();
    if (!connected) return;

    try {
        await db.update(schema.chatSessions)
            .set({ endedAt: new Date() })
            .where(
                sql`${schema.chatSessions.roomToken} = ${roomToken} AND ${schema.chatSessions.endedAt} IS NULL`
            );
        console.log(`💾 DB Session Ended: Token ${roomToken.slice(0, 8)}...`);
    } catch (e) {
        console.error('DB recordSessionEnd error:', e);
    }
}

/**
 * Save Chat Message via Drizzle ORM
 */
export async function saveChatMessage(roomToken: string, sender: string, text: string): Promise<void> {
    inMemoryStats.totalMessagesCount++;

    const connected = await ensureDbConnected();
    if (!connected) return;

    try {
        const senderUser = await db.query.users.findFirst({ where: eq(schema.users.username, sender) });
        const activeSession = await db.query.chatSessions.findFirst({
            where: eq(schema.chatSessions.roomToken, roomToken),
            orderBy: [desc(schema.chatSessions.startedAt)]
        });

        await db.insert(schema.chatMessages).values({
            sessionId: activeSession?.id || null,
            sender,
            senderId: senderUser?.id || null,
            messageText: text,
            createdAt: new Date()
        });
        console.log(`💾 DB Chat Message Saved from "${sender}": "${text.slice(0, 20)}..."`);
    } catch (e) {
        console.error('DB saveChatMessage error:', e);
    }
}

/**
 * Record Call Timestamps (Mute/Unmute, End Call, Video Toggle)
 */
export async function recordCallTimestamp(roomToken: string, userName: string, eventType: string): Promise<void> {
    const connected = await ensureDbConnected();
    if (!connected) return;

    try {
        const activeUser = await db.query.users.findFirst({ where: eq(schema.users.username, userName) });
        const activeSession = await db.query.chatSessions.findFirst({
            where: eq(schema.chatSessions.roomToken, roomToken),
            orderBy: [desc(schema.chatSessions.startedAt)]
        });

        await db.insert(schema.callTimestamps).values({
            sessionId: activeSession?.id || null,
            userId: activeUser?.id || null,
            userName,
            eventType,
            timestamp: new Date()
        });
        console.log(`💾 DB Call Timestamp Event Saved: ${eventType} by ${userName}`);
    } catch (e) {
        console.error('DB recordCallTimestamp error:', e);
    }
}

/**
 * Get Overall Database Statistics
 */
export async function getDbStats() {
    const connected = await ensureDbConnected();
    if (!connected) {
        return {
            isDbConnected: false,
            totalUsers: inMemoryStats.totalUsersCount,
            totalSessions: inMemoryStats.totalSessionsCount,
            totalMessages: inMemoryStats.totalMessagesCount
        };
    }

    try {
        const [uCount] = await db.select({ count: count() }).from(schema.users);
        const [sCount] = await db.select({ count: count() }).from(schema.chatSessions);
        const [mCount] = await db.select({ count: count() }).from(schema.chatMessages);

        return {
            isDbConnected: true,
            totalUsers: uCount?.count || 0,
            totalSessions: sCount?.count || 0,
            totalMessages: mCount?.count || 0
        };
    } catch {
        return {
            isDbConnected: false,
            totalUsers: inMemoryStats.totalUsersCount,
            totalSessions: inMemoryStats.totalSessionsCount,
            totalMessages: inMemoryStats.totalMessagesCount
        };
    }
}
