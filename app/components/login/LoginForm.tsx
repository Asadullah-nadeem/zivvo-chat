"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginForm() {
    const router = useRouter();

    const handleClick = () => {
        router.push('/terms-agreement');
    };

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center space-y-6">
            
            {/* Video Call & Live Chat Preview Image */}
            <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100 bg-[#0f172a] transform hover:scale-[1.01] transition-all duration-300">
                <Image 
                    src="/hero-preview.png" 
                    alt="ZivvoChat Video Call & Live Chat Preview" 
                    width={1920}
                    height={1080}
                    priority
                    className="w-full h-auto object-cover object-center block"
                />
            </div>

            {/* Action Button */}
            <div className="w-full">
                <button
                    type="button"
                    onClick={handleClick}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                    className="group w-full py-4 sm:py-5 px-6 sm:px-8 rounded-2xl font-bold text-lg sm:text-xl hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 cursor-pointer border-none outline-none transform active:scale-[0.98]"
                >
                    Start Private Chat
                    <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>

        </div>
    );
}