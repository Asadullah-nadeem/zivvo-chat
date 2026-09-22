"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlineCounts = getOnlineCounts;
exports.registerSocketHandlers = registerSocketHandlers;
const auth_1 = require("../../lib/auth");
const redis_1 = require("../../lib/redis");
const db_1 = require("../../lib/db");
let waitingUsers = [];
function getOnlineCounts(io) {
    return {
        onlineCount: io.sockets.sockets.size,
        waitingCount: waitingUsers.length
    };
}
function broadcastOnlineStats(io) {
    io.emit('online-stats', getOnlineCounts(io));
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
function registerSocketHandlers(io) {
    // --- Socket Authentication Middleware ---
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        const decoded = (0, auth_1.verifyUserToken)(token);
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
                const roomToken = (0, db_1.generateSecureRoomToken)();
                const roomName = `room_${roomToken}`;
                socket.join(roomName);
                partner.socket.join(roomName);
                (0, db_1.createSecureRoomUrl)(roomToken, roomName).catch(console.error);
                (0, db_1.recordSessionStart)(roomToken, roomName, partner.name, name).catch(console.error);
                (0, redis_1.storeRoomToken)(roomToken, { roomName, user1: partner.name, user2: name }).catch(console.error);
                (0, redis_1.setCallStateRedis)(roomToken, { status: 'CONNECTED', user: name }).catch(console.error);
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
            }
            else {
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
            const roomToken = (0, db_1.generateSecureRoomToken)();
            const roomName = `room_bot_${roomToken}`;
            socket.join(roomName);
            (0, db_1.createSecureRoomUrl)(roomToken, roomName).catch(console.error);
            (0, db_1.recordSessionStart)(roomToken, roomName, 'Zivvo Echo Bot', name).catch(console.error);
            (0, redis_1.storeRoomToken)(roomToken, { roomName, user1: 'Zivvo Echo Bot', user2: name }).catch(console.error);
            (0, redis_1.setCallStateRedis)(roomToken, { status: 'BOT_CONNECTED', user: name }).catch(console.error);
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
                (0, db_1.saveChatMessage)(token, messageObj.sender, messageObj.text).catch(console.error);
                (0, redis_1.pushChatMessageRedis)(token, messageObj).catch(console.error);
            }
            if (data.room?.startsWith('room_bot_') || data.room?.startsWith('room-bot-')) {
                setTimeout(() => {
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const textLower = (data.text || '').toLowerCase().trim();
                    let botReply = `I received your message: "${data.text}". How can I assist you?`;
                    // 30+ Custom Conversational Bot Responses (Plain Text, No Emojis)
                    if (textLower === 'hello' || textLower === 'hi' || textLower === 'hey' || textLower === 'hola') {
                        botReply = `Hello! Great to connect with you! How are you doing today?`;
                    }
                    else if (textLower.includes('how are you') || textLower.includes('how are u') || textLower.includes('how r u') || textLower.includes('how is it going')) {
                        botReply = `I'm doing awesome, thanks for asking! How about you?`;
                    }
                    else if (textLower.includes('what is your name') || textLower.includes("what's your name") || textLower.includes('who are you') || textLower.includes('who r u')) {
                        botReply = `I'm the Zivvo Echo Bot! Built to chat and test video & audio connections with you.`;
                    }
                    else if (textLower.includes('bye') || textLower.includes('goodbye') || textLower.includes('see ya') || textLower.includes('ttyl')) {
                        botReply = `Goodbye! Have an amazing day ahead!`;
                    }
                    else if (textLower.includes('thank') || textLower.includes('thanks') || textLower.includes('thx')) {
                        botReply = `You're very welcome!`;
                    }
                    else if (textLower.includes('good morning')) {
                        botReply = `Good morning! Hope you have a wonderful day ahead!`;
                    }
                    else if (textLower.includes('good night')) {
                        botReply = `Good night! Sleep well and take care!`;
                    }
                    else if (textLower.includes('good evening')) {
                        botReply = `Good evening! How was your day?`;
                    }
                    else if (textLower.includes('good afternoon')) {
                        botReply = `Good afternoon! Hope your day is going great!`;
                    }
                    else if (textLower.includes('nice to meet') || textLower.includes('pleasure to meet')) {
                        botReply = `Nice to meet you too! Glad we connected!`;
                    }
                    else if (textLower.includes('what can you do') || textLower === 'help' || textLower.includes('feature')) {
                        botReply = `I can chat with you, help you test video & audio connections, and keep you company!`;
                    }
                    else if (textLower.includes('what is zivvo') || textLower.includes('about zivvo')) {
                        botReply = `Zivvo Chat is an instant video & audio connection platform connecting people around the world!`;
                    }
                    else if (textLower.includes('lol') || textLower.includes('haha') || textLower.includes('lmao') || textLower.includes('hehe')) {
                        botReply = `Haha, glad you find that funny!`;
                    }
                    else if (textLower.includes('cool') || textLower.includes('awesome') || textLower.includes('great') || textLower.includes('nice') || textLower.includes('amazing')) {
                        botReply = `Awesome! Glad you like it!`;
                    }
                    else if (textLower.includes('joke')) {
                        botReply = `Why don't scientists trust atoms? Because they make up everything!`;
                    }
                    else if (textLower.includes('where are you from') || textLower.includes('where do you live')) {
                        botReply = `I live in the cloud, powered by Zivvo Chat servers!`;
                    }
                    else if (textLower.includes('are you real') || textLower.includes('human') || textLower.includes('are you bot')) {
                        botReply = `I'm an AI Echo Bot, here 24/7 to help test connections and keep you entertained!`;
                    }
                    else if (textLower.includes('time')) {
                        botReply = `The current time is ${time}`;
                    }
                    else if (textLower.includes('color')) {
                        botReply = `I love electric blue! What's your favorite color?`;
                    }
                    else if (textLower.includes('single') || textLower.includes('relationship') || textLower.includes('marry')) {
                        botReply = `I'm happily married to my code repository!`;
                    }
                    else if (textLower.includes('how old') || textLower.includes('your age')) {
                        botReply = `I was created recently, so I'm forever young in software years!`;
                    }
                    else if (textLower.includes('who made you') || textLower.includes('who created you') || textLower.includes('developer')) {
                        botReply = `I was created by the talented Zivvo Chat engineering team!`;
                    }
                    else if (textLower === 'ok' || textLower === 'okay' || textLower === 'k' || textLower.includes('got it')) {
                        botReply = `Alright, cool! Let me know if you need anything else.`;
                    }
                    else if (textLower.includes('sorry')) {
                        botReply = `No worries at all! Everything is good.`;
                    }
                    else if (textLower === 'yes' || textLower === 'yeah' || textLower === 'yep' || textLower === 'sure') {
                        botReply = `Awesome! What's next?`;
                    }
                    else if (textLower === 'no' || textLower === 'nope' || textLower === 'nah') {
                        botReply = `Understood! No problem at all.`;
                    }
                    else if (textLower.includes('weather')) {
                        botReply = `It's always sunny in digital cyberspace!`;
                    }
                    else if (textLower.includes('bored')) {
                        botReply = `Let's fix that! Tell me a story or test your video and audio with me.`;
                    }
                    else if (textLower === 'ping' || textLower === 'test') {
                        botReply = `Pong! Connection is crystal clear and super fast!`;
                    }
                    else if (textLower.includes('love')) {
                        botReply = `Thank you! Sending virtual positive vibes your way!`;
                    }
                    const botMsg = { sender: 'Zivvo Echo Bot', text: botReply, time };
                    socket.emit('chat-message', botMsg);
                    const token = data.roomCode || data.room.replace(/^room_bot_|^room_/, '');
                    (0, db_1.saveChatMessage)(token, botMsg.sender, botMsg.text).catch(console.error);
                    (0, redis_1.pushChatMessageRedis)(token, botMsg).catch(console.error);
                }, 800);
            }
        });
        socket.on('call-event', (data) => {
            if (data.room && data.eventType) {
                const userName = data.userName || socket.data.user?.username || 'User';
                const token = data.roomCode || data.room.replace(/^room_bot_|^room_/, '');
                (0, db_1.recordCallTimestamp)(token, userName, data.eventType).catch(console.error);
                (0, redis_1.setCallStateRedis)(token, { status: data.eventType, user: userName }).catch(console.error);
                socket.to(data.room).emit('call-event', { ...data, userName });
            }
        });
        const cleanupUser = () => {
            waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
            const rooms = Array.from(socket.rooms);
            const chatRoom = rooms.find(r => r.startsWith('room_') || r.startsWith('room-'));
            if (chatRoom) {
                const token = chatRoom.replace(/^room_bot_|^room_/, '');
                (0, db_1.recordSessionEnd)(token).catch(console.error);
                (0, redis_1.setCallStateRedis)(token, { status: 'ENDED' }).catch(console.error);
                socket.to(chatRoom).emit('partner-disconnected');
                socket.leave(chatRoom);
            }
            broadcastOnlineStats(io);
        };
        socket.on('next-partner', cleanupUser);
        socket.on('disconnect', cleanupUser);
    });
}
