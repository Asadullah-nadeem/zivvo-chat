"use client";

import React from 'react';
import { Terminal } from 'lucide-react';

interface TerminalAnimationProps {
    commands?: string[];
    className?: string;
}

const defaultCommands = [
    "npm install zivvo-chat",
    "Installing dependencies...",
    "Detected AI Core... [OK]",
    "Establishing Secure Connection... [OK]",
    "ZivvoChat v2.0 Initialized.",
    "Welcome to the future of communication."
];

export default function TerminalAnimation({ commands = defaultCommands, className = "" }: TerminalAnimationProps) {
    return (
        <div className={`bg-[#1e1e2e] rounded-xl overflow-hidden border border-white/10 shadow-2xl font-mono text-sm md:text-base ${className}`}>
            {/* Terminal Header */}
            <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 text-center text-white/30 text-xs flex items-center justify-center gap-1">
                    <Terminal size={12} />
                    <span>zivvo-terminal — -zsh</span>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 text-gray-300 h-64 md:h-80 overflow-y-auto space-y-2 scrollbar-hide font-mono">
                {commands.map((line, i) => (
                    <div key={i} className="break-words flex items-start">
                        <span className="text-gray-500 mr-2 shrink-0">$</span>
                        <span>{line}</span>
                    </div>
                ))}
                <div className="flex items-center gap-2 mt-4">
                    <span className="text-gray-500">$</span>
                    <div className="w-2 h-4 bg-gray-500"></div>
                </div>
            </div>
        </div>
    );
}
