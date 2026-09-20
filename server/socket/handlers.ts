import { Server, Socket } from 'socket.io';
import { verifyUserToken } from '../../lib/auth';
import { 
    storeRoomToken, 
    pushChatMessageRedis, 
    setCallStateRedis 
} from '../../lib/redis';
import { 
    generateSecureRoomToken,
    createSecureRoomUrl,
    recordSessionStart, 
    recordSessionEnd, 
    saveChatMessage, 
    recordCallTimestamp 
} from '../../lib/db';

interface WaitingUser {
    id: string;
    socket: Socket;
    name: string;
    userId: string;
    coords: { lat: number; lng: number } | null;
}

let waitingUsers: WaitingUser[] = [];

export function getOnlineCounts(io: Server) {
    return {
        onlineCount: io.sockets.sockets.size,
        waitingCount: waitingUsers.length
    };
}

function broadcastOnlineStats(io: Server) {
    io.emit('online-stats', getOnlineCounts(io));
}

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

export function registerSocketHandlers(io: Server) {
    // --- Socket Authentication Middleware ---
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        const decoded = verifyUserToken(token);
        if (!decoded) {
            return next(new Error("Authentication error: Invalid or forged token"));
        }

        socket.data.user = decoded;
        next();
    });

    // --- Connection Events ---
    io.on('connection', (socket) => {
        broadcastOnlineStats(io);

        socket.on('join-pool', ({ name, location }) => {
            const userId = socket.data.user?.userId || `usr_${socket.id}`;
            
            waitingUsers = waitingUsers.filter(u => u.id !== socket.id && u.userId !== userId);

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

                // Generate Cryptographically Secure 64-Character Token Key
                const roomToken = generateSecureRoomToken();
                const roomName = `room_${roomToken}`;

                socket.join(roomName);
                partner.socket.join(roomName);

                createSecureRoomUrl(roomToken, roomName).catch(console.error);
                recordSessionStart(roomToken, roomName, partner.name, name).catch(console.error);
                storeRoomToken(roomToken, { roomName, user1: partner.name, user2: name }).catch(console.error);
                setCallStateRedis(roomToken, { status: 'CONNECTED', user: name }).catch(console.error);

                io.to(partner.id).emit('match-found', {
                    room: roomName,
                    roomCode: roomToken,
                    partnerName: name,
                    initiator: true
                });

                socket.emit('match-found', {
                    room: roomName,
                    roomCode: roomToken,
                    partnerName: partner.name,
                    initiator: false
                });
            } else {
                waitingUsers.push({ id: socket.id, socket, name, userId, coords: location });
                socket.emit('waiting', { 
                    message: 'Looking for someone...',
                    waitingCount: waitingUsers.length,
                    onlineCount: io.sockets.sockets.size
                });
            }

            broadcastOnlineStats(io);
        });

        socket.on('request-bot-match', ({ name }) => {
            waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
            const roomToken = generateSecureRoomToken();
            const roomName = `room_bot_${roomToken}`;
            socket.join(roomName);

            createSecureRoomUrl(roomToken, roomName).catch(console.error);
            recordSessionStart(roomToken, roomName, 'Zivvo Echo Bot', name).catch(console.error);
            storeRoomToken(roomToken, { roomName, user1: 'Zivvo Echo Bot', user2: name }).catch(console.error);
            setCallStateRedis(roomToken, { status: 'BOT_CONNECTED', user: name }).catch(console.error);

            socket.emit('match-found', {
                room: roomName,
                roomCode: roomToken,
                partnerName: 'Zivvo Echo Bot 🤖',
                initiator: true,
                isBot: true
            });

            broadcastOnlineStats(io);
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
                const token = data.roomCode || data.room.replace(/^room_bot_|^room_/, '');
                const messageObj = { sender: data.sender || 'User', text: data.text, time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                
                // Store in PostgreSQL & Redis List simultaneously
                saveChatMessage(token, messageObj.sender, messageObj.text).catch(console.error);
                pushChatMessageRedis(token, messageObj).catch(console.error);
            }

            if (data.room?.startsWith('room_bot_') || data.room?.startsWith('room-bot-')) {
                setTimeout(() => {
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const botReply = `Hello! I received: "${data.text}". WebRTC, PostgreSQL, and Redis Key-Value Store are live! ⚡`;
                    const botMsg = { sender: 'Zivvo Echo Bot 🤖', text: botReply, time };

                    socket.emit('chat-message', botMsg);
                    const token = data.roomCode || data.room.replace(/^room_bot_|^room_/, '');
                    saveChatMessage(token, botMsg.sender, botMsg.text).catch(console.error);
                    pushChatMessageRedis(token, botMsg).catch(console.error);
                }, 800);
            }
        });

        socket.on('call-event', (data: { room: string; roomCode?: string; eventType: string; userName?: string }) => {
            if (data.room && data.eventType) {
                const userName = data.userName || socket.data.user?.username || 'User';
                const token = data.roomCode || data.room.replace(/^room_bot_|^room_/, '');
                recordCallTimestamp(token, userName, data.eventType).catch(console.error);
                setCallStateRedis(token, { status: data.eventType, user: userName }).catch(console.error);
                socket.to(data.room).emit('call-event', { ...data, userName });
            }
        });

        const cleanupUser = () => {
            waitingUsers = waitingUsers.filter(user => user.id !== socket.id);

            const rooms = Array.from(socket.rooms);
            const chatRoom = rooms.find(r => r.startsWith('room_') || r.startsWith('room-'));

            if (chatRoom) {
                const token = chatRoom.replace(/^room_bot_|^room_/, '');
                recordSessionEnd(token).catch(console.error);
                setCallStateRedis(token, { status: 'ENDED' }).catch(console.error);
                socket.to(chatRoom).emit('partner-disconnected');
                socket.leave(chatRoom);
            }

            broadcastOnlineStats(io);
        };

        socket.on('next-partner', cleanupUser);
        socket.on('disconnect', cleanupUser);
    });
}
