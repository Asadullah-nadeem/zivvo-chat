import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function FounderSection() {
    return (
        <section className="relative">
            <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-black tracking-tight leading-[1.1] mb-6">
                    Meet the <span className="text-blue-600">Founder</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    The mind behind the code. Passionate about connecting people through technology.
                </p>
            </div>

            <div className="bg-transparent p-8 md:p-12 max-w-4xl mx-auto transition-all duration-300">
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
    );
}
