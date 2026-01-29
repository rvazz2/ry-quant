"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type MarketMood = 'calm' | 'volatile' | 'extreme'; // VIX < 20, 20-30, > 30

interface MarketHeartbeatContextType {
    mood: MarketMood;
    vixValue: number;
    pulseSpeed: number; // in seconds (e.g., 4s for calm, 0.5s for extreme)
}

const MarketHeartbeatContext = createContext<MarketHeartbeatContextType>({
    mood: 'calm',
    vixValue: 15,
    pulseSpeed: 4
});

export const useMarketHeartbeat = () => useContext(MarketHeartbeatContext);

export function MarketHeartbeatProvider({ children }: { children: React.ReactNode }) {
    const [stats, setStats] = useState({ vix: 14.5 }); // Start calm
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Simulate VIX changes or fetch real API
        // For demo purposes, we will oscillate or allow manual override
        const interval = setInterval(() => {
            // Mock VIX fluctuation
            setStats(prev => {
                // Random walk
                const change = (Math.random() - 0.5) * 2;
                let newVix = prev.vix + change;
                if (newVix < 10) newVix = 10;
                if (newVix > 40) newVix = 40;
                return { vix: newVix };
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getMoodData = (vix: number): MarketHeartbeatContextType => {
        if (vix > 30) return { mood: 'extreme', vixValue: vix, pulseSpeed: 0.8 };
        if (vix > 20) return { mood: 'volatile', vixValue: vix, pulseSpeed: 2 };
        return { mood: 'calm', vixValue: vix, pulseSpeed: 6 };
    };

    const data = getMoodData(stats.vix);

    const toggleMood = () => {
        setStats(prev => {
            if (prev.vix < 20) return { vix: 25 };
            if (prev.vix < 30) return { vix: 45 };
            return { vix: 14 };
        });
    };

    return (
        <MarketHeartbeatContext.Provider value={data}>
            <div
                className="transition-colors duration-[2000ms]"
                style={{
                    '--heartbeat-speed': `${data.pulseSpeed}s`,
                    '--shadow-color': data.mood === 'extreme' ? 'rgba(239, 68, 68, 0.5)' : data.mood === 'volatile' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(52, 211, 153, 0.2)',
                    '--accent-glow': data.mood === 'extreme' ? '#ef4444' : data.mood === 'volatile' ? '#f59e0b' : '#10b981'
                } as React.CSSProperties}
            >
                {data.mood !== 'calm' && mounted && (
                    <div className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-20 animate-pulse bg-gradient-to-t from-transparent via-transparent to-[var(--accent-glow)]" style={{ animationDuration: `${data.pulseSpeed}s` }}></div>
                )}
                {children}

                {/* VIX Indicator (absolute top right or bottom right) */}
                <button
                    onClick={toggleMood}
                    className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
                    style={{
                        borderColor: 'var(--accent-glow)',
                        boxShadow: `0 0 20px var(--shadow-color)`
                    }}
                >
                    <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent-glow)', animationDuration: '1s' }}></div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                        VIX {data.vixValue.toFixed(2)}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--accent-glow)' }}>
                        {data.mood}
                    </span>
                </button>
            </div>
        </MarketHeartbeatContext.Provider>
    );
}
