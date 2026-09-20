"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBackendHealth = checkBackendHealth;
exports.loginUser = loginUser;
exports.verifyToken = verifyToken;
exports.getSystemStats = getSystemStats;
const config_1 = require("./config");
/**
 * Check if the backend API server is reachable
 */
async function checkBackendHealth() {
    const urls = [`${config_1.config.apiUrl}/health`, '/api/health'];
    for (const url of urls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
            clearTimeout(timeoutId);
            if (res.ok)
                return true;
        }
        catch {
            continue;
        }
    }
    return false;
}
/**
 * Login user via API with automatic Next.js fallback
 */
async function loginUser(username) {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
        return { success: false, error: 'Username is required' };
    }
    // Attempt obfuscated secure API paths first, then fallback
    const urlsToTry = [
        `${config_1.config.apiUrl}/v1/auth/access`,
        '/api/v1/auth/access',
        `${config_1.config.apiUrl}/login`
    ];
    let lastError = 'Unable to connect to backend server. Make sure server is running.';
    for (const url of urlsToTry) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: cleanUsername }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                return { success: true, token: data.token };
            }
            else {
                const errData = await response.json().catch(() => ({}));
                lastError = errData.error || `Server error (${response.status})`;
            }
        }
        catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                lastError = 'Connection timed out. Retrying...';
            }
        }
    }
    return { success: false, error: lastError };
}
/**
 * Verify JWT Token against backend or Next.js API
 */
async function verifyToken(token) {
    const urls = [
        `${config_1.config.apiUrl}/v1/auth/verify`,
        '/api/v1/auth/verify',
        `${config_1.config.apiUrl}/verify`
    ];
    for (const url of urls) {
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            if (res.ok)
                return true;
        }
        catch {
            continue;
        }
    }
    return false;
}
/**
 * Fetch system & database statistics
 */
async function getSystemStats() {
    const urls = [`${config_1.config.apiUrl}/stats`, '/api/stats'];
    for (const url of urls) {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok)
                return await res.json();
        }
        catch {
            continue;
        }
    }
    return null;
}
