"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../lib/db");
const auth_1 = __importDefault(require("./routes/auth"));
const health_1 = __importDefault(require("./routes/health"));
const stats_1 = require("./routes/stats");
const handlers_1 = require("./socket/handlers");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Initialize PostgreSQL database connection
(0, db_1.initDb)().catch(console.error);
// Enable CORS Security Headers for Express routes
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(',');
    if (!origin || process.env.CORS_ORIGIN === '*' || allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin || "*");
    }
    else {
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
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
    ? process.env.CORS_ORIGIN.split(',')
    : "*";
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});
// Register Modular REST API Routes
app.use('/api', auth_1.default);
app.use('/api', health_1.default);
app.use('/api', (0, stats_1.createStatsRouter)(() => (0, handlers_1.getOnlineCounts)(io)));
// Register Modular Socket.IO Handlers
(0, handlers_1.registerSocketHandlers)(io);
const PORT = parseInt(process.env.PORT || '5000', 10);
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ZivvoChat Modular Server running on port ${PORT}`);
});
