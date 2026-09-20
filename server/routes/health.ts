import { Router } from 'express';

const router = Router();

/**
 * @route GET /api/health
 * @desc System health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ZivvoChat Modular Socket Server',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

export default router;
