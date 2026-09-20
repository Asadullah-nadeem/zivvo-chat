import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { initDb } from '../lib/db';

import authRouter from './routes/auth';
import healthRouter from './routes/health';
import { createStatsRouter } from './routes/stats';
import { registerSocketHandlers, getOnlineCounts } from './socket/handlers';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize PostgreSQL database connection
initDb().catch(console.error);

// Enable CORS Security Headers for Express routes
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(',');
    
    if (!origin || process.env.CORS_ORIGIN === '*' || allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin || "*");
    } else {
        res.header("Access-Control-Allow-Origin", allowedOrigins[0]);
    }
    
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

const httpServer = createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*' 
    ? process.env.CORS_ORIGIN.split(',') 
    : "*";

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// Register Modular REST API Routes
app.use('/api', authRouter);
app.use('/api', healthRouter);
app.use('/api', createStatsRouter(() => getOnlineCounts(io)));

// Register Modular Socket.IO Handlers
registerSocketHandlers(io);

const PORT = parseInt(process.env.PORT || '5000', 10);

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ZivvoChat Modular Server running on port ${PORT}`);
});
