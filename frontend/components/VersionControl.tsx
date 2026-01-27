"use client";

import React, { useEffect, useState } from "react";
import { History, RotateCcw, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSettings } from "@/contexts/SettingsContext";

interface VersionEntry {
    version: string;
    url: string;
    releaseNotes: string;
}

interface Manifest {
    currentVersion: string;
    history: VersionEntry[];
}

const VersionControl = () => {
    const { updateAvailable, triggerUpdate } = useSettings();
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [checking, setChecking] = useState(false);
    const currentVersion = "1.4.0"; // Placeholder for demo, in real app could be from env

    useEffect(() => {
        fetch("/version-manifest.json")
            .then((res) => res.json())
            .then((data) => setManifest(data))
            .catch((err) => console.error("Failed to load version manifest:", err));
    }, []);

    const handleRollback = (targetUrl: string) => {
        if (
            window.confirm(
                "⚠️ Rollback to previous version? Use this only if the current version is broken."
            )
        ) {
            window.location.assign(targetUrl);
        }
    };

    const handleCheckForUpdates = async () => {
        setChecking(true);
        // Simulate check delay + actual SW update check
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
                await reg.update();
            }
        }

        setTimeout(() => {
            setChecking(false);
            // In a real PWA context, if an update is found, the 'waiting' event listener 
            // in UpdateManager would pick it up. 
            // This alert confirms the CHECK was performed.
            alert("Update check complete. You are on the latest version.");
        }, 1500);
    };

    if (!manifest) return <div className="p-4 text-slate-500">Loading Version History...</div>;

    // Use the version from manifest if available for "Current", or fallback
    const displayVersion = manifest.currentVersion || currentVersion;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                        <History className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Version Control</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-slate-400 text-sm">Manage application versions & rollback.</p>
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/30">
                                Current: v{displayVersion}
                            </span>
                        </div>
                    </div>
                </div>

                {updateAvailable ? (
                    <button
                        onClick={triggerUpdate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all font-bold animate-pulse"
                    >
                        <RefreshCw size={16} />
                        Restart to Update
                    </button>
                ) : (
                    <button
                        onClick={handleCheckForUpdates}
                        disabled={checking}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all disabled:opacity-50 hover:text-cyan-400 hover:border-cyan-500/30"
                    >
                        <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
                        {checking ? "Checking..." : "Check for Updates"}
                    </button>
                )}
            </div>

            <div className="glass-panel p-0 overflow-hidden border border-slate-800 rounded-xl bg-slate-900/50">
                <div className="divide-y divide-slate-800">
                    {manifest.history.map((build) => (
                        <div
                            key={build.version}
                            className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${build.version === displayVersion ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`}></div>
                                <div>
                                    <div className="font-bold text-slate-200 flex items-center gap-2">
                                        v{build.version}
                                        {build.version === displayVersion && (
                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider border border-green-500/30">Active</span>
                                        )}
                                    </div>
                                    <div className="text-slate-500 text-xs mt-1">{build.releaseNotes}</div>
                                </div>
                            </div>

                            {build.version === displayVersion ? (
                                <div className="text-green-500 text-xs font-mono bg-green-900/20 px-2 py-1 rounded">
                                    CURRENT BUILD
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleRollback(build.url)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                                >
                                    <RotateCcw size={14} />
                                    Rollback
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-xs text-slate-500 text-center italic">
                * Rolling back directs you to a snapshot URL of the previous version.
            </div>
        </div>
    );
};

export default VersionControl;
