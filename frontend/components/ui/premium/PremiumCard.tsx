"use client";

import React, { useRef, useState } from 'react';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export default function PremiumCard({ children, className = "", hoverEffect = true, ...props }: PremiumCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || !hoverEffect) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20' : ''} ${className}`}
            {...props}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(6,182,212,0.15), transparent 40%)`,
                }}
            />

            {/* Inner Border Glow */}
            <div
                className="pointer-events-none absolute inset-0 rounded-2xl transition duration-300"
                style={{
                    opacity,
                    boxShadow: `inset 0 0 20px 2px rgba(6,182,212,0.05)`
                }}
            />

            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
}
