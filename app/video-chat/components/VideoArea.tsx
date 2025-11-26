import React, { useEffect, useRef } from 'react';

interface Props {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    partnerName: string;
    myName: string;
    isSearching: boolean;
    status: string;
}

export default function VideoArea({
                                      localStream,
                                      remoteStream,
                                      partnerName,
                                      myName,
                                      isSearching,
                                      status
                                  }: Props) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // ✅ FORCE ATTACH LOCAL STREAM
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // ✅ FORCE ATTACH REMOTE STREAM
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        } else if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    }, [remoteStream]);

    return (
        <div className="flex-1 bg-gray-950 relative overflow-hidden flex flex-col">
            {/* Status Bar */}
            <div className="absolute top-6 left-6 z-10 flex gap-3">
                <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium border border-white/10 flex items-center gap-2 shadow-lg">
                    <span className={`w-2.5 h-2.5 rounded-full ${isSearching ? 'bg-yellow-400 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
                    {status}
                </div>
            </div>

            {/* Main Remote Video Area */}
            <div className="flex-1 relative flex items-center justify-center bg-gray-900">
                {isSearching ? (
                    <div className="text-center z-0 animate-fade-in">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                            <div className="relative w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-white text-2xl font-semibold tracking-wide mb-2">Finding Partner...</h3>
                        <p className="text-gray-400">Connecting to someone nearby</p>
                    </div>
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover animate-fade-in"
                    />
                )}

                {!isSearching && (
                    <div className="absolute bottom-6 left-6 z-10">
                        <div className="bg-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-lg font-bold border border-white/10 shadow-xl flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                            {partnerName}
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ FIXED LOCAL VIDEO (You) */}
            <div className="absolute bottom-6 right-6 w-48 aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 ring-1 ring-black/50 transition-all hover:scale-105 z-20">
                {localStream ? (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <span className="text-white/50 text-xs">Loading Camera...</span>
                    </div>
                )}

                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                    {myName} (You)
                </div>
            </div>
        </div>
    );
}