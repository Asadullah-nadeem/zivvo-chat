import { Router } from 'express';
import { generateUserToken, verifyUserToken } from '../../lib/auth';
import { saveUserLogin } from '../../lib/db';

const router = Router();

const handleLogin = async (req: any, res: any) => {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }

    const cleanUsername = username.trim();
    saveUserLogin(cleanUsername).catch(console.error);

    const { token, userId } = generateUserToken(cleanUsername);
    res.json({ token, username: cleanUsername, userId });
};

const handleVerify = (req: any, res: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ valid: false, error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyUserToken(token);
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

export default router;
