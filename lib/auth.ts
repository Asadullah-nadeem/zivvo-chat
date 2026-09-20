import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storeJwtToken } from './redis';

// Use environment JWT_SECRET or generate a 512-bit cryptographically secure fallback secret
const fallbackSecret = crypto.randomBytes(64).toString('hex');
export const JWT_SECRET = (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-secret-key-change-it')
    ? process.env.JWT_SECRET
    : fallbackSecret;

export interface TokenPayload {
    userId: string;
    username: string;
    nonce: string;
    iss: string;
    aud: string;
    iat?: number;
    exp?: number;
}

/**
 * Generate a cryptographically secure JWT token for user and store secret token in Redis
 */
export function generateUserToken(username: string): { token: string; userId: string } {
    const cleanUsername = username.trim();
    const userId = `usr_${crypto.randomUUID()}`;
    const nonce = crypto.randomBytes(16).toString('hex');

    const payload: TokenPayload = {
        userId,
        username: cleanUsername,
        nonce,
        iss: 'zivvochat-auth-service',
        aud: 'zivvochat-app'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Store JWT Token in Redis Key-Value Store with TTL
    storeJwtToken(token, { username: cleanUsername, userId }).catch(console.error);

    return { token, userId };
}

/**
 * Verify JWT token and return typed payload
 */
export function verifyUserToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'zivvochat-auth-service',
            audience: 'zivvochat-app'
        }) as TokenPayload;

        if (!decoded || !decoded.userId || !decoded.username) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}
