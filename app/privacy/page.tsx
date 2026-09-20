import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, EyeOff, Server, FileText } from 'lucide-react';

export default function PrivacyPage() {
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
                    <Link href="/terms" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                        Terms of Service
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 pb-20 px-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
                            <Shield size={14} /> Privacy & Data Governance
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-500 font-medium text-sm">
                            Last Updated: September 2026 • Your privacy is our top priority.
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <EyeOff size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-black">Anonymous Access</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                No registration or account creation is required to use Zivvo Chat.
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                                <Lock size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-black">P2P Encryption</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                WebRTC video and audio streams are encrypted end-to-end between peers.
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                <Server size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-black">Zero Stream Recording</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We do not store, record, or monitor video and audio streams.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Clauses */}
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 sm:p-12 shadow-xs space-y-8 text-gray-700 leading-relaxed">
                        
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                                <FileText className="text-blue-600" size={22} /> 1. Information We Collect
                            </h2>
                            <p>
                                Zivvo Chat operates on a minimal data collection principle:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                                <li><strong>Display Name:</strong> A temporary nickname you choose during your chat session.</li>
                                <li><strong>Socket Signaling Data:</strong> Temporary WebRTC SDP offers, answers, and ICE candidates required to establish peer-to-peer connections.</li>
                                <li><strong>Optional Geolocation:</strong> If permitted by your browser, coarse geolocation coordinates to pair you with nearby partners.</li>
                            </ul>
                        </section>

                        <section className="space-y-3 pt-6 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-black">2. How We Use Information</h2>
                            <p>
                                Collected signaling data is strictly used to match you with chat partners and facilitate WebRTC connections. We do not sell or share user data with third-party advertisers.
                            </p>
                        </section>

                        <section className="space-y-3 pt-6 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-black">3. Cookies & Local Storage</h2>
                            <p>
                                Zivvo Chat uses browser `localStorage` solely to maintain your temporary display name and authentication session token (`chatToken`). No persistent tracking cookies are placed on your device.
                            </p>
                        </section>

                        <section className="space-y-3 pt-6 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-black">4. Contact & Inquiries</h2>
                            <p>
                                For any privacy-related questions or data requests, please visit our <Link href="/contact" className="text-blue-600 underline font-semibold">Contact Page</Link> or reach out directly to support.
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
