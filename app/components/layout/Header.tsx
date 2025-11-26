import React from 'react';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-100 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                            Z
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">Zivvo Chat</span>
                    </div>
                </div>
            </div>
        </header>
    );
}