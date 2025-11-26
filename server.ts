import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = 8090;

interface WaitingUser {
    id: string;
    socket: Socket;
    name: string;
}

let waitingUser: WaitingUser | null = null;

io.on('connection', (socket) => {
    socket.on('join-pool', ({ name }) => {
        if (waitingUser) {
            const roomName = `room-${waitingUser.id}-${socket.id}`;

            socket.join(roomName);
            waitingUser.socket.join(roomName);

            io.to(waitingUser.id).emit('match-found', {
                room: roomName,
                partnerName: name,
                initiator: true
            });

            socket.emit('match-found', {
                room: roomName,
                partnerName: waitingUser.name,
                initiator: false
            });

            waitingUser = null;
        } else {
            waitingUser = { id: socket.id, socket, name };
            socket.emit('waiting', { message: 'Searching for a partner...' });
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

    socket.on('next-partner', () => {
        const rooms = Array.from(socket.rooms);
        const chatRoom = rooms.find(r => r.startsWith('room-'));

        if (chatRoom) {
            socket.to(chatRoom).emit('partner-disconnected');
            socket.leave(chatRoom);
        }

        if (waitingUser && waitingUser.id === socket.id) {
            waitingUser = null;
        }
    });

    socket.on('disconnecting', () => {
        const rooms = Array.from(socket.rooms);
        const chatRoom = rooms.find(r => r.startsWith('room-'));

        if (chatRoom) {
            socket.to(chatRoom).emit('partner-disconnected');
        }
    });

    socket.on('disconnect', () => {
        if (waitingUser && waitingUser.id === socket.id) {
            waitingUser = null;
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});