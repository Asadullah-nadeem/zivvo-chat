"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, MatchData, SignalData, ChatData } from '../types/types';

import VideoArea from './components/VideoArea';
import ChatPanel from './components/ChatPanel';
import PermissionGuard from './components/PermissionGuard';
import { config } from '../../lib/config';

export default function VideoChatPage() {
    const router = useRouter();

    const [status, setStatus] = useState<string>('Initializing...');
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [myName, setMyName] = useState('');
    const [partnerName, setPartnerName] = useState('Stranger');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);

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
                    // Weak internet: Reduce quality
                    // console.log('Weak network detected. Reducing quality...');
                    params.encodings[0].maxBitrate = 200000; // 200 kbps
                    params.encodings[0].scaleResolutionDownBy = 2;
                } else {
                    // Strong internet: High quality
                    // console.log('Strong network detected. Maximizing quality...');
                    params.encodings[0].maxBitrate = 1500000; // 1.5 Mbps
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

    const connectSocket = useCallback((name: string, loc: {lat: number, lng: number} | null) => {
        setStatus('Connecting to server...');
        const socketUrl = config.socketUrl;

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io(socketUrl);

        socketRef.current.emit('join-pool', { name, location: loc });
        setIsSearching(true);

        socketRef.current.on('waiting', (data: { message: string }) => {
            setStatus(data.message);
            setIsSearching(true);
            setPartnerName('...');
            setRemoteStream(null);
        });

        socketRef.current.on('match-found', (data: MatchData) => {
            setIsSearching(false);
            setStatus('Connected');
            setPartnerName(data.partnerName || 'Stranger');
            roomRef.current = data.room;
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
            if(peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            setIsSearching(true);
            socketRef.current?.emit('join-pool', { name, location: loc });
        });
    }, [handleOffer, handleAnswer, handleIceCandidate, initializePeerConnection]);

    useEffect(() => {
        const name = localStorage.getItem('chatUsername');
        if (!name) {
            router.push('/');
            return;
        }
        
        if (name !== myName) {
            setMyName(name);
        }

        const getPermissions = async () => {
            try {
                setStatus('Requesting Permissions...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                localStreamRef.current = stream;
                setLocalStream(stream);

                let coords = null;
                try {
                    const locationPromise = new Promise<{lat: number, lng: number}>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                            (err) => reject(err)
                        );
                    });

                    const timeoutPromise = new Promise<{lat: number, lng: number}>((_, reject) =>
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
                // Check if it's a media device error
                if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'NotFoundError')) {
                     setPermissionGranted(false);
                     setStatus('Permissions Required');
                } else {
                    // If it's just location or something else, we might still want to allow access but with limited features
                    // For now, let's assume camera/mic are critical.
                    setPermissionGranted(false);
                    setStatus('Permissions Required');
                }
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
        setIsMuted(prev => !prev);
    };

    const handleNextPartner = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setRemoteStream(null);
        setMessages([]);
        setPartnerName('...');
        setIsSearching(true);
        setStatus('Searching...');
        socketRef.current?.emit('next-partner');
        socketRef.current?.emit('join-pool', { name: myName, location: locationCoords });
    };

    const handleLeave = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        socketRef.current?.disconnect();
        router.push('/');
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !roomRef.current) return;

        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [...prev, { sender: 'You', text: inputText, time }]);
        socketRef.current?.emit('chat-message', { room: roomRef.current, text: inputText, sender: 'Partner', time });
        setInputText('');
    };

    if (!permissionGranted) {
        return <PermissionGuard status={status} />;
    }

    return (
        <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-white">
            <VideoArea
                localStream={localStream}
                remoteStream={remoteStream}
                partnerName={partnerName}
                myName={myName}
                isSearching={isSearching}
                status={status}
                onLeave={handleLeave}
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