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
        <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-20">
            <div className="p-5 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-800">Live Chat</h2>
                <div className="flex gap-2 mt-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">Location On</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Notifications On</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <span className="text-4xl mb-2">💬</span>
                        <p className="text-sm">Say Hello!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                msg.sender === 'You'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}
                        >
                            {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">{msg.time}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={sendMessage} className="relative mb-3">
                    <input
                        type="text"
                        className="w-full bg-gray-100 border-0 rounded-xl px-4 py-3.5 pr-12 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isSearching}
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !inputText.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>

                <button
                    onClick={handleNextPartner}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                >
                    {isSearching ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Searching...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Find New Partner
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}