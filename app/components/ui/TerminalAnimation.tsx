"use client";

import React, { useEffect, useState, useRef } from 'react';
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
    const [lines, setLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentLineIndex >= commands.length) return;

        const timeout = setTimeout(() => {
            const currentCommand = commands[currentLineIndex];
            
            if (currentCharIndex < currentCommand.length) {
                // Typing effect
                setLines(prev => {
                    const newLines = [...prev];
                    if (newLines[currentLineIndex] === undefined) {
                        newLines[currentLineIndex] = "";
                    }
                    newLines[currentLineIndex] = currentCommand.substring(0, currentCharIndex + 1);
                    return newLines;
                });
                setCurrentCharIndex(prev => prev + 1);
            } else {
                // Line finished, move to next
                setCurrentLineIndex(prev => prev + 1);
                setCurrentCharIndex(0);
            }
        }, 30 + Math.random() * 50); // Random typing speed

        return () => clearTimeout(timeout);
    }, [currentLineIndex, currentCharIndex, commands]);

    // Auto scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className={`bg-black/90 rounded-xl overflow-hidden border border-white/10 shadow-2xl font-mono text-sm md:text-base ${className}`}>
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
            <div 
                ref={containerRef}
                className="p-6 text-green-400 h-64 md:h-80 overflow-y-auto space-y-1 scrollbar-hide"
            >
                {lines.map((line, i) => (
                    <div key={i} className="break-words">
                        <span className="text-blue-400 mr-2">➜</span>
                        <span className="text-purple-400 mr-2">~</span>
                        <span>{line}</span>
                    </div>
                ))}
                <div className="animate-pulse inline-block w-2 h-4 bg-green-400 align-middle ml-1"></div>
            </div>
        </div>
    );
}
