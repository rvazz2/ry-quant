"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity } from 'lucide-react';

interface SystemStats {
    memory: number;
    latency: number;
    uptime: number;
    fps: number;
}

/**
 * Optimized System Monitor Component
 * - Extracted from settings page for better code splitting
 * - Pauses updates when tab is hidden
 * - Throttles updates to 1 per second max
 * - Properly cleans up requestAnimationFrame
 */
export default function SystemMonitor() {
    const [stats, setStats] = useState<SystemStats>({
        memory: 0,
        latency: 0,
        uptime: 0,
        fps: 60
    });

    const animationFrameRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef(Date.now());
    const lastUpdateRef = useRef(Date.now());
    const frameCountRef = useRef(0);

    const formatUptime = useCallback((s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}h ${m}m ${sec}s`;
    }, []);

    const getHealthColor = useCallback((fps: number) => {
        if (fps > 50) return "text-emerald-400";
        if (fps > 30) return "text-amber-400";
        return "text-rose-400";
    }, []);

    useEffect(() => {
        let isActive = true;

        const updateStats = () => {
            if (!isActive) return;

            const now = Date.now();

            // Only update UI once per second to reduce re-renders
            if (now - lastUpdateRef.current < 1000) {
                animationFrameRef.current = requestAnimationFrame(updateStats);
                return;
            }

            // Simulated Memory (as performance.memory is non-standard/protected)
            const baseMem = 120; // MB
            const noise = Math.sin(now / 1000) * 10 + Math.random() * 5;

            // Latency (simulated ping)
            const ping = Math.floor(20 + Math.random() * 15);

            const uptime = Math.floor((now - startTimeRef.current) / 1000);

            // FPS Calc
            frameCountRef.current++;
            setStats({
                fps: frameCountRef.current,
                memory: Math.floor(baseMem + noise),
                latency: ping,
                uptime: uptime
            });
            frameCountRef.current = 0;
            lastUpdateRef.current = now;

            animationFrameRef.current = requestAnimationFrame(updateStats);
        };

        // Pause/resume based on page visibility
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Pause updates when tab is hidden
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                isActive = false;
            } else {
                // Resume updates when tab becomes visible
                isActive = true;
                lastUpdateRef.current = Date.now();
                frameCountRef.current = 0;
                animationFrameRef.current = requestAnimationFrame(updateStats);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        animationFrameRef.current = requestAnimationFrame(updateStats);

        // Cleanup
        return () => {
            isActive = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={48} />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">System Health</div>
                <div className="flex items-end gap-3">
                    <span className="text-3xl font-mono font-bold text-white">{stats.fps} <span className="text-sm text-slate-500 font-sans">FPS</span></span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 mb-1 ${getHealthColor(stats.fps)}`}>
                        {stats.fps > 55 ? 'OPTIMAL' : 'GOOD'}
                    </span>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(stats.fps / 60 * 100, 100)}%` }}
                    />
                </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Memory Usage</div>
                <div className="text-3xl font-mono font-bold text-cyan-400">{stats.memory} <span className="text-sm text-slate-500 font-sans">MB</span></div>
                <div className="text-xs text-slate-500 mt-1">Heap Allocation</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Network Latency</div>
                <div className="text-3xl font-mono font-bold text-purple-400">{stats.latency} <span className="text-sm text-slate-500 font-sans">ms</span></div>
                <div className="text-xs text-slate-500 mt-1">Socket Roundtrip</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Session Uptime</div>
                <div className="text-3xl font-mono font-bold text-blue-400">{formatUptime(stats.uptime)}</div>
                <div className="text-xs text-slate-500 mt-1">Current Session</div>
            </div>
        </div>
    );
}
