import React from 'react';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    <Link href="/" prefetch={false} className="flex items-center gap-3 group cursor-pointer">
                        <img 
                            src="/logo.png" 
                            alt="Zivvo Chat Logo" 
                            className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl object-contain shadow-sm transition-transform duration-300 group-hover:scale-105" 
                        />
                        <span className="text-xl lg:text-2xl font-black text-black tracking-tight group-hover:text-blue-600 transition-colors">Zivvo Chat</span>
                    </Link>

                    <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-gray-700">
                        <Link href="/about" prefetch={false} className="hover:text-blue-600 transition-colors">About</Link>
                        <Link href="/contact" prefetch={false} className="hover:text-blue-600 transition-colors">Contact</Link>
                        <Link href="/privacy" prefetch={false} className="hidden sm:inline hover:text-blue-600 transition-colors">Privacy</Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}