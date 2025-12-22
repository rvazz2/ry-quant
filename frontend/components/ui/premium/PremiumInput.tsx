"use client";

import React, { useState } from 'react';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    suffix?: string;
    error?: string;
    className?: string;
}

export default function PremiumInput({ label, suffix, error, className = "", ...props }: PremiumInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value);

    // Update hasValue if value prop changes externally
    React.useEffect(() => {
        setHasValue(!!props.value);
    }, [props.value]);

    return (
        <div className={`relative group ${className}`}>
            <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${isFocused || hasValue
                        ? '-top-2.5 text-xs text-cyan-400 bg-slate-900 px-2'
                        : 'top-3.5 text-slate-400'
                    }`}
            >
                {label}
            </label>

            <div className={`relative flex items-center bg-slate-900/50 border rounded-xl transition-all duration-300 overflow-hidden ${isFocused
                    ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : error
                        ? 'border-rose-500'
                        : 'border-slate-700 hover:border-slate-600'
                }`}>
                <input
                    {...props}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        setHasValue(!!e.target.value);
                        props.onBlur?.(e);
                    }}
                    className={`w-full bg-transparent text-white px-4 py-3.5 outline-none placeholder-transparent ${suffix ? 'pr-12' : ''}`}
                    placeholder={label} // Needed for floating label trick sometimes, but we control state manually
                />

                {suffix && (
                    <span className="absolute right-4 text-slate-500 text-sm font-medium">{suffix}</span>
                )}
            </div>

            {error && <p className="text-rose-500 text-xs mt-1 ml-1">{error}</p>}

            {/* Bottom Glow Line */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyan-400 transition-all duration-500 ${isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
        </div>
    );
}
