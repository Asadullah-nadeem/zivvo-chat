import React, { RefObject } from 'react';

interface Props {
    remoteVideoRef: RefObject<HTMLVideoElement | null>;
    localVideoRef: RefObject<HTMLVideoElement | null>;
    partnerName: string;
    myName: string;
    isSearching: boolean;
    status: string;
}

export default function VideoArea({
                                      remoteVideoRef,
                                      localVideoRef,
                                      partnerName,
                                      myName,
                                      isSearching,
                                      status
                                  }: Props) {
    return (
        <div className="flex-1 bg-gray-950 relative overflow-hidden flex flex-col">
            <div className="absolute top-6 left-6 z-10 flex gap-3">
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium border border-white/10 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSearching ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                    {status}
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center">
                {isSearching ? (
                    <div className="text-center z-0">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-white text-xl font-medium tracking-wide">Searching for a partner...</h3>
                        <p className="text-gray-400 mt-2">Connecting to someone random</p>
                    </div>
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}

                {!isSearching && (
                    <div className="absolute bottom-6 left-6 z-10">
                        <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-lg font-semibold border border-white/10 shadow-lg">
                            {partnerName}
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 right-6 w-48 aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 ring-1 ring-black/20 group">
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-white">
                    {myName} (You)
                </div>
            </div>
        </div>
    );
}