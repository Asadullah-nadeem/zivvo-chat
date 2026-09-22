
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../types/types';

interface Props {
    messages: ChatMessage[];
    inputText: string;
    setInputText: (text: string) => void;
    sendMessage: (e: React.FormEvent) => void;
    handleNextPartner: () => void;
    isSearching: boolean;
}

export default function ChatPanel({
                                      messages,
                                      inputText,
                                      setInputText,
                                      sendMessage,
                                      handleNextPartner,
                                      isSearching
                                  }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="w-full h-[45vh] md:h-full md:w-[400px] bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col shadow-xl z-30 shrink-0 min-h-0 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center shrink-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Live Chat</h2>
                <div className="flex items-center gap-1.5 bg-green-50 px-2 sm:px-2.5 py-1 rounded-lg border border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-green-700">Online</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 bg-gray-50 min-h-0">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-center">Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[85%] px-3.5 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-[15px] shadow-sm font-medium break-words ${
                                msg.sender === 'You'
                                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none'
                            }`}
                        >
                            {msg.text}
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1 px-1 font-semibold">{msg.time}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input & Controls */}
            <div className="p-3 sm:p-5 bg-white border-t border-gray-100 space-y-2.5 sm:space-y-3 shrink-0">
                <form onSubmit={sendMessage} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm md:text-base font-medium placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none min-w-0"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isSearching}
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !inputText.trim()}
                        className="p-2.5 sm:p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20 shrink-0"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>

                <button
                    onClick={handleNextPartner}
                    className="w-full py-3 sm:py-4 bg-black text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                    {isSearching ? (
                        <>
                            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Searching...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            <span>Skip Partner</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}