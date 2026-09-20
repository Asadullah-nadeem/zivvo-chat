"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../lib/auth");
const db_1 = require("../../lib/db");
const router = (0, express_1.Router)();
const handleLogin = async (req, res) => {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }
    const cleanUsername = username.trim();
    (0, db_1.saveUserLogin)(cleanUsername).catch(console.error);
    const { token, userId } = (0, auth_1.generateUserToken)(cleanUsername);
    res.json({ token, username: cleanUsername, userId });
};
const handleVerify = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ valid: false, error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, auth_1.verifyUserToken)(token);
    if (!decoded) {
        res.status(401).json({ valid: false, error: 'Invalid or expired token' });
        return;
    }
    res.json({ valid: true, user: decoded });
};
/**
 * Obfuscated Secure Auth Endpoints
 */
router.post('/v1/auth/access', handleLogin);
router.get('/v1/auth/verify', handleVerify);
// Fallback compatibility handlers
router.post('/login', handleLogin);
router.get('/verify', handleVerify);
exports.default = router;
