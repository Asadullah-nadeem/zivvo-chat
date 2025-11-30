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
    const [completedLines, setCompletedLines] = React.useState<number[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = React.useState(0);
    const [currentText, setCurrentText] = React.useState("");

    React.useEffect(() => {
        if (currentLineIndex >= commands.length) return;

        const line = commands[currentLineIndex];
        if (currentText.length < line.length) {
            const timeout = setTimeout(() => {
                setCurrentText(line.slice(0, currentText.length + 1));
            }, 30 + Math.random() * 30);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setCompletedLines(prev => [...prev, currentLineIndex]);
                setCurrentLineIndex(prev => prev + 1);
                setCurrentText("");
            }, 400);
            return () => clearTimeout(timeout);
        }
    }, [currentLineIndex, currentText, commands]);

    const renderLineContent = (line: string) => {
        if (line.startsWith("npm")) {
            return (
                <>
                    <span className="text-blue-400">npm</span> <span className="text-yellow-200">install</span> <span className="text-white">zivvo-chat</span>
                </>
            );
        }
        if (line.includes("[OK]")) {
            return (
                <>
                    {line.split("[OK]")[0]}
                    <span className="text-emerald-400 font-bold">[OK]</span>
                </>
            );
        }
        return line;
    };

    const getLineColor = (line: string) => {
        if (line.startsWith("npm")) return "text-white";
        if (line.includes("[OK]")) return "text-gray-300";
        if (line.includes("Initialized")) return "text-blue-300 font-semibold";
        return "text-gray-400";
    };

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
            <div className="p-6 h-64 md:h-80 overflow-y-auto space-y-3 scrollbar-hide font-mono text-[13px] md:text-sm leading-relaxed">
                {completedLines.map((lineIndex) => {
                    const line = commands[lineIndex];
                    return (
                        <div key={lineIndex} className="break-words flex items-start group">
                            <span className="text-gray-500 mr-3 shrink-0 select-none">$</span>
                            <span className={getLineColor(line)}>
                                {renderLineContent(line)}
                            </span>
                        </div>
                    );
                })}
                
                {currentLineIndex < commands.length && (
                    <div className="break-words flex items-start group">
                        <span className="text-gray-500 mr-3 shrink-0 select-none">$</span>
                        <span className="text-gray-300">
                            {currentText}
                            <span className="inline-block w-2.5 h-5 bg-gray-500/50 border border-gray-400 ml-1 align-middle"></span>
                        </span>
                    </div>
                )}

                {currentLineIndex >= commands.length && (
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-gray-500">$</span>
                        <div className="w-2.5 h-5 bg-gray-500/50 border border-gray-400"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
