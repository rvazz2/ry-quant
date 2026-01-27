"use client";

import React from 'react';

export const CosmicBackground = React.memo(() => {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {/* Deep Space Base */}
            <div className="absolute inset-0 bg-[#0b0e14]" />

            {/* Ambient Noise Texture (Reduced Opacity) */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                }}
            />

            {/* Nebula 1: Cyan (Top Left) */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/5 rounded-full blur-[120px]" />

            {/* Nebula 2: Violet (Bottom Right) */}
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/5 rounded-full blur-[120px]" />

            {/* Nebula 3: Emerald (Bottom Left - subtle) */}
            <div className="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] bg-emerald-500/3 rounded-full blur-[100px]" />

            {/* Grid Overlay (Optional - Keep minimal) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
    );
});

CosmicBackground.displayName = 'CosmicBackground';
