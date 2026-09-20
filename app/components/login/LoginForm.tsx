"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../../../lib/api';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (username.trim()) {
            setIsLoading(true);
            const result = await loginUser(username.trim());

            if (result.success && result.token) {
                localStorage.setItem('chatToken', result.token);
                localStorage.setItem('chatUsername', username.trim());
                router.push('/video-chat');
            } else {
                setErrorMessage(result.error || 'Login failed. Please try again.');
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto bg-white border-2 border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
            <div className="text-left mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-5 border border-blue-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-black mb-2 tracking-tight">Get Started</h2>
                <p className="text-gray-500 font-medium">Write your name to begin.</p>
            </div>

            {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-bold text-gray-900 ml-1">
                        Display Name
                    </label>
                    <input
                        id="username"
                        type="text"
                        required
                        className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-black font-bold placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-0 transition-all duration-200"
                        placeholder="Full Name"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!username.trim() || isLoading}
                    className="group w-full py-4 px-6 rounded-xl text-white font-bold text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-2 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                >
                    {isLoading ? (
                        "Connecting..."
                    ) : (
                        <>
                            Join Now
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