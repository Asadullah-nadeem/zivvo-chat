"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            setIsLoading(true);
            localStorage.setItem('chatUsername', username.trim());

            await new Promise(resolve => setTimeout(resolve, 800));
            router.push('/video-chat');
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 transform transition-all hover:scale-[1.01]">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                <p className="text-gray-400 text-sm">Join the video chat instantly</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-300 ml-1">
                        Display Name
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input
                            id="username"
                            type="text"
                            required
                            className="block w-full pl-11 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                            placeholder="e.g. Alex Doe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!username.trim() || isLoading}
                    className="w-full py-4 px-6 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Entering Room...
                        </span>
                    ) : (
                        "Start Chatting"
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-xs text-gray-500">
                By entering, you allow camera & mic access.
            </p>
        </div>
    );
}