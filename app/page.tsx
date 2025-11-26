import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoginForm from './components/login/LoginForm';

export default function Home() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100">
            <Header />

            <main className="flex-1 flex items-center justify-center relative">
                {/* Background Decor (Optional Subtle Blob) */}
                <div className="absolute top-0 right-0 -z-10 w-[50%] h-[50%] bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl opacity-60" />

                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(100vh-80px)]">

                        {/* LEFT SIDE: Hero Section (Span 7 cols) */}
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left pt-10 lg:pt-0">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-bold shadow-sm">
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                                Live Now: Fast Connections
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                                Connect with <br className="hidden lg:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Strangers</span> Instantly.
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                                Experience high-quality video chats with random people worldwide.
                                Secure, anonymous, and powered by next-gen WebRTC technology.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                                <div className="flex items-center gap-2 text-gray-700 font-semibold bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    No Registration
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 font-semibold bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    HD Video
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE: Login Form (Span 5 cols) */}
                        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end pb-10 lg:pb-0">
                            <LoginForm />
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}