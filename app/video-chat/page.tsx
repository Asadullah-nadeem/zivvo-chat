"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, MatchData, SignalData, ChatData } from '@/app/types';

import VideoArea from './components/VideoArea';
import ChatPanel from './components/ChatPanel';
import PermissionGuard from './components/PermissionGuard';

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

    const socketRef = useRef<Socket | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const roomRef = useRef<string | null>(null);

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
        if (peerConnection.current && answer) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }, []);

    const initializePeerConnection = useCallback(async (initiator: boolean, room: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
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
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current?.emit('offer', { room, offer });
        }
    }, []);

    const handleOffer = useCallback(async ({ offer, room }: SignalData) => {
        if (!peerConnection.current) return;
        if (offer) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socketRef.current?.emit('answer', { room, answer });
        }
    }, []);

    const connectSocket = useCallback((name: string, loc: {lat: number, lng: number} | null) => {
        setStatus('Connecting to server...');
        socketRef.current = io('http://localhost:8090');

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
        setMyName(name);

        const getPermissions = async () => {
            try {
                setStatus('Setting up...');
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
                    console.log("Location skipped or denied for speed.");
                }

                if ('Notification' in window) {
                    Notification.requestPermission();
                }

                setPermissionGranted(true);
                connectSocket(name, coords);

            } catch (error) {
                console.error(error);
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
    }, [connectSocket, router]);

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
        <div className="h-screen w-full flex overflow-hidden bg-black">
            <VideoArea
                localStream={localStream}
                remoteStream={remoteStream}
                partnerName={partnerName}
                myName={myName}
                isSearching={isSearching}
                status={status}
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