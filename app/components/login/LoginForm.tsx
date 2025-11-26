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
        // Added 'hover:shadow-2xl' and smooth transition
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-10 w-full max-w-md mx-auto transform transition-all duration-300 hover:-translate-y-1">
            <div className="text-left mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-5 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Get Started</h2>
                <p className="text-gray-500 font-medium">Enter your display name to join.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-bold text-gray-700 ml-1">
                        Display Name
                    </label>
                    <input
                        id="username"
                        type="text"
                        required
                        className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200"
                        placeholder="e.g. Alex"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!username.trim() || isLoading}
                    // Added 'group' class for arrow animation on hover
                    className="group w-full py-4 px-6 rounded-2xl text-white font-bold text-lg bg-gray-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        "Connecting..."
                    ) : (
                        <>
                            Join Now
                            {/* Arrow slides right on hover */}
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}