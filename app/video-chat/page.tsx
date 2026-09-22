"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, MatchData, SignalData, ChatData } from '../types/types';

import VideoArea from './components/VideoArea';
import ChatPanel from './components/ChatPanel';
import PermissionGuard from './components/PermissionGuard';
import { config } from '../../lib/config';

function generateCryptoToken64(): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

export default function VideoChatPage() {
    const router = useRouter();

    const [status, setStatus] = useState<string>('Initializing...');
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [myName] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('chatUsername') || '';
        }
        return '';
    });
    const [partnerName, setPartnerName] = useState('Stranger');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const [mode, setMode] = useState<'video' | 'audio' | 'text'>('video');
    const [isMuted, setIsMuted] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const roomRef = useRef<string | null>(null);
    const statsInterval = useRef<NodeJS.Timeout | null>(null);

    // --- Network Quality & Load Balancing Logic ---
    const monitorConnectionQuality = useCallback(async () => {
        if (!peerConnection.current) return;

        try {
            const stats = await peerConnection.current.getStats();
            let packetsLost = 0;
            let roundTripTime = 0;

            stats.forEach(report => {
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    packetsLost = report.packetsLost;
                }
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    roundTripTime = report.currentRoundTripTime;
                }
            });

            // Adaptive Bitrate Logic
            const senders = peerConnection.current.getSenders();
            const videoSender = senders.find(s => s.track?.kind === 'video');

            if (videoSender) {
                const params = videoSender.getParameters();
                if (!params.encodings) params.encodings = [{}];

                if (packetsLost > 50 || roundTripTime > 0.2) {
                    // Weak internet: Reduce quality but keep it usable
                    params.encodings[0].maxBitrate = 500000; // 500 kbps
                    params.encodings[0].scaleResolutionDownBy = 2;
                } else {
                    // Strong internet: High quality
                    params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps
                    params.encodings[0].scaleResolutionDownBy = 1;
                }

                videoSender.setParameters(params).catch(e => console.warn("Bitrate adaptation failed", e));
            }

        } catch (e) {
            console.error("Error monitoring stats:", e);
        }
    }, []);

    useEffect(() => {
        if (status === 'Connected') {
            statsInterval.current = setInterval(monitorConnectionQuality, 5000);
        } else {
            if (statsInterval.current) clearInterval(statsInterval.current);
        }
        return () => {
            if (statsInterval.current) clearInterval(statsInterval.current);
        };
    }, [status, monitorConnectionQuality]);


    const handleIceCandidate = useCallback(async ({ candidate }: SignalData) => {
        if (peerConnection.current && candidate) {
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleAnswer = useCallback(async ({ answer }: SignalData) => {
        const pc = peerConnection.current;
        if (!pc || !answer) return;

        if (pc.signalingState === 'stable') {
            return;
        }

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
            console.error(err);
        }
    }, []);

    const initializePeerConnection = useCallback(async (initiator: boolean, room: string) => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        const pc = new RTCPeerConnection({
            iceServers: config.iceServers,
            iceCandidatePoolSize: 10, // Pre-gather candidates for faster connection start
            bundlePolicy: 'max-bundle', // Optimizes connection by bundling tracks
            rtcpMuxPolicy: 'require'
        });

        peerConnection.current = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('ice-candidate', { room, candidate: event.candidate });
            }
        };

        if (initiator) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current?.emit('offer', { room, offer });
            } catch (err) {
                console.error(err);
            }
        }
    }, []);

    const handleOffer = useCallback(async ({ offer, room }: SignalData) => {
        const pc = peerConnection.current;
        if (!pc || !offer) return;

        if (pc.signalingState !== "stable") {
            return;
        }

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current?.emit('answer', { room, answer });
        } catch (err) {
            console.error(err);
        }
    }, []);

    const connectSocket = useCallback((name: string, loc: { lat: number, lng: number } | null) => {
        setStatus('Connecting to server...');
        const socketUrl = config.socketUrl;
        const token = localStorage.getItem('chatToken');

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            upgrade: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        socketRef.current.on('connect_error', (err) => {
            console.error("Connection Error:", err.message);
            setStatus(`Connection Error: ${err.message}`);
        });

        socketRef.current.emit('join-pool', { name, location: loc });
        setIsSearching(true);

        socketRef.current.on('online-stats', (data: { onlineCount: number; waitingCount: number }) => {
            if (data.onlineCount !== undefined) {
                setStatus(prev => prev === 'Connected' ? 'Connected' : `Searching (Users online: ${data.onlineCount})...`);
            }
        });

        socketRef.current.on('waiting', (data: { message: string; onlineCount?: number }) => {
            const countMsg = data.onlineCount ? ` (Online: ${data.onlineCount})` : '';
            setStatus(`${data.message}${countMsg}`);
            setIsSearching(true);
            setPartnerName('...');
            setRemoteStream(null);
        });

        socketRef.current.on('match-found', (data: MatchData & { roomCode?: string }) => {
            setIsSearching(false);
            setStatus('Connected');
            setPartnerName(data.partnerName || 'Stranger');
            roomRef.current = data.room;

            if (data.roomCode) {
                window.history.replaceState(null, '', `/video-chat/${data.roomCode}`);
            }

            initializePeerConnection(data.initiator, data.room).catch(console.error);
        });

        socketRef.current.on('offer', (data: SignalData) => handleOffer(data));
        socketRef.current.on('answer', (data: SignalData) => handleAnswer(data));
        socketRef.current.on('ice-candidate', (data: SignalData) => handleIceCandidate(data));

        socketRef.current.on('chat-message', (msg: ChatData) => {
            setMessages(prev => [...prev, { sender: msg.sender, text: msg.text, time: msg.time }]);
        });

        socketRef.current.on('partner-disconnected', () => {
            setStatus('Partner disconnected');
            setPartnerName('...');
            setRemoteStream(null);
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            setIsSearching(true);
            socketRef.current?.emit('join-pool', { name, location: loc });
        });
    }, [handleOffer, handleAnswer, handleIceCandidate, initializePeerConnection]);

    useEffect(() => {
        const handlePopState = () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('chatToken');
                window.location.replace('/');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('chatToken');
            const name = localStorage.getItem('chatUsername');
            if (!token || !name) {
                window.location.replace('/');
                return;
            }

            const path = window.location.pathname;
            if (path === '/video-chat' || path === '/video-chat/') {
                const roomToken = generateCryptoToken64();
                window.history.replaceState(null, '', `/video-chat/${roomToken}`);
            }
        }
    }, [router]);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('chatToken') : null;
        const name = myName || (typeof window !== 'undefined' ? localStorage.getItem('chatUsername') : null);

        if (!token || !name) {
            if (typeof window !== 'undefined') {
                window.location.replace('/');
            } else {
                router.replace('/');
            }
            return;
        }

        const getPermissions = async () => {
            try {
                setStatus('Requesting Permissions...');

                let stream: MediaStream | null = null;
                let currentMode: 'video' | 'audio' | 'text' = 'video';

                try {
                    // 1. Try Video + Audio with HD constraints
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: "user",
                            frameRate: { ideal: 30 }
                        },
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });
                } catch (err: unknown) {
                    console.warn("Failed to get video+audio:", err);
                    const errorName = err instanceof Error ? err.name : '';

                    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
                        setStatus('Camera/Mic permission denied. Switching to Text mode.');
                        currentMode = 'text';
                    } else {
                        try {
                            // 2. Fallback to Audio Only
                            stream = await navigator.mediaDevices.getUserMedia({
                                video: false,
                                audio: {
                                    echoCancellation: true,
                                    noiseSuppression: true
                                }
                            });
                            currentMode = 'audio';
                            setStatus('Camera not found. Switching to Audio mode.');
                        } catch (err2: unknown) {
                            console.warn("Failed to get audio:", err2);
                            const err2Name = err2 instanceof Error ? err2.name : '';
                            // 3. Fallback to Text Only
                            currentMode = 'text';
                            if (err2Name === 'NotAllowedError') {
                                setStatus('Microphone permission denied. Switching to Text mode.');
                            } else {
                                setStatus('No media devices found. Switching to Text mode.');
                            }
                        }
                    }
                }

                if (stream) {
                    localStreamRef.current = stream;
                    setLocalStream(stream);
                }

                setMode(currentMode);

                let coords = null;
                try {
                    const locationPromise = new Promise<{ lat: number, lng: number }>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                            (err) => reject(err)
                        );
                    });

                    const timeoutPromise = new Promise<{ lat: number, lng: number }>((_, reject) =>
                        setTimeout(() => reject("Timeout"), 2500)
                    );

                    coords = await Promise.race([locationPromise, timeoutPromise]);
                    setLocationCoords(coords);

                } catch (e) {
                    console.log("Location access denied or timed out, proceeding without location.", e);
                }

                if ('Notification' in window) {
                    Notification.requestPermission();
                }

                setPermissionGranted(true);
                connectSocket(name, coords);

            } catch (error) {
                console.error("Permission Error:", error);
                setPermissionGranted(false);
                setStatus('Permissions Required');
            }
        };

        getPermissions().catch(console.error);

        return () => {
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            socketRef.current?.disconnect();
            if (peerConnection.current) peerConnection.current.close();
        };
    }, [connectSocket, router, myName]);

    // Handle Mode and Mute Switching
    useEffect(() => {
        if (localStreamRef.current) {
            const stream = localStreamRef.current;

            // Video tracks: enabled only in 'video' mode
            stream.getVideoTracks().forEach(track => {
                track.enabled = (mode === 'video');
            });

            // Audio tracks: enabled if not 'text' mode AND not muted
            stream.getAudioTracks().forEach(track => {
                track.enabled = (mode !== 'text' && !isMuted);
            });
        }
    }, [mode, isMuted]);

    const toggleMute = () => {
        setIsMuted(prev => {
            const nextMuted = !prev;
            if (roomRef.current) {
                socketRef.current?.emit('call-event', {
                    room: roomRef.current,
                    eventType: nextMuted ? 'MIC_MUTED' : 'MIC_UNMUTED',
                    userName: myName
                });
            }
            return nextMuted;
        });
    };

    const handleNextPartner = () => {
        if (roomRef.current) {
            socketRef.current?.emit('call-event', {
                room: roomRef.current,
                eventType: 'PARTNER_SKIPPED',
                userName: myName
            });
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        const nextToken = generateCryptoToken64();
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/video-chat/${nextToken}`);
        }

        setRemoteStream(null);
        setMessages([]);
        setPartnerName('...');
        setIsSearching(true);
        setStatus('Searching...');
        socketRef.current?.emit('next-partner');
        socketRef.current?.emit('join-pool', { name: myName, location: locationCoords });
    };

    const handleConnectBot = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        const botToken = generateCryptoToken64();
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/video-chat/${botToken}`);
        }

        setRemoteStream(null);
        setMessages([]);
        setPartnerName('...');
        setIsSearching(true);
        setStatus('Connecting to Echo Bot...');
        socketRef.current?.emit('request-bot-match', { name: myName });
    };

    const handleLeave = () => {
        if (roomRef.current) {
            socketRef.current?.emit('call-event', {
                room: roomRef.current,
                eventType: 'CALL_ENDED',
                userName: myName
            });
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        socketRef.current?.disconnect();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('chatToken');
            window.location.replace('/');
        } else {
            router.replace('/');
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !roomRef.current) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { sender: 'You', text: inputText, time }]);
        socketRef.current?.emit('chat-message', { room: roomRef.current, text: inputText, sender: 'Partner', time });
        setInputText('');
    };

    if (!permissionGranted) {
        return <PermissionGuard status={status} />;
    }

    return (
        <div className="h-[100dvh] w-full max-w-full flex flex-col md:flex-row overflow-hidden bg-white">
            <VideoArea
                localStream={localStream}
                remoteStream={remoteStream}
                partnerName={partnerName}
                myName={myName}
                isSearching={isSearching}
                status={status}
                onLeave={handleLeave}
                onConnectBot={handleConnectBot}
                mode={mode}
                setMode={setMode}
                isMuted={isMuted}
                toggleMute={toggleMute}
            />
            <ChatPanel
                messages={messages}
                inputText={inputText}
                setInputText={setInputText}
                sendMessage={sendMessage}
                handleNextPartner={handleNextPartner}
                isSearching={isSearching}
            />
        </div>
    );
}