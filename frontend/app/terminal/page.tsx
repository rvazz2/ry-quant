"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const TerminalInterface = dynamic(() => import('@/components/Terminal/TerminalInterface'), {
    loading: () => <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">INITIALIZING TERMINAL...</div>,
    ssr: false
});

export default function TerminalPage() {
    return (
        <div className="h-screen w-screen bg-black overflow-hidden flex flex-col">
            <Suspense fallback={<div className="text-green-500">Loading...</div>}>
                <TerminalInterface />
            </Suspense>
        </div>
    );
}
