import { Router } from 'express';
import { getDbStats } from '../../lib/db';
import { authenticateToken } from '../middleware/auth';

export function createStatsRouter(getOnlineCounts: () => { onlineCount: number; waitingCount: number }) {
    const router = Router();

    /**
     * @route GET /api/stats
     * @desc Protected system and database statistics endpoint (requires JWT Bearer Token)
     */
    router.get('/stats', authenticateToken, async (req, res) => {
        const dbStats = await getDbStats();
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
