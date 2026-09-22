
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
        if (!containerRef.current) return;
        const element = e.currentTarget as HTMLElement;
        element.setPointerCapture(e.pointerId);
        setIsDragging(true);

        const containerRect = containerRef.current.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        if (!hasMoved) {
            // Initialize coordinates to current position relative to container
            const currentX = rect.left - containerRect.left;
            const currentY = rect.top - containerRect.top;
            setPosition({ x: currentX, y: currentY });
            setHasMoved(true);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();

        const containerRect = containerRef.current.getBoundingClientRect();
        const element = e.currentTarget as HTMLElement;
        const elementWidth = element.offsetWidth || 112;
        const elementHeight = element.offsetHeight || 150;

        let x = e.clientX - containerRect.left - dragOffset.current.x;
        let y = e.clientY - containerRect.top - dragOffset.current.y;

        x = Math.max(8, Math.min(x, containerRect.width - elementWidth - 8));
        y = Math.max(8, Math.min(y, containerRect.height - elementHeight - 8));

        setPosition({ x, y });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        const element = e.currentTarget as HTMLElement;
        try {
            element.releasePointerCapture(e.pointerId);
        } catch {
            // ignore if pointer lost
        }
        setIsDragging(false);
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 bg-gray-950 relative overflow-hidden flex items-center justify-center select-none w-full h-full min-h-[300px]"
        >
            {/* Status Overlay */}
            <div className="absolute top-2.5 sm:top-6 left-2.5 sm:left-6 z-30 flex items-center gap-1.5 sm:gap-3 bg-black/40 backdrop-blur-md px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-white/10 shadow-lg max-w-[125px] xs:max-w-[150px] sm:max-w-none">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                <span className="text-white/90 text-[11px] sm:text-sm font-semibold tracking-wide truncate">{status}</span>
            </div>

            {/* Mode Switcher */}
            <div className="absolute top-2.5 sm:top-6 left-1/2 transform -translate-x-1/2 z-30 bg-black/40 backdrop-blur-md rounded-full p-0.5 sm:p-1 border border-white/10 flex gap-0.5 sm:gap-1 shadow-xl shrink-0">
                <button
                    onClick={() => setMode('video')}
                    title="Video Call"
                    className={`p-1.5 sm:p-3 rounded-full transition-all duration-300 ${mode === 'video' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                    <Video className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
                <button
                    onClick={() => setMode('audio')}
                    title="Voice Call"
                    className={`p-1.5 sm:p-3 rounded-full transition-all duration-300 ${mode === 'audio' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                    <Mic className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
                <button
                    onClick={() => setMode('text')}
                    title="Text Only"
                    className={`p-1.5 sm:p-3 rounded-full transition-all duration-300 ${mode === 'text' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                    <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="absolute inset-0 w-full h-full z-0">
                {isSearching ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white/80 p-3 sm:p-6 text-center pt-12 pb-16 sm:pt-24 sm:pb-28 overflow-y-auto">
                        <div className="relative w-14 h-14 sm:w-24 sm:h-24 mb-3 sm:mb-6 flex items-center justify-center shrink-0">
                            <span className="absolute inset-0 border-4 border-white/10 rounded-full animate-ping"></span>
                            <div className="w-10 h-10 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold text-white tracking-wide mb-1 sm:mb-2">Finding Partner...</h3>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-sm mb-3 sm:mb-6">Looking for an active user online...</p>
                        {onConnectBot && (
                            <button
                                onClick={onConnectBot}
                                className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
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
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden p-4">
                                {/* Animated Background for Audio Mode */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-50"></div>
                                <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 sm:mb-6 shadow-2xl ring-4 ring-white/10 animate-float">
                                        <User className="w-12 h-12 sm:w-20 sm:h-20 text-white drop-shadow-lg" />
                                    </div>
                                    <h3 className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2 text-center">{partnerName}</h3>
                                    <p className="text-white/50 text-xs sm:text-lg flex items-center gap-1.5 sm:gap-2">
                                        {mode === 'audio' ? <Mic className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
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
                <div className="absolute top-2.5 sm:top-6 right-2.5 sm:right-6 z-20 max-w-[125px] xs:max-w-[150px] sm:max-w-none">
                    <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 sm:px-4 sm:py-2.5 rounded-2xl text-[11px] sm:text-sm font-extrabold border border-white/20 shadow-xl flex items-center gap-1 sm:gap-2.5 truncate">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
                        <span className="truncate">Partner: <span className="text-blue-300 font-black">{partnerName}</span></span>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse shrink-0"></div>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-2.5 sm:bottom-8 left-0 w-full flex justify-center items-center z-30 pointer-events-none px-2">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-1.5 sm:p-2 rounded-2xl shadow-2xl flex gap-2 sm:gap-4 pointer-events-auto transform hover:scale-105 transition-all duration-300 max-w-full overflow-x-auto">
                    <button
                        onClick={toggleMute}
                        className={`p-2 sm:p-4 rounded-xl transition-all duration-200 ${
                            isMuted
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                                : 'bg-white/20 text-white hover:bg-white/40'
                        }`}
                    >
                        {isMuted ? <MicOff className="w-4 h-4 sm:w-6 sm:h-6" /> : <MicOn className="w-4 h-4 sm:w-6 sm:h-6" />}
                    </button>

                    <button
                        onClick={onLeave}
                        className="px-3.5 py-2 sm:px-8 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-base font-bold shadow-lg shadow-red-600/40 transition-all active:scale-95 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
                    >
                        <PhoneOff className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        End Call
                    </button>
                </div>
            </div>

            {/* Local Preview (Draggable) */}
            {mode === 'video' && (
                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className={`absolute w-24 xs:w-32 md:w-52 aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 z-40 cursor-move touch-none select-none transition-shadow ${
                        isDragging ? 'shadow-blue-500/50 scale-105 ring-2 ring-blue-400' : 'hover:scale-105'
                    }`}
                    style={
                        hasMoved
                            ? { left: position.x, top: position.y }
                            : { bottom: '4.5rem', right: '0.75rem' }
                    }
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
                                <span className="text-white/50 text-[10px] sm:text-xs font-semibold">Camera Off</span>
                            </div>
                        )}
                        <div className="absolute bottom-1 left-1 right-1 sm:bottom-2 sm:left-2 sm:right-2 bg-black/70 backdrop-blur-md text-white text-[9px] sm:text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-bold border border-white/10 flex items-center justify-between">
                            <span className="truncate">{myName || 'You'}</span>
                            <span className="text-[8px] sm:text-[10px] text-blue-400 uppercase tracking-wider font-extrabold shrink-0">(You)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
