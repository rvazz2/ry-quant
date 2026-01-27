"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * PWAUpdater
 * A dependency-free component that shows a toast when a new version is available.
 * Uses window.workbox listening logic.
 */
const PWAUpdater = () => {
    const [showUpdate, setShowUpdate] = useState(false);
    const [wb, setWb] = useState<any>(null);

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            window.workbox !== undefined
        ) {
            const workbox = window.workbox;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setWb(workbox);

            // Listen for waiting state
            workbox.addEventListener("waiting", () => {
                setShowUpdate(true);
            });

            workbox.register();
        }
    }, []);

    const handleReload = () => {
        if (wb) {
            wb.addEventListener("controlling", () => {
                window.location.reload();
            });
            wb.messageSkipWaiting();
        } else {
            window.location.reload();
        }
        setShowUpdate(false);
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg shadow-xl flex items-center justify-between gap-4 min-w-[300px]">
                <div className="flex flex-col">
                    <span className="font-medium text-sm">Update Available</span>
                    <span className="text-xs text-slate-400">A new version is ready.</span>
                </div>
                <button
                    onClick={handleReload}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default PWAUpdater;
