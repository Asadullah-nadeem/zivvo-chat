"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, LifeBuoy, Heart, Github, Twitter, Linkedin } from 'lucide-react';
import TerminalAnimation from '../components/ui/TerminalAnimation';

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
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center md:justify-between">
                    <Link href="/" className="absolute left-6 md:static flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                        <ArrowLeft size={20} />
                        <span className="hidden md:inline font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-black">
                            Z
                        </div>
                        <span className="text-xl font-black text-black tracking-tight">Zivvo Chat</span>
                    </div>
                    <div className="hidden md:block w-24"></div> {/* Spacer for centering */}
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-32">
                    
                    {/* Hero Section with Terminal */}
                    <section className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-center lg:text-left">
                            <h1 className="text-5xl md:text-7xl font-black leading-tight text-black">
                                Building the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                    Future of Chat
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                ZivvoChat is an open-source video communication platform designed for seamless, high-quality interactions. 
                                Powered by WebRTC and modern web technologies.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <button className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg">
                                    Get Started
                                </button>
                                <button className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                                    View Source
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                            <TerminalAnimation className="shadow-2xl" />
                        </div>
                    </section>

                    {/* Founder Section */}
                    <section className="relative">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-black mb-6">Meet the Founder</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                                The mind behind the code. Passionate about connecting people through technology.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="relative group">
                                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border-4 border-white shadow-lg relative z-10">
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white">
                                            AN
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                                </div>
                                
                                <div className="flex-1 text-center md:text-left space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-bold text-black">Asadullah Nadeem</h3>
                                        <p className="text-blue-600 font-medium mt-1">Full Stack Developer & UI/UX Enthusiast</p>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-lg italic">
                                        &quot;I started ZivvoChat with a simple mission: to make video calling accessible, private, and beautiful. 
                                        What began as a weekend project has grown into a robust platform used by developers and users alike.&quot;
                                    </p>
                                    <div className="flex justify-center md:justify-start gap-4">
                                        <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100">
                                            <Github size={20} className="text-gray-700" />
                                        </a>
                                        <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100">
                                            <Twitter size={20} className="text-gray-700" />
                                        </a>
                                        <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100">
                                            <Linkedin size={20} className="text-gray-700" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* API & Support Section */}
                    <section className="grid md:grid-cols-2 gap-8">
                        {/* API Access */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-blue-200 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                <Server size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-black">API Access</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Integrate ZivvoChat&apos;s powerful video and messaging capabilities directly into your applications. 
                                Our REST API and WebSocket events provide full control.
                            </p>
                            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-gray-300 mb-6 border border-gray-800 shadow-inner">
                                <div className="flex justify-between mb-2 text-xs uppercase tracking-wider text-gray-500">
                                    <span>Bash</span>
                                </div>
                                <code className="block">
                                    <span className="text-purple-400">curl</span> -X POST https://api.zivvochat.com/v1/rooms \<br/>
                                    &nbsp;&nbsp;-H <span className="text-green-400">&quot;Authorization: Bearer YOUR_KEY&quot;</span>
                                </code>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all">
                                Read Documentation
                            </button>
                        </div>

                        {/* Support */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-purple-200 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                                <LifeBuoy size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-black">Support & Community</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Need help? Our support team and community are here for you. 
                                Join our Discord or check out the documentation for guides and tutorials.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    24/7 Developer Support
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Active Discord Community
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Comprehensive Guides
                                </li>
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-purple-50 text-purple-600 font-bold hover:bg-purple-600 hover:text-white transition-all">
                                Contact Support
                            </button>
                        </div>
                    </section>

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
