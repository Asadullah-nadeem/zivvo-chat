import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoginForm from './components/login/LoginForm';
import AboutHeroSection from './components/sections/AboutHeroSection';
import FounderSection from './components/sections/FounderSection';
import ApiSupportSection from './components/sections/ApiSupportSection';

export default function Home() {
    return (
        // Fix: h-screen hata ke min-h-screen kiya taaki mobile pe scroll ho sake
        <div className="min-h-screen w-full bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
            <Header />

            {/* Notebook Grid Pattern Background - Fixed to cover full height */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                 style={{
                     backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
                     backgroundSize: '40px 40px'
                 }}>
            </div>

            {/* Background Gradients */}
            <div className="fixed top-0 right-0 -z-10 w-[50%] h-[60%] bg-linear-to-b from-blue-50 to-transparent blur-3xl opacity-80" />
            <div className="fixed bottom-0 left-0 -z-10 w-[40%] h-[40%] bg-linear-to-t from-blue-50 to-transparent blur-3xl opacity-80" />

            {/* Fix: pt-24 added taaki header content ko cover na kare */}
            <main className="flex-1 flex flex-col relative z-10 w-full pt-24 lg:pt-0">
                
                {/* Hero Section */}
                <div className="w-full flex items-center justify-center min-h-[calc(100vh-80px)] lg:min-h-screen pb-12 lg:pb-0">
                    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Grid layout adjust kiya */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                            <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left order-1 lg:order-1">
                                <div className="inline-flex items-center px-4 py-2 bg-white border border-blue-100 rounded-full text-blue-700 text-xs sm:text-sm font-bold shadow-sm animate-fade-in-up mx-auto lg:mx-0">
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                                    Live Now: Fast Connections
                                </div>

                                {/* Font size responsive banaya: text-4xl mobile pe, text-7xl desktop pe */}
                                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-black tracking-tight leading-[1.1]">
                                    Connect with <br className="hidden lg:block" />
                                    <span className="relative whitespace-nowrap text-blue-600 inline-block">
                                        <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-100/50" preserveAspectRatio="none">
                                            <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C46.169 14.6 21.419 5.43 7.398 16.66c-8.655 6.932-23.644 23.236-1.88 24.76 21.764 1.524 64.67-8.32 101.408-10.74 36.738-2.42 75.87-4.11 110.156-4.11 34.286 0 92.446 3.19 123.606 5.8 31.16 2.61 57.062 1.48 57.062 1.48 48.68-1.74 85.9-10.4 69.3-24.84-16.6-14.44-80.12-14.68-80.12-14.68-45.72 1.25-93.58 6.54-135.02 12.3l-5.63 2.1c-43.27 10.32-111.96 11.23-142.15 6.34-30.19-4.89-63.5-22.34-63.5-22.34z"></path>
                                        </svg>
                                        <span className="relative">Strangers</span>
                                    </span>
                                    <span className="block lg:inline"> Instantly.</span>
                                </h1>

                                <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium border-l-4 border-blue-600 pl-4 lg:pl-6 text-left lg:text-left">
                                    Experience high-quality video chats with random people worldwide.
                                    Secure, anonymous, and powered by next-gen WebRTC.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-4 w-full sm:w-auto">
                                    <div className="flex items-center justify-center gap-2 text-gray-700 font-bold bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        No Registration
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-gray-700 font-bold bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        HD Video
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 w-full flex justify-center lg:justify-end order-2 lg:order-2 pb-8 lg:pb-0">
                                <LoginForm />
                            </div>

                        </div>
                    </div>
                </div>

                {/* About Section with Terminal */}
                <section id="about" className="w-full py-20 lg:py-32 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AboutHeroSection />
                    </div>
                </section>

                {/* Founder Section */}
                <section className="w-full py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <FounderSection />
                    </div>
                </section>

                {/* API & Support Section */}
                <section className="w-full py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ApiSupportSection />
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}