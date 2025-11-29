"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, LifeBuoy, Heart, Github, Twitter, Linkedin } from 'lucide-react';
import TerminalAnimation from '../components/ui/TerminalAnimation';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center md:justify-between">
                    <Link href="/" className="absolute left-6 md:static flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="hidden md:inline font-medium">Back to Home</span>
                    </Link>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        ZivvoChat
                    </div>
                    <div className="hidden md:block w-24"></div> {/* Spacer for centering */}
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto space-y-32">
                    
                    {/* Hero Section with Terminal */}
                    <section className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-center lg:text-left">
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                                Building the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                    Future of Chat
                                </span>
                            </h1>
                            <p className="text-xl text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                ZivvoChat is an open-source video communication platform designed for seamless, high-quality interactions. 
                                Powered by WebRTC and modern web technologies.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <button className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                                    Get Started
                                </button>
                                <button className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors border border-white/10">
                                    View Source
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                            <TerminalAnimation />
                        </div>
                    </section>

                    {/* Founder Section */}
                    <section className="relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl -z-10"></div>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Meet the Founder</h2>
                            <p className="text-white/60 max-w-2xl mx-auto">
                                The mind behind the code. Passionate about connecting people through technology.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto backdrop-blur-sm hover:border-white/20 transition-colors">
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="relative group">
                                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden border-4 border-white/10 shadow-2xl relative z-10">
                                        {/* Placeholder for Founder Image - Using a generic avatar or gradient for now */}
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold">
                                            AN
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                                </div>
                                
                                <div className="flex-1 text-center md:text-left space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-bold">Asadullah Nadeem</h3>
                                        <p className="text-blue-400 font-medium mt-1">Full Stack Developer & UI/UX Enthusiast</p>
                                    </div>
                                    <p className="text-white/70 leading-relaxed">
                                        &quot;I started ZivvoChat with a simple mission: to make video calling accessible, private, and beautiful. 
                                        What began as a weekend project has grown into a robust platform used by developers and users alike. 
                                        I believe in the power of open source and community-driven development.&quot;
                                    </p>
                                    <div className="flex justify-center md:justify-start gap-4">
                                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-blue-400 transition-colors">
                                            <Github size={20} />
                                        </a>
                                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-blue-400 transition-colors">
                                            <Twitter size={20} />
                                        </a>
                                        <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-blue-400 transition-colors">
                                            <Linkedin size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* API & Support Section */}
                    <section className="grid md:grid-cols-2 gap-8">
                        {/* API Access */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all group">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                <Server size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">API Access</h3>
                            <p className="text-white/60 mb-8">
                                Integrate ZivvoChat&apos;s powerful video and messaging capabilities directly into your applications. 
                                Our REST API and WebSocket events provide full control.
                            </p>
                            <div className="bg-black rounded-xl p-4 font-mono text-sm text-gray-400 mb-6 border border-white/5">
                                <div className="flex justify-between mb-2 text-xs uppercase tracking-wider text-gray-600">
                                    <span>Bash</span>
                                </div>
                                <code className="block">
                                    <span className="text-purple-400">curl</span> -X POST https://api.zivvochat.com/v1/rooms \<br/>
                                    &nbsp;&nbsp;-H <span className="text-green-400">&quot;Authorization: Bearer YOUR_KEY&quot;</span>
                                </code>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-blue-600/20 text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-all">
                                Read Documentation
                            </button>
                        </div>

                        {/* Support */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all group">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                <LifeBuoy size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Support & Community</h3>
                            <p className="text-white/60 mb-8">
                                Need help? Our support team and community are here for you. 
                                Join our Discord or check out the documentation for guides and tutorials.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-white/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    24/7 Developer Support
                                </li>
                                <li className="flex items-center gap-3 text-white/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Active Discord Community
                                </li>
                                <li className="flex items-center gap-3 text-white/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Comprehensive Guides
                                </li>
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-purple-600/20 text-purple-400 font-bold hover:bg-purple-600 hover:text-white transition-all">
                                Contact Support
                            </button>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-white/10 pt-12 pb-8 text-center">
                        <p className="text-white/40 flex items-center justify-center gap-2">
                            Made with <Heart size={16} className="text-red-500 fill-red-500" /> by Asadullah Nadeem
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
