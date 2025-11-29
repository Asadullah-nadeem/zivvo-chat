import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
    showBackLink?: boolean;
}

export default function Header({ showBackLink = false }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex items-center h-16 lg:h-20 ${showBackLink ? 'justify-center md:justify-between' : 'justify-between'}`}>
                    
                    {showBackLink && (
                        <Link href="/" className="absolute left-4 sm:left-6 md:static flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                            <ArrowLeft size={20} />
                            <span className="hidden md:inline font-medium">Back to Home</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-md border-2 border-black transition-transform duration-300 group-hover:-rotate-6">
                            Z
                        </div>
                        <span className="text-xl lg:text-2xl font-black text-black tracking-tight group-hover:text-blue-700 transition-colors">Zivvo Chat</span>
                    </div>

                    {showBackLink && <div className="hidden md:block w-24"></div>}
                </div>
            </div>
        </header>
    );
}