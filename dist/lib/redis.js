"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.isRedisConnected = void 0;
exports.setSecretToken = setSecretToken;
exports.getSecretToken = getSecretToken;
exports.deleteSecretToken = deleteSecretToken;
exports.storeJwtToken = storeJwtToken;
exports.getJwtTokenPayload = getJwtTokenPayload;
exports.storeRoomToken = storeRoomToken;
exports.getRoomTokenData = getRoomTokenData;
exports.pushChatMessageRedis = pushChatMessageRedis;
exports.getChatHistoryRedis = getChatHistoryRedis;
exports.setCallStateRedis = setCallStateRedis;
exports.getCallStateRedis = getCallStateRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
exports.isRedisConnected = false;
// In-Memory fallback store when Redis server is offline
const inMemoryCache = new Map();
const inMemoryLists = new Map();
exports.redisClient = new ioredis_1.default(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    lazyConnect: false,
    retryStrategy(times) {
        if (times > 3)
            return null; // stop retrying after 3 attempts
        return 1000;
    }
});
exports.redisClient.on('connect', () => {
    exports.isRedisConnected = true;
    console.log('⚡ Redis connected successfully on localhost:6379.');
});
exports.redisClient.on('error', (err) => {
    exports.isRedisConnected = false;
    console.warn(`⚠️ Redis connection notice: ${err.message}. Using In-Memory Secure Token Cache.`);
});
/**
 * Store Secret Token in Redis with TTL (Time To Live in seconds)
 */
async function setSecretToken(key, data, ttlSeconds = 86400) {
    const serialized = JSON.stringify(data);
    // Save to In-Memory Cache Fallback
    inMemoryCache.set(key, {
        value: serialized,
        expiresAt: Date.now() + (ttlSeconds * 1000)
    });
    if (exports.isRedisConnected) {
        try {
            await exports.redisClient.setex(key, ttlSeconds, serialized);
            console.log(`⚡ [REDIS WRITE SUCCESS] Key saved: ${key.slice(0, 20)}... (TTL: ${ttlSeconds}s)`);
            return true;
        }
        catch (e) {
            console.warn(`Redis write error for ${key}:`, e);
        }
    }
    console.log(`🔑 Token saved in Secure In-Memory Cache: ${key.slice(0, 20)}...`);
    return true;
}
/**
 * Get Secret Token from Redis or Fallback Cache
 */
async function getSecretToken(key) {
    if (exports.isRedisConnected) {
        try {
            const raw = await exports.redisClient.get(key);
            if (raw)
                return JSON.parse(raw);
        }
        catch (e) {
            console.warn(`Redis read error for ${key}:`, e);
        }
    }
    // Check In-Memory Fallback
    const cached = inMemoryCache.get(key);
    if (cached) {
        if (cached.expiresAt && Date.now() > cached.expiresAt) {
            inMemoryCache.delete(key);
            return null;
        }
        return JSON.parse(cached.value);
    }
    return null;
}
/**
 * Delete Secret Token from Redis
 */
async function deleteSecretToken(key) {
    inMemoryCache.delete(key);
    if (exports.isRedisConnected) {
        try {
            await exports.redisClient.del(key);
            return true;
        }
        catch {
            return false;
        }
    }
    return true;
}
/**
 * Store JWT User Token in Redis (24 Hours Expiry)
 */
async function storeJwtToken(token, payload) {
    return setSecretToken(`jwt:${token}`, payload, 86400); // 24 hours
}
/**
 * Verify & Retrieve JWT Token from Redis
 */
async function getJwtTokenPayload(token) {
    return getSecretToken(`jwt:${token}`);
}
/**
 * Store 64-Character Crypto Room Token in Redis (12 Hours Expiry)
 */
async function storeRoomToken(roomToken, roomData) {
    return setSecretToken(`room:${roomToken}`, roomData, 43200); // 12 hours
}
/**
 * Retrieve 64-Character Crypto Room Token Data from Redis
 */
async function getRoomTokenData(roomToken) {
    return getSecretToken(`room:${roomToken}`);
}
/**
 * Push Real-time Chat Message to Redis List (24 Hours Expiry)
 */
async function pushChatMessageRedis(roomToken, messageData) {
    const listKey = `chat_history:${roomToken}`;
    const serialized = JSON.stringify(messageData);
    // Save in memory fallback list
    if (!inMemoryLists.has(listKey)) {
        inMemoryLists.set(listKey, []);
    }
    inMemoryLists.get(listKey)?.push(serialized);
    if (exports.isRedisConnected) {
        try {
            await exports.redisClient.rpush(listKey, serialized);
            await exports.redisClient.expire(listKey, 86400); // 24 hour TTL
            console.log(`⚡ [REDIS CHAT SAVED] Message stored in Redis List: ${listKey.slice(0, 25)}...`);
        }
        catch (e) {
            console.warn(`Redis rpush error for ${listKey}:`, e);
        }
    }
}
/**
 * Get Real-time Chat Message History from Redis List
 */
async function getChatHistoryRedis(roomToken) {
    const listKey = `chat_history:${roomToken}`;
    if (exports.isRedisConnected) {
        try {
            const rawList = await exports.redisClient.lrange(listKey, 0, -1);
            if (rawList && rawList.length > 0) {
                return rawList.map(item => JSON.parse(item));
            }
        }
        catch (e) {
            console.warn(`Redis lrange error for ${listKey}:`, e);
        }
    }
    const fallbackList = inMemoryLists.get(listKey) || [];
    return fallbackList.map(item => JSON.parse(item));
}
/**
 * Store Live Call State in Redis (Mic Muted, Video Status, Mode, Active Room)
 */
async function setCallStateRedis(roomToken, callState) {
    return setSecretToken(`call_state:${roomToken}`, callState, 43200);
}
/**
 * Get Live Call State from Redis
 */
async function getCallStateRedis(roomToken) {
    return getSecretToken(`call_state:${roomToken}`);
}
