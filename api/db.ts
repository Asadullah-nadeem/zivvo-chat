import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://zivvo:zivvopass@localhost:5432/zivvochat_db';

export const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000,
    max: 10
});

export let isDbConnected = false;

// In-Memory Backup Metrics (used when DB is offline)
const inMemoryStats = {
    totalUsersCount: 0,
    totalSessionsCount: 0,
    totalMessagesCount: 0,
    usersSet: new Set<string>()
};

/**
 * Initialize PostgreSQL tables automatically
 */
export async function initDb(): Promise<boolean> {
    try {
        const client = await pool.connect();
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS chat_sessions (
                id SERIAL PRIMARY KEY,
                room_name VARCHAR(255) NOT NULL,
                user1_name VARCHAR(255) NOT NULL,
                user2_name VARCHAR(255) NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                room_name VARCHAR(255) NOT NULL,
                sender VARCHAR(255) NOT NULL,
                message_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        client.release();
        isDbConnected = true;
        console.log('✅ PostgreSQL connected and schemas initialized successfully.');
        return true;
    } catch (err: unknown) {
        isDbConnected = false;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`⚠️ PostgreSQL connection unavailable (${msg}). Running in In-Memory Fallback Mode.`);
        return false;
    }
}

/**
 * Record User Login
 */
export async function saveUserLogin(username: string): Promise<void> {
    inMemoryStats.usersSet.add(username);
    inMemoryStats.totalUsersCount = inMemoryStats.usersSet.size;

    if (!isDbConnected) return;

    try {
        await pool.query(
            `INSERT INTO users (username, last_login) 
             VALUES ($1, NOW()) 
             ON CONFLICT (username) 
             DO UPDATE SET last_login = NOW()`,
            [username]
        );
    } catch (e) {
        console.warn('DB saveUserLogin error:', e);
    }
}

/**
 * Record New Video Chat Session
 */
export async function recordSessionStart(roomName: string, user1: string, user2: string): Promise<void> {
    inMemoryStats.totalSessionsCount++;

    if (!isDbConnected) return;

    try {
        await pool.query(
            `INSERT INTO chat_sessions (room_name, user1_name, user2_name, started_at) 
             VALUES ($1, $2, $3, NOW())`,
            [roomName, user1, user2]
        );
    } catch (e) {
        console.warn('DB recordSessionStart error:', e);
    }
}

/**
 * Record End of Video Chat Session
 */
export async function recordSessionEnd(roomName: string): Promise<void> {
    if (!isDbConnected) return;

    try {
        await pool.query(
            `UPDATE chat_sessions SET ended_at = NOW() WHERE room_name = $1 AND ended_at IS NULL`,
            [roomName]
        );
    } catch (e) {
        console.warn('DB recordSessionEnd error:', e);
    }
}

/**
 * Save Chat Message
 */
export async function saveChatMessage(roomName: string, sender: string, text: string): Promise<void> {
    inMemoryStats.totalMessagesCount++;

    if (!isDbConnected) return;

    try {
        await pool.query(
            `INSERT INTO chat_messages (room_name, sender, message_text) VALUES ($1, $2, $3)`,
            [roomName, sender, text]
        );
    } catch (e) {
        console.warn('DB saveChatMessage error:', e);
    }
}

/**
 * Get Overall Database / In-Memory Statistics
 */
export async function getDbStats() {
    if (!isDbConnected) {
        return {
            isDbConnected: false,
            totalUsers: inMemoryStats.totalUsersCount,
            totalSessions: inMemoryStats.totalSessionsCount,
            totalMessages: inMemoryStats.totalMessagesCount
        };
    }

    try {
        const uRes = await pool.query(`SELECT COUNT(*) FROM users`);
        const sRes = await pool.query(`SELECT COUNT(*) FROM chat_sessions`);
        const mRes = await pool.query(`SELECT COUNT(*) FROM chat_messages`);

        return {
            isDbConnected: true,
            totalUsers: parseInt(uRes.rows[0].count, 10),
            totalSessions: parseInt(sRes.rows[0].count, 10),
            totalMessages: parseInt(mRes.rows[0].count, 10)
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
