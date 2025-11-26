import React from 'react';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        {/* Logo styling changed to Blue/Black */}
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-black transition-transform duration-300 group-hover:-rotate-6">
                            Z
                        </div>
                        <span className="text-2xl font-black text-black tracking-tight group-hover:text-blue-700 transition-colors">Zivvo Chat</span>
                    </div>
                </div>
            </div>
        </header>
    );
}