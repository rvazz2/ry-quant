"use client";

import React from 'react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    icon?: React.ReactNode;
}

export default function PremiumButton({
    children,
    variant = 'primary',
    size = 'md',
    className = "",
    icon,
    ...props
}: PremiumButtonProps) {

    const baseStyles = "relative group overflow-hidden font-bold rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-400/20 hover:border-cyan-400/50",
        secondary: "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 hover:border-slate-500 shadow-lg",
        outline: "bg-transparent text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
        danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] border border-rose-400/20"
    };

    const sizes = {
        sm: "px-4 py-1.5 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

            {/* Bloom Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

            <span className="relative z-20 flex items-center gap-2">
                {icon && <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>}
                {children}
            </span>
        </button>
    );
}
