"use client";

import React, { useEffect, useState } from 'react';
import { getCryptoTop } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface MorphingPriceBackgroundProps {
    className?: string;
}

interface CryptoPrice {
    symbol: string;
    price: number;
}

export default function MorphingPriceBackground({ className = "" }: MorphingPriceBackgroundProps) {
    const [currentPrice, setCurrentPrice] = useState<string>("96,500.00");
    const [currentSymbol, setCurrentSymbol] = useState<string>("BTC");
    const [cryptoData, setCryptoData] = useState<CryptoPrice[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const data = await getCryptoTop();
                if (data && data.length > 0) {
                    setCryptoData(data.slice(0, 5)); // Top 5 for rotation
                }
            } catch (error) {
                console.error("Failed to fetch crypto prices for background", error);
            }
        };

        fetchPrices();
        const priceInterval = setInterval(fetchPrices, 10000); // Update prices every 10s

        return () => clearInterval(priceInterval);
    }, []);

    useEffect(() => {
        if (cryptoData.length === 0) return;

        const rotationInterval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % cryptoData.length);
        }, 4000); // Rotate every 4 seconds

        return () => clearInterval(rotationInterval);
    }, [cryptoData]);

    useEffect(() => {
        if (cryptoData.length > 0 && cryptoData[currentIndex]) {
            const coin = cryptoData[currentIndex];
            const symbol = coin.symbol.split('/')[0]; // BTC/USD -> BTC
            const price = typeof coin.price === 'number'
                ? coin.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
                : parseFloat(String(coin.price)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

            setCurrentSymbol(symbol);
            setCurrentPrice(price);
        }
    }, [currentIndex, cryptoData]);

    return (
        <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {/* Symbol Watermark */}
                    <div
                        className="absolute text-[20vw] font-black tracking-tighter opacity-[0.03] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent select-none"
                        style={{
                            top: '20%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {currentSymbol}
                    </div>

                    {/* Price Watermark */}
                    <div
                        className="absolute text-[12vw] font-mono font-bold tracking-tight opacity-[0.04] bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent select-none"
                        style={{
                            top: '60%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        ${currentPrice}
                    </div>

                    {/* Decorative diagonal lines */}
                    <div className="absolute w-full h-full">
                        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
                        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
