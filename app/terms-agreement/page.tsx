"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { loginUser } from '../../lib/api';

export default function TermsAgreementPage() {
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleProceed = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            setErrorMessage('You must confirm you are 18+ and agree to the Terms & Privacy Policy to continue.');
            return;
        }

        setErrorMessage(null);
        setIsLoading(true);

        const nameToUse = username.trim() || 'Guest User';
        const result = await loginUser(nameToUse);

        if (result.success && result.token) {
            localStorage.setItem('chatToken', result.token);
            localStorage.setItem('chatUsername', nameToUse);
            const cryptoToken = Array.from(window.crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
            router.push(`/video-chat/${cryptoToken}`);
        } else {
            setErrorMessage(result.error || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
            <Header />

            {/* Background Grid Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Background Gradients */}
            <div className="fixed top-0 right-0 -z-10 w-[50%] h-[60%] bg-gradient-to-b from-blue-50 to-transparent blur-3xl opacity-80" />
            <div className="fixed bottom-0 left-0 -z-10 w-[40%] h-[40%] bg-gradient-to-t from-blue-50 to-transparent blur-3xl opacity-80" />

            <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full pt-28 pb-16 px-4 max-w-4xl mx-auto">
                <div className="w-full bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-6 sm:p-12">

                    <div className="mb-8 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Home
                        </Link>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-wider">
                            Step 2: Terms & Name Entry
                        </span>
                    </div>

                    <div className="text-left mb-8">
                        <h1 className="text-3xl sm:text-4xl font-black text-black mb-3 tracking-tight">
                            Terms of Service & Privacy Acceptance
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg font-medium">
                            Please check the box below to accept our community terms, enter your display name, and start chatting.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleProceed} className="space-y-8">
                        {/* 1. Agreement Checkbox Prompt */}
                        <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/50 border-2 border-blue-100 hover:border-blue-200 transition-colors">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => {
                                        setAgreedToTerms(e.target.checked);
                                        if (errorMessage) setErrorMessage(null);
                                    }}
                                    className="mt-1 h-6 w-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                />
                                <span className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                                    I confirm I am 18+ and agree to the <span className="text-blue-600">Terms of Service</span> and <span className="text-blue-600">Privacy Policy</span>.
                                </span>
                            </label>
                        </div>

                        {/* 2. Revealed Terms Conditions list when checked */}
                        {agreedToTerms && (
                            <div className="animate-fade-in space-y-6">
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4 text-sm text-gray-700">
                                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2">
                                        Summary of Platform Guidelines
                                    </h3>

                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-1">
                                            <div className="text-xl">🔒</div>
                                            <p className="font-bold text-gray-900">Private & Anonymous</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">Direct WebRTC connection. No audio or video recordings stored on servers.</p>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-1">
                                            <div className="text-xl">🔞</div>
                                            <p className="font-bold text-gray-900">18+ Age Limit</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">You must be at least 18 years old or legal majority in your country.</p>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-1">
                                            <div className="text-xl">⚖️</div>
                                            <p className="font-bold text-gray-900">Legal Terms</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                Review complete{' '}
                                                <Link href="/terms" target="_blank" className="text-blue-600 font-bold underline">Terms</Link>
                                                {' '}and{' '}
                                                <Link href="/privacy" target="_blank" className="text-blue-600 font-bold underline">Privacy</Link>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Revealed Name Input */}
                                <div className="space-y-2 pt-2">
                                    <label htmlFor="username" className="block text-sm font-bold text-gray-900 ml-1">
                                        Full Name / Display Name
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        autoFocus
                                        className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-black font-bold placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-0 transition-all duration-200"
                                        placeholder="Enter your full name..."
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (errorMessage) setErrorMessage(null);
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit / Proceed Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !agreedToTerms}
                            style={{
                                backgroundColor: agreedToTerms ? '#2563eb' : '#cbd5e1',
                                color: '#ffffff',
                                cursor: agreedToTerms ? 'pointer' : 'not-allowed'
                            }}
                            className="group w-full py-5 px-8 rounded-2xl font-bold text-xl hover:opacity-95 active:scale-[0.99] transition-all duration-200 shadow-lg flex items-center justify-center gap-3 border-none outline-none"
                        >
                            {isLoading ? (
                                "Connecting..."
                            ) : (
                                <>
                                    Start Private Chat
                                    <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                </div>
            </main>

            <Footer />
        </div>
    );
}
