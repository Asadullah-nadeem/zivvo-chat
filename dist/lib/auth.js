"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
exports.generateUserToken = generateUserToken;
exports.verifyUserToken = verifyUserToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// Use environment JWT_SECRET or generate a 512-bit cryptographically secure fallback secret
const fallbackSecret = crypto_1.default.randomBytes(64).toString('hex');
exports.JWT_SECRET = (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-secret-key-change-it')
    ? process.env.JWT_SECRET
    : fallbackSecret;
/**
 * Generate a cryptographically secure, unique JWT token for user
 */
function generateUserToken(username) {
    const cleanUsername = username.trim();
    const userId = `usr_${crypto_1.default.randomUUID()}`;
    const nonce = crypto_1.default.randomBytes(16).toString('hex');
    const payload = {
        userId,
        username: cleanUsername,
        nonce,
        iss: 'zivvochat-auth-service',
        aud: 'zivvochat-app'
    };
    const token = jsonwebtoken_1.default.sign(payload, exports.JWT_SECRET, { expiresIn: '24h' });
    return { token, userId };
}
/**
 * Verify JWT token and return typed payload
 */
function verifyUserToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET, {
            issuer: 'zivvochat-auth-service',
            audience: 'zivvochat-app'
        });
        if (!decoded || !decoded.userId || !decoded.username) {
            return null;
        }
        return decoded;
    }
    catch {
        return null;
    }
}
