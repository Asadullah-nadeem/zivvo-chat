
import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MessageSquare, User, PhoneOff, MicOff, Mic as MicOn } from 'lucide-react';

interface Props {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    partnerName: string;
    myName: string;
    isSearching: boolean;
    status: string;
    onLeave: () => void;
    onConnectBot?: () => void;
    mode: 'video' | 'audio' | 'text';
    setMode: (mode: 'video' | 'audio' | 'text') => void;
    isMuted: boolean;
    toggleMute: () => void;
}

export default function VideoArea({
                                      localStream,
                                      remoteStream,
                                      partnerName,
                                      myName,
                                      isSearching,
                                      status,
                                      onLeave,
                                      onConnectBot,
                                      mode,
                                      setMode,
                                      isMuted,
                                      toggleMute
                                  }: Props) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Attach Streams
    useEffect(() => {
        if (localVideoRef.current && localStream && mode === 'video') {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, mode]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream && mode === 'video') {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, mode]);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setHasMoved(true);

        const element = e.currentTarget as HTMLElement;
        const rect = element.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();

        const containerRect = containerRef.current.getBoundingClientRect();
        const elementWidth = 192; // w-48 = 12rem = 192px
        const elementHeight = 144; // h-36 = 9rem = 144px

        let x = e.clientX - containerRect.left - dragOffset.current.x;
        let y = e.clientY - containerRect.top - dragOffset.current.y;

        x = Math.max(16, Math.min(x, containerRect.width - elementWidth - 16));
        y = Math.max(16, Math.min(y, containerRect.height - elementHeight - 16));

        setPosition({ x, y });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };


    return (
        <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="flex-1 bg-gray-950 relative overflow-hidden flex items-center justify-center select-none"
        >

            {/* Status Overlay */}
            <div className="absolute top-6 left-6 z-30 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-white/90 text-sm font-semibold tracking-wide">{status}</span>
            </div>

            {/* Mode Switcher */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 flex gap-1 shadow-xl">
                <button
                    onClick={() => setMode('video')}
                    title="Video Call"
                    className={`p-3 rounded-full transition-all duration-300 ${mode === 'video' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                    <Video size={20} />
                </button>
                <button
                    onClick={() => setMode('audio')}
                    title="Voice Call"
                    className={`p-3 rounded-full transition-all duration-300 ${mode === 'audio' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                    <Mic size={20} />
                </button>
                <button
                    onClick={() => setMode('text')}
                    title="Text Only"
                    className={`p-3 rounded-full transition-all duration-300 ${mode === 'text' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                    <MessageSquare size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="absolute inset-0 w-full h-full z-0">
                {isSearching ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white/80 p-6 text-center">
                        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                            <span className="absolute inset-0 border-4 border-white/10 rounded-full animate-ping"></span>
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-wide mb-2">Finding Partner...</h3>
                        <p className="text-sm text-gray-400 max-w-sm mb-6">Looking for an active user online...</p>
                        {onConnectBot && (
                            <button
                                onClick={onConnectBot}
                                className="px-5 py-2.5 rounded-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-sm font-semibold transition-all shadow-md active:scale-95"
                            >
                                🤖 Test Connection with Echo Bot
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {mode === 'video' ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
                                {/* Animated Background for Audio Mode */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-50"></div>
                                <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white/10 animate-float">
                                        <User size={80} className="text-white drop-shadow-lg" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{partnerName}</h3>
                                    <p className="text-white/50 text-lg flex items-center gap-2">
                                        {mode === 'audio' ? <Mic size={16} /> : <MessageSquare size={16} />}
                                        {mode === 'audio' ? 'Voice Call' : 'Text Chat'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Partner Name Badge */}
            {!isSearching && (
                <div className="absolute top-6 right-6 z-20">
                    <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                        {partnerName}
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-8 left-0 w-full flex justify-center items-center z-30 pointer-events-none">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl flex gap-4 pointer-events-auto transform hover:scale-105 transition-all duration-300">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-xl transition-all duration-200 ${
                            isMuted
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                                : 'bg-white/20 text-white hover:bg-white/40'
                        }`}
                    >
                        {isMuted ? <MicOff size={24} /> : <MicOn size={24} />}
                    </button>

                    <button
                        onClick={onLeave}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/40 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <PhoneOff size={20} />
                        End Call
                    </button>
                </div>
            </div>

            {/* Local Preview (Draggable) */}
            {mode === 'video' && (
                <div
                    onPointerDown={handlePointerDown}
                    className={`absolute w-32 md:w-48 aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 z-40 cursor-move touch-none select-none transition-shadow ${
                        isDragging ? 'shadow-blue-500/50 scale-105 ring-2 ring-blue-400' : 'hover:scale-105'
                    }`}
                    style={hasMoved ? { left: position.x, top: position.y } : { bottom: '2rem', right: '2rem' }}
                >
                    <div className="w-full h-full relative bg-gray-900 pointer-events-none">
                        {localStream ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white/50 text-xs">...</span>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded font-bold">
                            {myName} (You)
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
