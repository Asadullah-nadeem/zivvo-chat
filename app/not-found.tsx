import React from 'react';
import Link from 'next/link';
import { Home, Video, Info, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-blue-100 selection:text-blue-900 font-sans relative overflow-x-hidden flex flex-col justify-between">
            {/* Grid Pattern Background */}
            <div className="fixed inset-0 z-0 opacity-[0.35] pointer-events-none"
                 style={{
                     backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                     backgroundSize: '32px 32px'
                 }}>
            </div>

            {/* Glowing Orbs */}
            <div className="fixed top-1/4 right-10 -z-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-70 animate-pulse" />
            <div className="fixed bottom-10 left-10 -z-10 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-60" />

            {/* Header Navigation */}
            <header className="w-full z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-black">
                            Z
                        </div>
                        <span className="text-xl font-black text-black tracking-tight">Zivvo Chat</span>
                    </Link>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
                <div className="max-w-2xl w-full text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm shadow-xs">
                        <Search size={16} className="text-blue-600" />
                        Error 404
                    </div>

                    {/* Big 404 Headline */}
                    <h1 className="text-7xl sm:text-9xl font-black text-black tracking-tighter leading-none">
                        4<span className="text-blue-600">0</span>4
                    </h1>

                    <div className="space-y-3 max-w-lg mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-black">Page Not Found</h2>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link 
                            href="/"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                        >
                            <Home size={18} />
                            Go Back Home
                        </Link>
                        <Link 
                            href="/video-chat"
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl border-2 border-gray-200 shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Video size={18} className="text-blue-600" />
                            Start Video Chat
                        </Link>
                    </div>

                    {/* Quick Link Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-200 text-left">
                        <Link href="/" className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 bg-white/70 backdrop-blur-xs shadow-xs hover:shadow-md transition-all group">
                            <h3 className="font-bold text-black group-hover:text-blue-600 transition-colors">Home Page</h3>
                            <p className="text-xs text-gray-500 mt-1">Return to main landing page</p>
                        </Link>
                        <Link href="/about" className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 bg-white/70 backdrop-blur-xs shadow-xs hover:shadow-md transition-all group">
                            <h3 className="font-bold text-black group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                About Us <Info size={14} />
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Learn about Zivvo Chat</p>
                        </Link>
                        <Link href="/contact" className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 bg-white/70 backdrop-blur-xs shadow-xs hover:shadow-md transition-all group">
                            <h3 className="font-bold text-black group-hover:text-blue-600 transition-colors">Support</h3>
                            <p className="text-xs text-gray-500 mt-1">Get help and contact us</p>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-6 text-center text-sm text-gray-500 border-t border-gray-100 relative z-10 bg-white">
                © {new Date().getFullYear()} Zivvo Chat. All rights reserved.
            </footer>
        </div>
    );
}
