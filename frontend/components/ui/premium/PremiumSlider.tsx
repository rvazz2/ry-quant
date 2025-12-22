"use client";

import React from 'react';

interface PremiumSliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label?: string;
    suffix?: string;
    className?: string;
}

export default function PremiumSlider({ value, min, max, step = 1, onChange, label, suffix = "", className = "" }: PremiumSliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex justify-between items-end">
                {label && <label className="text-slate-400 text-sm font-medium">{label}</label>}
                <span className="text-cyan-400 font-bold font-mono bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20 text-sm shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    {value}{suffix}
                </span>
            </div>

            <div className="relative h-6 flex items-center group cursor-pointer">
                {/* Track Background */}
                <div className="absolute w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    {/* Fill */}
                    <div
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all duration-150 relative"
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                    </div>
                </div>

                {/* Native Input (Hidden but Functional) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                />

                {/* Custom Thumb (Visual Only) */}
                <div
                    className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)] border-2 border-cyan-500 transition-transform duration-150 pointer-events-none z-10 group-hover:scale-125"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                >
                    <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping" />
                </div>
            </div>
        </div>
    );
}
