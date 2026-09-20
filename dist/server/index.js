"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Initialize PostgreSQL database connection
(0, db_1.initDb)().catch(console.error);
// Enable CORS for Express routes
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
const PORT = parseInt(process.env.PORT || '5000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';
// Health & Stats API Fallbacks on Socket Server
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ZivvoChat Socket.IO Server',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
app.get('/api/stats', async (req, res) => {
    const dbStats = await (0, db_1.getDbStats)();
    res.json({
        onlineUsers: io.sockets.sockets.size,
        waitingQueue: waitingUsers.length,
        ...dbStats,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});
app.get('/api/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ valid: false, error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded) {
            res.status(401).json({ valid: false, error: 'Invalid or expired token' });
            return;
        }
        res.json({ valid: true, user: decoded });
    });
});
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }
    const cleanUsername = username.trim();
    (0, db_1.saveUserLogin)(cleanUsername).catch(console.error);
    const token = jsonwebtoken_1.default.sign({ username: cleanUsername }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: cleanUsername });
});
let waitingUsers = [];
function broadcastOnlineStats() {
    io.emit('online-stats', {
        onlineCount: io.sockets.sockets.size,
        waitingCount: waitingUsers.length
    });
}
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// --- Socket Middleware ---
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded) {
            return next(new Error("Authentication error: Invalid token"));
        }
        socket.data.user = decoded;
        next();
    });
});
io.on('connection', (socket) => {
    broadcastOnlineStats();
    socket.on('join-pool', ({ name, location }) => {
        waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
        if (waitingUsers.length > 0) {
            let bestMatchIndex = 0;
            if (location) {
                let minDistance = Infinity;
                const limit = Math.min(waitingUsers.length, 5);
                for (let i = 0; i < limit; i++) {
                    const user = waitingUsers[i];
                    if (user.coords) {
                        const dist = getDistance(location.lat, location.lng, user.coords.lat, user.coords.lng);
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestMatchIndex = i;
                        }
                    }
                }
            }
            const partner = waitingUsers[bestMatchIndex];
            waitingUsers.splice(bestMatchIndex, 1);
            const roomName = `room-${partner.id}-${socket.id}`;
            socket.join(roomName);
            partner.socket.join(roomName);
            (0, db_1.recordSessionStart)(roomName, partner.name, name).catch(console.error);
            io.to(partner.id).emit('match-found', {
                room: roomName,
                partnerName: name,
                initiator: true
            });
            socket.emit('match-found', {
                room: roomName,
                partnerName: partner.name,
                initiator: false
            });
        }
        else {
            waitingUsers.push({ id: socket.id, socket, name, coords: location });
            socket.emit('waiting', {
                message: 'Looking for someone...',
                waitingCount: waitingUsers.length,
                onlineCount: io.sockets.sockets.size
            });
        }
        broadcastOnlineStats();
    });
    socket.on('request-bot-match', ({ name }) => {
        waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
        const roomName = `room-bot-${socket.id}`;
        socket.join(roomName);
        (0, db_1.recordSessionStart)(roomName, 'Zivvo Echo Bot', name).catch(console.error);
        socket.emit('match-found', {
            room: roomName,
            partnerName: 'Zivvo Echo Bot 🤖',
            initiator: true,
            isBot: true
        });
        broadcastOnlineStats();
    });
    socket.on('offer', (data) => {
        socket.to(data.room).emit('offer', data);
    });
    socket.on('answer', (data) => {
        socket.to(data.room).emit('answer', data);
    });
    socket.on('ice-candidate', (data) => {
        socket.to(data.room).emit('ice-candidate', data);
    });
    socket.on('chat-message', (data) => {
        socket.to(data.room).emit('chat-message', data);
        if (data.room && data.text) {
            (0, db_1.saveChatMessage)(data.room, data.sender || 'User', data.text).catch(console.error);
        }
        if (data.room?.startsWith('room-bot-')) {
            setTimeout(() => {
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const botReply = `Hello! I received: "${data.text}". WebRTC and Real-Time Socket communication are active! 🚀`;
                socket.emit('chat-message', { sender: 'Zivvo Echo Bot 🤖', text: botReply, time });
                (0, db_1.saveChatMessage)(data.room, 'Zivvo Echo Bot 🤖', botReply).catch(console.error);
            }, 800);
        }
    });
    const cleanupUser = () => {
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
        const rooms = Array.from(socket.rooms);
        const chatRoom = rooms.find(r => r.startsWith('room-'));
        if (chatRoom) {
            (0, db_1.recordSessionEnd)(chatRoom).catch(console.error);
            socket.to(chatRoom).emit('partner-disconnected');
            socket.leave(chatRoom);
        }
        broadcastOnlineStats();
    };
    socket.on('next-partner', cleanupUser);
    socket.on('disconnect', cleanupUser);
});
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ZivvoChat Socket Server running on port ${PORT}`);
});
