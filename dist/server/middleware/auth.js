"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const auth_1 = require("../../lib/auth");
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ valid: false, error: 'Unauthorized: No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, auth_1.verifyUserToken)(token);
    if (!decoded) {
        res.status(401).json({ valid: false, error: 'Unauthorized: Invalid or expired token' });
        return;
    }
    req.user = decoded;
    next();
}
