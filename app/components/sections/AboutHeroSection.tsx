import React from 'react';
import TerminalAnimation from '../ui/TerminalAnimation';

interface AboutHeroSectionProps {
    isPageTitle?: boolean;
}

export default function AboutHeroSection({ isPageTitle = false }: AboutHeroSectionProps) {
    const TitleTag = isPageTitle ? 'h1' : 'h2';
    const titleClasses = isPageTitle 
        ? "text-5xl md:text-7xl font-black leading-tight text-black"
        : "text-4xl md:text-5xl font-black text-black leading-tight";

    return (
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
                <TitleTag className={titleClasses}>
                    Building the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Future of Chat
                    </span>
                </TitleTag>
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
        </div>
    );
}
