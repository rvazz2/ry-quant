"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const WinParticles = () => {
    // Generate random particles
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50, // -50% to 50% relative spread
        y: Math.random() * 100 - 50,
        color: ['#FFD700', '#10B981', '#F59E0B', '#FFFFFF'][Math.floor(Math.random() * 4)],
        size: Math.random() * 8 + 4,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-50">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                        x: p.x * 10, // Explode outward
                        y: p.y * 10,
                        opacity: 0,
                        scale: p.size / 4,
                        rotate: Math.random() * 720
                    }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        delay: Math.random() * 0.2
                    }}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px', // Mix of circles and confetti squares
                        boxShadow: `0 0 10px ${p.color}`
                    }}
                />
            ))}
        </div>
    );
};
