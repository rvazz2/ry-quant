"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface StatItemProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    suffix?: string;
    prefix?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-4xl font-black text-white mb-2 tabular-nums">
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-sm text-slate-400 font-medium tracking-wide">{label}</div>
        </div>
    );
};

export default function StatsCounter() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            <StatItem
                icon={<Users size={28} />}
                value={5000}
                suffix="+"
                label="Active Users"
            />
            <StatItem
                icon={<DollarSign size={28} />}
                value={2500000}
                prefix="$"
                label="Portfolio Value"
            />
            <StatItem
                icon={<TrendingUp size={28} />}
                value={95}
                suffix="%"
                label="Success Rate"
            />
            <StatItem
                icon={<Target size={28} />}
                value={10000}
                suffix="+"
                label="Goals Achieved"
            />
        </div>
    );
}
