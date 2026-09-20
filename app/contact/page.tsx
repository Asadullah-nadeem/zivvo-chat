"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, CheckCircle2, HelpCircle } from 'lucide-react';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('General Feedback');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && email.trim() && message.trim()) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                setIsSubmitted(true);
            }, 800);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black selection:bg-blue-100 selection:text-blue-900 font-sans relative overflow-x-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.35] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}>
            </div>

            {/* Glowing Orbs */}
            <div className="fixed top-1/3 right-10 -z-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />
            <div className="fixed bottom-10 left-10 -z-10 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50" />

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
                    <Link href="/about" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                        About Us
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 pb-20 px-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
                            <MessageSquare size={14} /> Contact & Support
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                            Get in Touch with Us
                        </h1>
                        <p className="text-gray-600 font-medium max-w-xl mx-auto">
                            Have questions, feedback, or need assistance? We&apos;d love to hear from you!
                        </p>
                    </div>

                    {/* Contact Form Card */}
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        {isSubmitted ? (
                            <div className="py-12 text-center space-y-4 animate-fade-in">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h3 className="text-2xl font-bold text-black">Message Sent Successfully!</h3>
                                <p className="text-gray-600 max-w-md mx-auto text-sm">
                                    Thank you for reaching out. Our team has received your message and will respond shortly.
                                </p>
                                <button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setMessage('');
                                    }}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="contact-name" className="block text-sm font-bold text-gray-900">
                                            Your Name
                                        </label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-black font-semibold placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                                            placeholder="Your Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-email" className="block text-sm font-bold text-gray-900">
                                            Email Address
                                        </label>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-black font-semibold placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                                            placeholder="e.g. user@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="contact-category" className="block text-sm font-bold text-gray-900">
                                        Category
                                    </label>
                                    <select
                                        id="contact-category"
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-black font-semibold focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option>General Feedback</option>
                                        <option>Technical Issue / Bug Report</option>
                                        <option>Feature Suggestion</option>
                                        <option>Business & API Inquiries</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="contact-message" className="block text-sm font-bold text-gray-900">
                                        Message
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-black font-semibold placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                                        placeholder="Write your message here..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-2 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                                >
                                    {isLoading ? (
                                        "Sending..."
                                    ) : (
                                        <>
                                            Send Message <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* FAQ Accordion Section */}
                    <div className="space-y-6 pt-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black text-black flex items-center justify-center gap-2">
                                <HelpCircle className="text-blue-600" /> Frequently Asked Questions
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                                <h3 className="font-bold text-base text-black">Is Zivvo Chat completely free?</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Yes! Zivvo Chat is 100% free to use. No registration or credit card required.
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                                <h3 className="font-bold text-base text-black">How does matching work?</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Users are randomly paired using high-performance WebRTC peer-to-peer signaling.
                                </p>
                            </div>
                        </div>
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
