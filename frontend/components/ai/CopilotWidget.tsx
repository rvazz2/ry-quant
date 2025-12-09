"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useCopilot } from '@/contexts/CopilotContext';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAIChatResponse } from '@/lib/api';

export default function CopilotWidget() {
    const { isOpen, toggleOpen, messages, addMessage, isLoading, setIsLoading, currentContext } = useCopilot();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        addMessage('user', userMsg);
        setIsLoading(true);

        try {
            const response = await getAIChatResponse(userMsg, currentContext);
            if (response && response.response) {
                addMessage('assistant', response.response);
            }
        } catch (error) {
            console.error("Copilot Error:", error);
            addMessage('assistant', "I'm having trouble thinking clearly right now. (Server Error)");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleOpen}
                className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-50 group"
            >
                <Bot className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#111] border-b border-[#222]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center">
                        <Bot className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100 text-sm">Quant Copilot</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-gray-400">Online & Context Aware</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={toggleOpen} className="p-1.5 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Minimize2 className="w-4 h-4" />
                    </button>
                    <button onClick={toggleOpen} className="p-1.5 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0A0A0A]">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex flex-col max-w-[85%]",
                            msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed",
                            msg.role === 'user'
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-[#1A1A1A] text-gray-200 border border-[#2A2A2A] rounded-bl-none"
                        )}>
                            {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-600 mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}

                {isLoading && (
                    <div className="self-start flex items-center gap-2 p-3 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] rounded-bl-none">
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                        <span className="text-xs text-gray-400">Analyzing context...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-[#111] border-t border-[#222]">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this page..."
                        className="w-full bg-[#1A1A1A] text-gray-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 border border-[#2A2A2A]"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                    <p className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                        Powered by Gemini 1.5 Pro
                    </p>
                    {/* Debug indicator for context */}
                    {Object.keys(currentContext).length > 0 && (
                        <span className="text-[10px] text-green-500/50">Context Active</span>
                    )}
                </div>
            </form>
        </div>
    );
}
