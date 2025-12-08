"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface EconomicEvent {
    event: string;
    date: string;
    time: string;
    impact: "High" | "Medium" | "Low";
    forecast: string;
    previous: string;
}

const EconomicCalendar = () => {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                // In a real app, this would be a real API call.
                // Assuming the backend endpoint /api/macro/calendar exists as seen in router research
                const res = await fetch('http://localhost:8000/api/macro/calendar');
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch economic calendar", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, []);

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "High": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
            case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    return (
        <div className="glass-panel p-6 border-l-4 border-l-blue-500 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Calendar className="text-blue-500" />
                        Economic Calendar
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Upcoming high-impact market events.
                    </p>
                </div>
                <div className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    EST (UTC-5)
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 w-full bg-slate-800/50 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-800 rounded-lg border border-slate-700/50">
                                    <span className="text-xs text-slate-500 font-bold uppercase">{new Date(item.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                    <span className="text-lg font-bold text-slate-200">{new Date(item.date).getDate()}</span>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{item.event}</div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} /> {item.time}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${getImpactColor(item.impact)}`}>
                                            {item.impact} Impact
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right text-xs">
                                <div className="text-slate-400">Forecast: <span className="text-slate-200 font-mono">{item.forecast}</span></div>
                                <div className="text-slate-500">Prev: <span className="text-slate-400 font-mono">{item.previous}</span></div>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="py-8 text-center text-slate-500">
                            No upcoming events data available.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EconomicCalendar;
