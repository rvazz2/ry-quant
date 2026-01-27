"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Cpu, HardDrive, RefreshCw, Trash2, Server } from "lucide-react";
import { api } from "@/lib/api";

interface SystemStatus {
    cpu_percent: number;
    memory_usage_mb: number;
    uptime_seconds: number;
    cache_size_items: number;
}

export default function SystemPage() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            const res = await api.get("/system/status");
            setStatus(res.data);
        } catch (error) {
            console.error("Failed to fetch status:", error);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleClearCache = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await api.post("/system/cache/clear");
            setMessage("Cache cleared successfully!");
            fetchStatus();
        } catch (_) {
            setMessage("Failed to clear cache.");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleRefreshData = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await api.post("/system/refresh");
            setMessage("Market data refresh triggered!");
        } catch (_) {
            setMessage("Failed to trigger refresh.");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white/90">System Control</h2>
                    <p className="text-white/50 mt-2">Monitor and manage backend services.</p>
                </div>

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/70">CPU Usage</CardTitle>
                            <Cpu className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {status ? `${status.cpu_percent}%` : "..."}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/70">Memory Usage</CardTitle>
                            <Activity className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {status ? `${status.memory_usage_mb} MB` : "..."}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/70">Uptime</CardTitle>
                            <Server className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {status ? formatUptime(status.uptime_seconds) : "..."}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/70">Cache Items</CardTitle>
                            <HardDrive className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {status ? status.cache_size_items : "..."}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Actions</CardTitle>
                        <CardDescription className="text-white/50">Run maintenance tasks on the backend.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button
                                variant="destructive"
                                onClick={handleClearCache}
                                disabled={loading}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear Cache
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleRefreshData}
                                disabled={loading}
                                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/50"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Force Refresh Data
                            </Button>
                        </div>
                        {message && (
                            <div className="p-4 rounded bg-white/10 text-white animate-in fade-in slide-in-from-bottom-2">
                                {message}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
