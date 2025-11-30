export const config = {
    // Socket.IO Server URL
    // In development, this is usually http://localhost:5000
    // In production, this should be your deployed server URL
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    
    // API Base URL (if you have REST endpoints)
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
};
