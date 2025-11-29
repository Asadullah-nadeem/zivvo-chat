import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoginForm from './components/login/LoginForm';
import TerminalAnimation from './components/ui/TerminalAnimation';
import { Github, Twitter, Linkedin, Server, LifeBuoy } from 'lucide-react';

export default function Home() {
    return (
        // Fix: h-screen hata ke min-h-screen kiya taaki mobile pe scroll ho sake
        <div className="min-h-screen w-full bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
            <Header />

            {/* Notebook Grid Pattern Background - Fixed to cover full height */}
            <div className="fixed inset-0 z-0 opacity-[0.4] pointer-events-none"
                 style={{
                     backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                     backgroundSize: '30px 30px'
                 }}>
            </div>

            {/* Background Gradients */}
            <div className="fixed top-0 right-0 -z-10 w-[50%] h-[60%] bg-gradient-to-b from-blue-50 to-transparent blur-3xl opacity-80" />
            <div className="fixed bottom-0 left-0 -z-10 w-[40%] h-[40%] bg-gradient-to-t from-blue-50 to-transparent blur-3xl opacity-80" />

            {/* Fix: pt-24 added taaki header content ko cover na kare */}
            <main className="flex-1 flex flex-col relative z-10 w-full pt-24 lg:pt-0">
                
                {/* Hero Section */}
                <div className="w-full flex items-center justify-center min-h-[calc(100vh-80px)] lg:min-h-screen pb-12 lg:pb-0">
                    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Grid layout adjust kiya */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                            <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left order-1 lg:order-1">
                                <div className="inline-flex items-center px-4 py-2 bg-white border border-blue-100 rounded-full text-blue-700 text-xs sm:text-sm font-bold shadow-sm animate-fade-in-up mx-auto lg:mx-0">
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
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
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8 text-center lg:text-left">
                                <h2 className="text-4xl md:text-5xl font-black text-black leading-tight">
                                    Building the <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                        Future of Chat
                                    </span>
                                </h2>
                                <p className="text-xl text-gray-600 leading-relaxed">
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
                        </div>
                    </div>
                </section>

                {/* Founder Section */}
                <section className="w-full py-20 bg-white/50 backdrop-blur-sm border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                            <Github size={20} />
                                        </a>
                                        <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100">
                                            <Twitter size={20} />
                                        </a>
                                        <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100">
                                            <Linkedin size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* API & Support Section */}
                <section className="w-full py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-8">
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
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}