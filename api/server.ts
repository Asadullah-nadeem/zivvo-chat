import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json()); // Enable JSON body parsing

// Enable CORS for API routes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = parseInt(process.env.PORT || '5000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';

// --- API Routes ---
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }
    
    // Create a token that expires in 24 hours
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

interface WaitingUser {
    id: string;
    socket: Socket;
    name: string;
    coords: { lat: number; lng: number } | null;
}

let waitingUsers: WaitingUser[] = [];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        // Attach user info to socket if needed
        (socket as any).user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    socket.on('join-pool', ({ name, location }) => {
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
        } else {
            waitingUsers.push({ id: socket.id, socket, name, coords: location });
            socket.emit('waiting', { message: 'Looking for someone...' });
        }
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
    });

    const cleanupUser = () => {
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);

        const rooms = Array.from(socket.rooms);
        const chatRoom = rooms.find(r => r.startsWith('room-'));

        if (chatRoom) {
            socket.to(chatRoom).emit('partner-disconnected');
            socket.leave(chatRoom);
        }
    };

    socket.on('next-partner', cleanupUser);
    socket.on('disconnect', cleanupUser);
});

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});