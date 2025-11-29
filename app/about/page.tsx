"use client";

import React from 'react';
import { Heart } from 'lucide-react';
import Header from '../components/layout/Header';
import AboutHeroSection from '../components/sections/AboutHeroSection';
import FounderSection from '../components/sections/FounderSection';
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
            <div className="fixed top-0 right-0 -z-10 w-[50%] h-[60%] bg-linear-to-b from-blue-50 to-transparent blur-3xl opacity-80" />
            <div className="fixed bottom-0 left-0 -z-10 w-[40%] h-[40%] bg-linear-to-t from-blue-50 to-transparent blur-3xl opacity-80" />

            {/* Navigation */}
            <Header showBackLink />

            <main className="pt-24 pb-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-32">
                    
                    {/* Hero Section with Terminal */}
                    <section>
                        <AboutHeroSection isPageTitle />
                    </section>

                    {/* Founder Section */}
                    <FounderSection />

                    {/* API & Support Section */}
                    <ApiSupportSection />

                    {/* Footer */}
                    <footer className="border-t border-gray-200 pt-12 pb-8 text-center">
                        <p className="text-gray-500 flex items-center justify-center gap-2 font-medium">
                            Made with <Heart size={16} className="text-red-500 fill-red-500" /> by Asadullah Nadeem
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}

