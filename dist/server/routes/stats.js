"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatsRouter = createStatsRouter;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const auth_1 = require("../middleware/auth");
function createStatsRouter(getOnlineCounts) {
    const router = (0, express_1.Router)();
    /**
     * @route GET /api/stats
     * @desc Protected system and database statistics endpoint (requires JWT Bearer Token)
     */
    router.get('/stats', auth_1.authenticateToken, async (req, res) => {
        const dbStats = await (0, db_1.getDbStats)();
        const { onlineCount, waitingCount } = getOnlineCounts();
        res.json({
            onlineUsers: onlineCount,
            waitingQueue: waitingCount,
            ...dbStats,
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString()
        });
    });
    return router;
}
