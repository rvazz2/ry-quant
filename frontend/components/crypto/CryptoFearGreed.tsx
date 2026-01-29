"use client";

import React, { useEffect, useState } from 'react';
import { getCryptoFNG } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

interface FNGData {
    value: number;
    value_classification: string;
}

export default function CryptoFearGreed() {
    const [data, setData] = useState<FNGData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFNG = async () => {
            try {
                const res = await getCryptoFNG();
                setData(res);
            } catch (error) {
                console.error("Failed to fetch FNG", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFNG();
    }, []);

    if (loading) return <div className="h-32 glass-panel animate-pulse" />;
    if (!data) return null;

    const getColor = (value: number) => {
        if (value < 25) return 'text-red-600';
        if (value < 45) return 'text-orange-500';
        if (value < 55) return 'text-yellow-500';
        if (value < 75) return 'text-green-500';
        return 'text-green-600';
    };

    const getRotation = (value: number) => {
        // -90 to 90 degrees
        return (value / 100) * 180 - 90;
    };

    return (
        <Card className="bg-[#111] border-[#222]">
            <CardHeader className="pb-2">
                <CardTitle className="text-gray-200 text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-purple-400" /> Fear & Greed Index
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-16 overflow-hidden">
                        {/* Gauge Background */}
                        <div className="absolute inset-0 rounded-t-full border-8 border-slate-800" />
                        {/* Gauge Needle */}
                        <div
                            className="absolute bottom-0 left-1/2 w-1 h-14 bg-white/80 origin-bottom transition-transform duration-1000 ease-out"
                            style={{ transform: `translateX(-50%) rotate(${getRotation(data.value)}deg)` }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-glow" />
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <div className={`text-2xl font-black ${getColor(data.value)}`}>
                            {data.value}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">
                            {data.value_classification}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
