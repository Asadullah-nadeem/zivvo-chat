"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, MatchData, SignalData, ChatData } from '../types/types';

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

    const socketRef = useRef<Socket | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const roomRef = useRef<string | null>(null);

    const handleIceCandidate = useCallback(async ({ candidate }: SignalData) => {
        if (peerConnection.current && candidate) {
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("ICE Error", e);
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

        localStreamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current!);
        });

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
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

    const connectSocket = useCallback((name: string) => {
        setStatus('Connecting to server...');
        socketRef.current = io('http://localhost:8000');
        socketRef.current.emit('join-pool', { name });
        setIsSearching(true);

        socketRef.current.on('waiting', (data: { message: string }) => {
            setStatus(data.message);
            setIsSearching(true);
            setPartnerName('...');
            if(remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
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
            if(remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            if(peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            setIsSearching(true);
            socketRef.current?.emit('join-pool', { name });
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
                setStatus('Requesting Permissions...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                await new Promise<void>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(() => resolve(), reject);
                });

                if ('Notification' in window) {
                    await Notification.requestPermission();
                }

                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                setPermissionGranted(true);
                connectSocket(name);

            } catch (error) {
                console.error("Permission denied", error);
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
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        setMessages([]);
        setPartnerName('...');
        setIsSearching(true);
        setStatus('Searching...');
        socketRef.current?.emit('next-partner');
        socketRef.current?.emit('join-pool', { name: myName });
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
                remoteVideoRef={remoteVideoRef}
                localVideoRef={localVideoRef}
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