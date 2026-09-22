"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();

    const handleClick = () => {
        router.push('/terms-agreement');
    };

    return (
        <div className="w-full max-w-md mx-auto">
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
    );
}