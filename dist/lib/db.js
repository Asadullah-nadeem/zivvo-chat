"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDbConnected = exports.db = exports.pool = void 0;
exports.generateSecureRoomToken = generateSecureRoomToken;
exports.initDb = initDb;
exports.saveUserLogin = saveUserLogin;
exports.createSecureRoomUrl = createSecureRoomUrl;
exports.recordSessionStart = recordSessionStart;
exports.recordSessionEnd = recordSessionEnd;
exports.saveChatMessage = saveChatMessage;
exports.recordCallTimestamp = recordCallTimestamp;
exports.getDbStats = getDbStats;
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const schema = __importStar(require("./schema"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/zivvochat_db';
exports.pool = new pg_1.Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: 10
});
exports.db = (0, node_postgres_1.drizzle)(exports.pool, { schema });
exports.isDbConnected = false;
// In-Memory Backup Metrics
const inMemoryStats = {
    totalUsersCount: 0,
    totalSessionsCount: 0,
    totalMessagesCount: 0,
    usersSet: new Set()
};
/**
 * Generate 64-Character Secure Cryptographic Room Token Key
 */
function generateSecureRoomToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
/**
 * Check & ensure PostgreSQL connection is live
 */
async function ensureDbConnected() {
    if (exports.isDbConnected)
        return true;
    try {
        const client = await exports.pool.connect();
        client.release();
        exports.isDbConnected = true;
        return true;
    }
    catch {
        exports.isDbConnected = false;
        return false;
    }
}
/**
 * Initialize PostgreSQL schemas with Drizzle ORM
 */
async function initDb() {
    try {
        const client = await exports.pool.connect();
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
        exports.isDbConnected = true;
        console.log('✅ PostgreSQL & Drizzle ORM connected and initialized successfully.');
        return true;
    }
    catch (err) {
        exports.isDbConnected = false;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`⚠️ PostgreSQL connection unavailable (${msg}). Running in In-Memory Fallback Mode.`);
        return false;
    }
}
/**
 * Record User Login via Drizzle ORM
 */
async function saveUserLogin(username) {
    inMemoryStats.usersSet.add(username);
    inMemoryStats.totalUsersCount = inMemoryStats.usersSet.size;
    const connected = await ensureDbConnected();
    if (!connected)
        return null;
    try {
        const res = await exports.db.insert(schema.users)
            .values({ username, lastLogin: new Date() })
            .onConflictDoUpdate({
            target: schema.users.username,
            set: { lastLogin: new Date() }
        })
            .returning({ id: schema.users.id });
        const userId = res[0]?.id || null;
        console.log(`💾 DB User Login Saved: ${username} (ID: ${userId})`);
        return userId;
    }
    catch (e) {
        console.error('DB saveUserLogin error:', e);
        return null;
    }
}
/**
 * Save Secure Room URL Key (32-64 length hex)
 */
async function createSecureRoomUrl(roomToken, roomName, username) {
    const connected = await ensureDbConnected();
    if (!connected)
        return null;
    try {
        let creatorId = null;
        if (username) {
            const user = await exports.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema.users.username, username) });
            creatorId = user?.id || null;
        }
        const res = await exports.db.insert(schema.roomUrls).values({
            roomToken,
            roomName,
            createdById: creatorId,
            createdAt: new Date()
        }).returning({ id: schema.roomUrls.id });
        console.log(`💾 DB Room URL Saved: Token ${roomToken.slice(0, 8)}...`);
        return res[0]?.id || null;
    }
    catch (e) {
        console.error('DB createSecureRoomUrl error:', e);
        return null;
    }
}
/**
 * Record New Video Chat Session via Drizzle ORM
 */
async function recordSessionStart(roomToken, roomName, user1, user2) {
    inMemoryStats.totalSessionsCount++;
    const connected = await ensureDbConnected();
    if (!connected)
        return null;
    try {
        const u1 = await exports.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema.users.username, user1) });
        const u2 = await exports.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema.users.username, user2) });
        const roomUrlRecord = await exports.db.query.roomUrls.findFirst({ where: (0, drizzle_orm_1.eq)(schema.roomUrls.roomToken, roomToken) });
        const res = await exports.db.insert(schema.chatSessions).values({
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
            await exports.db.insert(schema.sessionAnalytics).values({
                sessionId,
                roomToken,
                participantJson: { user1: { name: user1, id: u1?.id }, user2: { name: user2, id: u2?.id } },
                metricsJson: { startedAt: new Date().toISOString() }
            });
            console.log(`💾 DB Session Started & Analytics Saved: Room ${roomName} (Session ID: ${sessionId})`);
        }
        return sessionId;
    }
    catch (e) {
        console.error('DB recordSessionStart error:', e);
        return null;
    }
}
/**
 * Record End of Video Chat Session
 */
async function recordSessionEnd(roomToken) {
    const connected = await ensureDbConnected();
    if (!connected)
        return;
    try {
        await exports.db.update(schema.chatSessions)
            .set({ endedAt: new Date() })
            .where((0, drizzle_orm_1.sql) `${schema.chatSessions.roomToken} = ${roomToken} AND ${schema.chatSessions.endedAt} IS NULL`);
        console.log(`💾 DB Session Ended: Token ${roomToken.slice(0, 8)}...`);
    }
    catch (e) {
        console.error('DB recordSessionEnd error:', e);
    }
}
/**
 * Save Chat Message via Drizzle ORM
 */
async function saveChatMessage(roomToken, sender, text) {
    inMemoryStats.totalMessagesCount++;
    const connected = await ensureDbConnected();
    if (!connected)
        return;
    try {
        const senderUser = await exports.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema.users.username, sender) });
        const activeSession = await exports.db.query.chatSessions.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.chatSessions.roomToken, roomToken),
            orderBy: [(0, drizzle_orm_1.desc)(schema.chatSessions.startedAt)]
        });
        await exports.db.insert(schema.chatMessages).values({
            sessionId: activeSession?.id || null,
            sender,
            senderId: senderUser?.id || null,
            messageText: text,
            createdAt: new Date()
        });
        console.log(`💾 DB Chat Message Saved from "${sender}": "${text.slice(0, 20)}..."`);
    }
    catch (e) {
        console.error('DB saveChatMessage error:', e);
    }
}
/**
 * Record Call Timestamps (Mute/Unmute, End Call, Video Toggle)
 */
async function recordCallTimestamp(roomToken, userName, eventType) {
    const connected = await ensureDbConnected();
    if (!connected)
        return;
    try {
        const activeUser = await exports.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema.users.username, userName) });
        const activeSession = await exports.db.query.chatSessions.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.chatSessions.roomToken, roomToken),
            orderBy: [(0, drizzle_orm_1.desc)(schema.chatSessions.startedAt)]
        });
        await exports.db.insert(schema.callTimestamps).values({
            sessionId: activeSession?.id || null,
            userId: activeUser?.id || null,
            userName,
            eventType,
            timestamp: new Date()
        });
        console.log(`💾 DB Call Timestamp Event Saved: ${eventType} by ${userName}`);
    }
    catch (e) {
        console.error('DB recordCallTimestamp error:', e);
    }
}
/**
 * Get Overall Database Statistics
 */
async function getDbStats() {
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
        const [uCount] = await exports.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema.users);
        const [sCount] = await exports.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema.chatSessions);
        const [mCount] = await exports.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema.chatMessages);
        return {
            isDbConnected: true,
            totalUsers: uCount?.count || 0,
            totalSessions: sCount?.count || 0,
            totalMessages: mCount?.count || 0
        };
    }
    catch {
        return {
            isDbConnected: false,
            totalUsers: inMemoryStats.totalUsersCount,
            totalSessions: inMemoryStats.totalSessionsCount,
            totalMessages: inMemoryStats.totalMessagesCount
        };
    }
}
