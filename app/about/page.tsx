"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AboutHeroSection from '../components/sections/AboutHeroSection';
import ApiSupportSection from '../components/sections/ApiSupportSection';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-blue-100 selection:text-blue-900 font-sans relative overflow-x-hidden">
            
            {/* Notebook Grid Pattern Background */}
            <div className="fixed inset-0 z-0 opacity-[0.4] pointer-events-none"
                 style={{
                     backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                     backgroundSize: '30px 30px'
                 }}>
            </div>

            {/* Background Gradients */}
            <div className="fixed top-0 right-0 -z-10 w-[50%] h-[60%] bg-gradient-to-b from-blue-50 to-transparent blur-3xl opacity-80" />
            <div className="fixed bottom-0 left-0 -z-10 w-[40%] h-[40%] bg-gradient-to-t from-blue-50 to-transparent blur-3xl opacity-80" />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium">
                        <ArrowLeft size={20} />
                        <span>Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Zivvo Chat Logo" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-xl font-black text-black tracking-tight">Zivvo Chat</span>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-20">
                    
                    {/* Hero Section with Terminal */}
                    <section>
                        <AboutHeroSection isPageTitle />
                    </section>

                    {/* API & Support Section */}
                    <ApiSupportSection />

                    {/* Footer */}
                    <footer className="border-t border-gray-200 pt-8 pb-4 text-center">
                        <p className="text-gray-500 font-medium text-sm">
                            © {new Date().getFullYear()} Zivvo Chat. All rights reserved.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}

