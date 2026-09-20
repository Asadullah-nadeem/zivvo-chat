import { Request, Response, NextFunction } from 'express';
import { verifyUserToken } from '../../lib/auth';

export interface AuthenticatedRequest extends Request {
    user?: { username: string; userId: string };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ valid: false, error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyUserToken(token);
    if (!decoded) {
        res.status(401).json({ valid: false, error: 'Unauthorized: Invalid or expired token' });
        return;
    }

    req.user = decoded;
    next();
}
