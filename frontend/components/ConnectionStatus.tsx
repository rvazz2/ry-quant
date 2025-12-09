"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { checkBackendHealth } from '@/lib/api';

const ConnectionStatus = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Initial check
        checkStatus();

        // Check every 10 seconds
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        if (isChecking) return;
        setIsChecking(true);
        try {
            const healthy = await checkBackendHealth();
            // Only update state if it changed to prevent re-renders
            setIsOnline(prev => prev !== healthy ? healthy : prev);
        } finally {
            setIsChecking(false);
        }
    };

    // Don't show anything if online (unobtrusive)
    if (isOnline) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/90 border border-rose-500/30 rounded-lg shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-2">
            <div className="relative">
                <WifiOff size={20} className="text-rose-500" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
            </div>
            <div className="flex flex-col">
                <p className="text-sm font-semibold text-rose-200">Connection Lost</p>
                <p className="text-xs text-rose-400/80">Reconnecting to server...</p>
            </div>
        </div>
    );
};

export default ConnectionStatus;
