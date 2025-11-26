import React, { useEffect, useRef, useState } from 'react';

interface Props {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    partnerName: string;
    myName: string;
    isSearching: boolean;
    status: string;
    onLeave: () => void;
}

export default function VideoArea({
                                      localStream,
                                      remoteStream,
                                      partnerName,
                                      myName,
                                      isSearching,
                                      status,
                                      onLeave
                                  }: Props) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isMuted, setIsMuted] = useState(false);

    // Dragging State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [hasMoved, setHasMoved] = useState(false); // To switch from CSS positioning to JS positioning
    const dragOffset = useRef({ x: 0, y: 0 });

    // Toggle Mute Logic
    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    // Attach Streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        } else if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    }, [remoteStream]);

    // --- DRAG LOGIC ---
    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setHasMoved(true);

        // Current element position (or default if not moved yet)
        const element = e.currentTarget as HTMLElement;
        const rect = element.getBoundingClientRect();
        const parentRect = containerRef.current?.getBoundingClientRect();

        // If hasn't moved, calculate initial position relative to parent
        let currentX = rect.left;
        let currentY = rect.top;

        if (parentRect) {
            // Offset mouse click relative to the element's top-left corner
            dragOffset.current = {
                x: e.clientX - currentX,
                y: e.clientY - currentY
            };

            // Set initial position state if it's the first drag
            if (!hasMoved) {
                setPosition({
                    x: currentX - parentRect.left,
                    y: currentY - parentRect.top
                });
            }
        }
    };

    // Global listeners for smooth dragging even if mouse leaves element
    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging || !containerRef.current) return;

            const parentRect = containerRef.current.getBoundingClientRect();

            // Calculate new position relative to parent container
            let newX = e.clientX - parentRect.left - dragOffset.current.x;
            let newY = e.clientY - parentRect.top - dragOffset.current.y;

            // Boundary checks (Keep inside screen)
            const maxX = parentRect.width - 192; // 192 is roughly width of local video (w-48)
            const maxY = parentRect.height - 256; // 256 is roughly height (aspect ratio)

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            setPosition({ x: newX, y: newY });
        };

        const handlePointerUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);


    return (
        // Full Screen Container (Removed padding, added ref)
        <div ref={containerRef} className="flex-1 bg-gray-900 relative overflow-hidden flex flex-col group">

            {/* Status Pill (Floating Top Left) */}
            <div className="absolute top-6 left-6 z-30 pointer-events-none">
                <div className={`px-4 py-2 rounded-full text-xs font-bold border shadow-lg flex items-center gap-2 backdrop-blur-md transition-all ${
                    isSearching
                        ? 'bg-black/40 text-yellow-400 border-yellow-500/30'
                        : 'bg-white/90 text-green-600 border-white'
                }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${isSearching ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                    {status}
                </div>
            </div>

            {/* Main Remote Video (Full Cover) */}
            <div className="absolute inset-0 w-full h-full z-0">
                {isSearching ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white/80">
                        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                            <span className="absolute inset-0 border-4 border-white/10 rounded-full animate-ping"></span>
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-wide">Finding Partner...</h3>
                    </div>
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Partner Name Label (Overlay) */}
            {!isSearching && (
                <div className="absolute top-6 right-6 z-20">
                    <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                        {partnerName}
                    </div>
                </div>
            )}

            {/* Floating Controls (Bottom Center) */}
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
                        {isMuted ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        )}
                    </button>

                    <button
                        onClick={onLeave}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/40 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        End Call
                    </button>
                </div>
            </div>

            {/* ✅ DRAGGABLE LOCAL VIDEO (You)
                - If hasMoved is false: uses CSS positioning (bottom-right default).
                - If hasMoved is true: uses JS inline styles (top/left) for dragging.
            */}
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
        </div>
    );
}