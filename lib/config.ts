export const config = {
    // Socket.IO Server URL
    // In development, this is usually http://localhost:5000
    // In production, this should be your deployed server URL
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    
    // API Base URL (if you have REST endpoints)
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',

    // WebRTC ICE Servers (STUN/TURN)
    iceServers: [
        // Google Public STUN - Reliable global coverage
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // Cloudflare Public STUN - Often faster due to edge network
        { urls: 'stun:stun.cloudflare.com:3478' },
    ]
};
