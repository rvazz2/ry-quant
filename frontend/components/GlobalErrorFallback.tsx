"use client";

import React from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    resetErrorBoundary?: () => void;
    title?: string;
    message?: string;
}

const GlobalErrorFallback: React.FC<Props> = ({
    resetErrorBoundary,
    title = "System Unavailable",
    message = "We encountered an issue loading this component."
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] w-full bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <WifiOff className="text-red-400" size={32} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 mb-6 max-w-sm text-sm leading-relaxed">
                {message} <br />
                <span className="text-xs opacity-70 mt-2 block">Our automated systems have been notified.</span>
            </p>

            {resetErrorBoundary && (
                <button
                    onClick={resetErrorBoundary}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-all hover:scale-105 active:scale-95 group"
                >
                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                    Retry Connection
                </button>
            )}
        </div>
    );
};

export default GlobalErrorFallback;
