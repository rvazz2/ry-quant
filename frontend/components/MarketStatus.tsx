"use client";

import React, { useEffect, useState } from 'react';
import { Clock, Activity } from 'lucide-react';

const MarketStatus = () => {
    const [marketState, setMarketState] = useState({
        status: "CLOSED",
        colorClass: "text-slate-500",
        glowClass: "shadow-none",
        dotColor: "bg-slate-500",
        time: ""
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkStatus = () => {
            const now = new Date();
            // Market Rules based on ET
            const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
            // Display Time in CST
            const cstTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));

            const day = estTime.getDay();
            const hour = estTime.getHours();
            const minute = estTime.getMinutes();
            const totalMinutes = hour * 60 + minute;

            const timeStr = cstTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

            // Weekend
            if (day === 0 || day === 6) {
                setMarketState({
                    status: "MARKET CLOSED",
                    colorClass: "text-slate-400",
                    dotColor: "bg-slate-500",
                    glowClass: "shadow-none border-slate-800",
                    time: timeStr
                });
                return;
            }

            // Market Hours: 9:30 AM (570) - 4:00 PM (960)
            if (totalMinutes >= 570 && totalMinutes < 960) {
                setMarketState({
                    status: "MARKET OPEN",
                    colorClass: "text-emerald-400 font-bold",
                    dotColor: "bg-emerald-500 animate-pulse",
                    glowClass: "shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/30 bg-emerald-950/20",
                    time: timeStr
                });
            } else if (totalMinutes >= 240 && totalMinutes < 570) {
                // Pre-market
                setMarketState({
                    status: "PRE-MARKET",
                    colorClass: "text-amber-400 font-bold",
                    dotColor: "bg-amber-500 animate-pulse",
                    glowClass: "shadow-[0_0_15px_rgba(251,191,36,0.3)] border-amber-500/30 bg-amber-950/20",
                    time: timeStr
                });
            } else if (totalMinutes >= 960 && totalMinutes < 1200) {
                // After-hours
                setMarketState({
                    status: "AFTER HOURS",
                    colorClass: "text-blue-400 font-bold",
                    dotColor: "bg-blue-500",
                    glowClass: "shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500/30 bg-blue-950/20",
                    time: timeStr
                });
            } else {
                setMarketState({
                    status: "MARKET CLOSED",
                    colorClass: "text-slate-400",
                    dotColor: "bg-slate-500",
                    glowClass: "shadow-none border-slate-800 bg-slate-900/50",
                    time: timeStr
                });
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return <div className="h-8 w-32 bg-slate-900/50 rounded-lg animate-pulse" />;

    return (
        <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all duration-500 ${marketState.glowClass}`}>
            <div className={`w-2 h-2 rounded-full ${marketState.dotColor}`} />

            <div className="flex flex-col leading-none">
                <span className={`text-[10px] tracking-widest uppercase ${marketState.colorClass}`}>
                    {marketState.status}
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Clock size={8} />
                    {marketState.time}
                </span>
            </div>
        </div>
    );
};

export default MarketStatus;
