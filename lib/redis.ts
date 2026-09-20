import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export let isRedisConnected = false;

// In-Memory fallback store when Redis server is offline
const inMemoryCache = new Map<string, { value: string; expiresAt?: number }>();
const inMemoryLists = new Map<string, string[]>();

export const redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    lazyConnect: false,
    retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return 1000;
    }
});

redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('⚡ Redis connected successfully on localhost:6379.');
});

redisClient.on('error', (err) => {
    isRedisConnected = false;
    console.warn(`⚠️ Redis connection notice: ${err.message}. Using In-Memory Secure Token Cache.`);
});

/**
 * Store Secret Token in Redis with TTL (Time To Live in seconds)
 */
export async function setSecretToken(key: string, data: Record<string, any>, ttlSeconds: number = 86400): Promise<boolean> {
    const serialized = JSON.stringify(data);

    // Save to In-Memory Cache Fallback
    inMemoryCache.set(key, {
        value: serialized,
        expiresAt: Date.now() + (ttlSeconds * 1000)
    });

    if (isRedisConnected) {
        try {
            await redisClient.setex(key, ttlSeconds, serialized);
            console.log(`⚡ [REDIS WRITE SUCCESS] Key saved: ${key.slice(0, 20)}... (TTL: ${ttlSeconds}s)`);
            return true;
        } catch (e) {
            console.warn(`Redis write error for ${key}:`, e);
        }
    }

    console.log(`🔑 Token saved in Secure In-Memory Cache: ${key.slice(0, 20)}...`);
    return true;
}

/**
 * Get Secret Token from Redis or Fallback Cache
 */
export async function getSecretToken<T = Record<string, any>>(key: string): Promise<T | null> {
    if (isRedisConnected) {
        try {
            const raw = await redisClient.get(key);
            if (raw) return JSON.parse(raw) as T;
        } catch (e) {
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
        return JSON.parse(cached.value) as T;
    }

    return null;
}

/**
 * Delete Secret Token from Redis
 */
export async function deleteSecretToken(key: string): Promise<boolean> {
    inMemoryCache.delete(key);
    if (isRedisConnected) {
        try {
            await redisClient.del(key);
            return true;
        } catch {
            return false;
        }
    }
    return true;
}

/**
 * Store JWT User Token in Redis (24 Hours Expiry)
 */
export async function storeJwtToken(token: string, payload: { username: string; userId: string }): Promise<boolean> {
    return setSecretToken(`jwt:${token}`, payload, 86400); // 24 hours
}

/**
 * Verify & Retrieve JWT Token from Redis
 */
export async function getJwtTokenPayload(token: string): Promise<{ username: string; userId: string } | null> {
    return getSecretToken<{ username: string; userId: string }>(`jwt:${token}`);
}

/**
 * Store 64-Character Crypto Room Token in Redis (12 Hours Expiry)
 */
export async function storeRoomToken(roomToken: string, roomData: { roomName: string; user1: string; user2: string }): Promise<boolean> {
    return setSecretToken(`room:${roomToken}`, roomData, 43200); // 12 hours
}

/**
 * Retrieve 64-Character Crypto Room Token Data from Redis
 */
export async function getRoomTokenData(roomToken: string): Promise<{ roomName: string; user1: string; user2: string } | null> {
    return getSecretToken<{ roomName: string; user1: string; user2: string }>(`room:${roomToken}`);
}

/**
 * Push Real-time Chat Message to Redis List (24 Hours Expiry)
 */
export async function pushChatMessageRedis(roomToken: string, messageData: { sender: string; text: string; time: string }): Promise<void> {
    const listKey = `chat_history:${roomToken}`;
    const serialized = JSON.stringify(messageData);

    // Save in memory fallback list
    if (!inMemoryLists.has(listKey)) {
        inMemoryLists.set(listKey, []);
    }
    inMemoryLists.get(listKey)?.push(serialized);

    if (isRedisConnected) {
        try {
            await redisClient.rpush(listKey, serialized);
            await redisClient.expire(listKey, 86400); // 24 hour TTL
            console.log(`⚡ [REDIS CHAT SAVED] Message stored in Redis List: ${listKey.slice(0, 25)}...`);
        } catch (e) {
            console.warn(`Redis rpush error for ${listKey}:`, e);
        }
    }
}

/**
 * Get Real-time Chat Message History from Redis List
 */
export async function getChatHistoryRedis(roomToken: string): Promise<Array<{ sender: string; text: string; time: string }>> {
    const listKey = `chat_history:${roomToken}`;
    if (isRedisConnected) {
        try {
            const rawList = await redisClient.lrange(listKey, 0, -1);
            if (rawList && rawList.length > 0) {
                return rawList.map(item => JSON.parse(item));
            }
        } catch (e) {
            console.warn(`Redis lrange error for ${listKey}:`, e);
        }
    }

    const fallbackList = inMemoryLists.get(listKey) || [];
    return fallbackList.map(item => JSON.parse(item));
}

/**
 * Store Live Call State in Redis (Mic Muted, Video Status, Mode, Active Room)
 */
export async function setCallStateRedis(roomToken: string, callState: { isMuted?: boolean; mode?: string; status?: string; user?: string }): Promise<boolean> {
    return setSecretToken(`call_state:${roomToken}`, callState, 43200);
}

/**
 * Get Live Call State from Redis
 */
export async function getCallStateRedis(roomToken: string): Promise<{ isMuted?: boolean; mode?: string; status?: string; user?: string } | null> {
    return getSecretToken<{ isMuted?: boolean; mode?: string; status?: string; user?: string }>(`call_state:${roomToken}`);
}
