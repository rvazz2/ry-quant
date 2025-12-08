"use client";

import React from 'react';
import TrendTracker from '@/components/sentiment/TrendTracker';

export default function SentimentPage() {
    return (
        <div className="w-full min-h-screen pt-20 bg-[#000000] text-gray-200">
            <div className="px-8 py-6 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">
                        Social Sentiment Radar
                    </h1>
                    <p className="text-gray-400">
                        Track the hype. Catch the next meme stock before it explodes.
                    </p>
                </header>

                <TrendTracker />
            </div>
        </div>
    );
}
