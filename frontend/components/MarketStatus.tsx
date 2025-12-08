"use client";

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const MarketStatus = () => {
    const [status, setStatus] = useState<string>("CLOSED");
    const [color, setColor] = useState<string>("text-slate-500");
    const [time, setTime] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkStatus = () => {
            const now = new Date();
            // Convert to EST for Market Logic (Market Rules are based on ET)
            const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));

            // Convert to CST for Display
            const cstTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));

            const day = estTime.getDay(); // 0 is Sunday, 6 is Saturday
            const hour = estTime.getHours();
            const minute = estTime.getMinutes();
            const totalMinutes = hour * 60 + minute;

            // Format display time (Central)
            setTime(cstTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }));

            // Weekend Check
            if (day === 0 || day === 6) {
                setStatus("MARKET CLOSED");
                setColor("text-slate-500");
                return;
            }

            // Market Hours: 9:30 AM (570) - 4:00 PM (960)
            if (totalMinutes >= 570 && totalMinutes < 960) {
                setStatus("MARKET OPEN");
                setColor("text-emerald-400 animate-pulse");
            } else if (totalMinutes >= 240 && totalMinutes < 570) {
                // Pre-market: 4:00 AM (240) - 9:30 AM
                setStatus("PRE-MARKET");
                setColor("text-yellow-400");
            } else if (totalMinutes >= 960 && totalMinutes < 1200) {
                // After-hours: 4:00 PM (960) - 8:00 PM (1200)
                setStatus("AFTER HOURS");
                setColor("text-orange-400");
            } else {
                setStatus("MARKET CLOSED");
                setColor("text-slate-500");
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Prevent hydration mismatch by not rendering until mounted on client
    if (!mounted) return null;

    return (
        <div className="flex flex-col items-end mr-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold tracking-widest ${color} flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                    {status}
                </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-mono">
                <Clock size={10} />
                {time}
            </div>
        </div>
    );
};

export default MarketStatus;
