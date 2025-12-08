"use client";

import React from 'react';
import StrategyCanvas from '@/components/strategy/StrategyCanvas';

export default function StrategyBuilderPage() {
    return (
        <div className="w-full h-screen flex flex-col pt-20 bg-[#000000]">
            <div className="px-8 py-4 border-b border-[#222] flex justify-between items-center bg-[#050505]">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                        Visual Strategy Builder
                    </h1>
                    <p className="text-gray-400 text-sm">Drag and drop nodes to create algorithmic trading strategies.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm bg-[#1A1A1A] text-gray-300 rounded-lg border border-[#333] hover:bg-[#222] hover:text-white transition-colors">
                        Load Saved
                    </button>
                    <button className="px-4 py-2 text-sm bg-[#1A1A1A] text-gray-300 rounded-lg border border-[#333] hover:bg-[#222] hover:text-white transition-colors">
                        Save Strategy
                    </button>
                    <button className="px-4 py-2 text-sm bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transition-all font-medium">
                        Run Backtest
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full relative">
                <StrategyCanvas />
            </div>
        </div>
    );
}
