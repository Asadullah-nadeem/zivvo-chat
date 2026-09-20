"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDbConnected = exports.pool = void 0;
exports.initDb = initDb;
exports.saveUserLogin = saveUserLogin;
exports.recordSessionStart = recordSessionStart;
exports.recordSessionEnd = recordSessionEnd;
exports.saveChatMessage = saveChatMessage;
exports.getDbStats = getDbStats;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL || 'postgresql://zivvo:zivvopass@localhost:5432/zivvochat_db';
exports.pool = new pg_1.Pool({
    connectionString,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000,
    max: 10
});
exports.isDbConnected = false;
// In-Memory Backup Metrics (used when DB is offline)
const inMemoryStats = {
    totalUsersCount: 0,
    totalSessionsCount: 0,
    totalMessagesCount: 0,
    usersSet: new Set()
};
/**
 * Initialize PostgreSQL tables automatically
 */
function initDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield exports.pool.connect();
            yield client.query(`
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
            exports.isDbConnected = true;
            console.log('✅ PostgreSQL connected and schemas initialized successfully.');
            return true;
        }
        catch (err) {
            exports.isDbConnected = false;
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`⚠️ PostgreSQL connection unavailable (${msg}). Running in In-Memory Fallback Mode.`);
            return false;
        }
    });
}
/**
 * Record User Login
 */
function saveUserLogin(username) {
    return __awaiter(this, void 0, void 0, function* () {
        inMemoryStats.usersSet.add(username);
        inMemoryStats.totalUsersCount = inMemoryStats.usersSet.size;
        if (!exports.isDbConnected)
            return;
        try {
            yield exports.pool.query(`INSERT INTO users (username, last_login) 
             VALUES ($1, NOW()) 
             ON CONFLICT (username) 
             DO UPDATE SET last_login = NOW()`, [username]);
        }
        catch (e) {
            console.warn('DB saveUserLogin error:', e);
        }
    });
}
/**
 * Record New Video Chat Session
 */
function recordSessionStart(roomName, user1, user2) {
    return __awaiter(this, void 0, void 0, function* () {
        inMemoryStats.totalSessionsCount++;
        if (!exports.isDbConnected)
            return;
        try {
            yield exports.pool.query(`INSERT INTO chat_sessions (room_name, user1_name, user2_name, started_at) 
             VALUES ($1, $2, $3, NOW())`, [roomName, user1, user2]);
        }
        catch (e) {
            console.warn('DB recordSessionStart error:', e);
        }
    });
}
/**
 * Record End of Video Chat Session
 */
function recordSessionEnd(roomName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.isDbConnected)
            return;
        try {
            yield exports.pool.query(`UPDATE chat_sessions SET ended_at = NOW() WHERE room_name = $1 AND ended_at IS NULL`, [roomName]);
        }
        catch (e) {
            console.warn('DB recordSessionEnd error:', e);
        }
    });
}
/**
 * Save Chat Message
 */
function saveChatMessage(roomName, sender, text) {
    return __awaiter(this, void 0, void 0, function* () {
        inMemoryStats.totalMessagesCount++;
        if (!exports.isDbConnected)
            return;
        try {
            yield exports.pool.query(`INSERT INTO chat_messages (room_name, sender, message_text) VALUES ($1, $2, $3)`, [roomName, sender, text]);
        }
        catch (e) {
            console.warn('DB saveChatMessage error:', e);
        }
    });
}
/**
 * Get Overall Database / In-Memory Statistics
 */
function getDbStats() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.isDbConnected) {
            return {
                isDbConnected: false,
                totalUsers: inMemoryStats.totalUsersCount,
                totalSessions: inMemoryStats.totalSessionsCount,
                totalMessages: inMemoryStats.totalMessagesCount
            };
        }
        try {
            const uRes = yield exports.pool.query(`SELECT COUNT(*) FROM users`);
            const sRes = yield exports.pool.query(`SELECT COUNT(*) FROM chat_sessions`);
            const mRes = yield exports.pool.query(`SELECT COUNT(*) FROM chat_messages`);
            return {
                isDbConnected: true,
                totalUsers: parseInt(uRes.rows[0].count, 10),
                totalSessions: parseInt(sRes.rows[0].count, 10),
                totalMessages: parseInt(mRes.rows[0].count, 10)
            };
        }
        catch (_a) {
            return {
                isDbConnected: false,
                totalUsers: inMemoryStats.totalUsersCount,
                totalSessions: inMemoryStats.totalSessionsCount,
                totalMessages: inMemoryStats.totalMessagesCount
            };
        }
    });
}
