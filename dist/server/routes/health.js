"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
exports.default = router;
