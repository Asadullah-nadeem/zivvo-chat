import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-blue-100 selection:text-blue-900 font-sans relative overflow-x-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.35] pointer-events-none"
                 style={{
                     backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                     backgroundSize: '32px 32px'
                 }}>
            </div>

            {/* Navigation Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium">
                        <ArrowLeft size={18} />
                        <span>Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-black">
                            Z
                        </div>
                        <span className="text-xl font-black text-black tracking-tight">Zivvo Chat</span>
                    </div>
                    <Link href="/privacy" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                        Privacy Policy
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 pb-20 px-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
                            <Scale size={14} /> Legal Terms & Guidelines
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                            Terms of Service
                        </h1>
                        <p className="text-gray-500 font-medium text-sm">
                            Last Updated: September 2026 • Please read carefully before using the service.
                        </p>
                    </div>

                    {/* Community Rules Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 text-amber-900">
                        <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
                        <div className="space-y-1">
                            <h3 className="font-bold text-base">Strict Age & Conduct Enforcement</h3>
                            <p className="text-sm leading-relaxed text-amber-800">
                                You must be at least 18 years of age (or age of majority in your jurisdiction) to use Zivvo Chat. Harassment, nudity, hate speech, and illegal activities are strictly prohibited.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Terms */}
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 sm:p-12 shadow-xs space-y-8 text-gray-700 leading-relaxed">
                        
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                                <CheckCircle2 className="text-blue-600" size={22} /> 1. Acceptance of Terms
                            </h2>
                            <p>
                                By accessing or using Zivvo Chat, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use the platform.
                            </p>
                        </section>

                        <section className="space-y-3 pt-6 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-black">2. User Responsibilities & Rules</h2>
                            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                                <li>You agree not to transmit offensive, abusive, threatening, or illegal content.</li>
                                <li>You agree not to broadcast copyrighted material without explicit permission.</li>
                                <li>You agree not to attempt to reverse engineer, disrupt, or exploit the WebRTC signaling network.</li>
                            </ul>
                        </section>

                        <section className="space-y-3 pt-6 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-black">3. Service Availability & Disclaimer</h2>
                            <p>
                                Zivvo Chat is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind. We reserve the right to modify, suspend, or terminate the service at any time without prior notice.
                            </p>
                        </section>

                        <section className="space-y-3 pt-6 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-black">4. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, Zivvo Chat and its developers shall not be liable for any indirect, incidental, or consequential damages resulting from user interactions or platform usage.
                            </p>
                        </section>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 bg-white">
                © {new Date().getFullYear()} Zivvo Chat. All rights reserved.
            </footer>
        </div>
    );
}
