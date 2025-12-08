"use client";

import React, { useState } from 'react';
import ReportButton from '@/components/reports/ReportButton';
import { Search } from 'lucide-react';

export default function ReportsPage() {
    const [ticker, setTicker] = useState("AAPL");
    const [input, setInput] = useState("AAPL");

    return (
        <div className="w-full min-h-screen pt-20 bg-[#000000] text-gray-200">
            <div className="px-8 py-6 max-w-2xl mx-auto text-center">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 mb-2">
                        AI Analyst Reports
                    </h1>
                    <p className="text-gray-400">
                        Generate professional-grade investment memos in seconds.
                    </p>
                </header>

                <div className="bg-[#111] border border-[#222] p-8 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-2 mb-8 max-w-md mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value.toUpperCase())}
                                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Enter Ticker (e.g. NVDA)"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#222] rounded-xl bg-[#080808]">
                        <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-white">{input || "?"}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Report for {input}</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-xs">
                            Includes Executive Summary, Thesis, Risks, and Catalysts.
                        </p>
                        <ReportButton ticker={input} />
                    </div>
                </div>
            </div>
        </div>
    );
}
