"use client";

import React, { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import Link from "next/link";
import Image from "next/image";
import {
    Shield, Globe, Cpu, Lock, Layout,
    RefreshCw, AlertTriangle, Activity, HelpCircle
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import HelpSidebar from "@/components/settings/HelpSidebar";
import { api } from "@/lib/api";
import SettingsErrorBoundary from "@/components/settings/SettingsErrorBoundary";

// Lazy load SystemMonitor for better code splitting
const SystemMonitor = lazy(() => import("@/components/settings/SystemMonitor"));

export default function SettingsPage() {
    const { settings, updateSetting, resetSettings } = useSettings();
    const [activeTab, setActiveTab] = useState("risk");
    const [helpSidebarOpen, setHelpSidebarOpen] = useState(false);

    // Memoize handler to prevent recreation on every render
    const handleChange = useCallback((key: keyof typeof settings, value: string | number | boolean) => {
        updateSetting(key, value);
    }, [updateSetting]);

    // Memoize tabs to prevent recreation
    const tabs = useMemo(() => [
        { id: "risk", label: "Risk & Execution", icon: <Shield size={18} /> },
        { id: "data", label: "Data & Regional", icon: <Globe size={18} /> },
        { id: "system", label: "System & Updates", icon: <Cpu size={18} /> },
        { id: "visual", label: "Visual Density", icon: <Layout size={18} /> },
    ], []);

    const renderRiskSettings = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Fat Finger Protection */}
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <Tooltip content="Manage trading limits, safety stops, and order confirmations.">
                    <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2 cursor-help">
                        <AlertTriangle size={18} /> Fat Finger Protection
                    </h3>
                </Tooltip>
                <p className="text-sm text-slate-400 mb-4">
                    Prevents accidental large orders. Orders above this value will be blocked.
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">$</span>
                    <input
                        type="number"
                        value={settings.maxOrderValue}
                        onChange={(e) => handleChange("maxOrderValue", Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white w-48 focus:border-red-500 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Daily Loss Circuit Breaker */}
            <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <Tooltip content="Control your exposure. Orders stop when daily loss exceeds this limit.">
                    <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-2 cursor-help">
                        <Shield size={18} /> Daily Loss Circuit Breaker
                    </h3>
                </Tooltip>
                <p className="text-sm text-slate-400 mb-4">
                    Trading will be automatically paused when daily losses exceed this amount.
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">$</span>
                    <input
                        type="number"
                        value={settings.maxDailyLoss}
                        onChange={(e) => handleChange("maxDailyLoss", Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white w-48 focus:border-amber-500 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Quantity */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Set default lot sizes for quick order entry.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Default Order Quantity</label>
                    </Tooltip>
                    <select
                        value={settings.defaultQuantity}
                        onChange={(e) => handleChange("defaultQuantity", Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                    >
                        <option value={10}>10 Shares</option>
                        <option value={100}>100 Shares</option>
                        <option value={500}>500 Shares</option>
                        <option value={1000}>1,000 Shares</option>
                    </select>
                </div>

                {/* One-Click Trading */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                        <Tooltip content="Toggle 'one-click' trading protections. Enable for instant execution without confirmation.">
                            <label className="block text-slate-300 font-medium cursor-help">One-Click Trading</label>
                        </Tooltip>
                        <p className="text-xs text-slate-500 mt-1">Execute immediately without confirmation.</p>
                    </div>
                    <button
                        onClick={() => handleChange("oneClickTrading", !settings.oneClickTrading)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.oneClickTrading ? 'bg-green-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.oneClickTrading ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* Default Stop Loss */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Default stop-loss percentage applied to new positions.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Default Stop Loss %</label>
                    </Tooltip>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0.5"
                            max="10"
                            step="0.5"
                            value={settings.stopLossDefault}
                            onChange={(e) => handleChange("stopLossDefault", Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-white font-mono font-bold w-16 text-right">{settings.stopLossDefault}%</span>
                    </div>
                </div>

                {/* Default Take Profit */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Default take-profit target for new positions.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Default Take Profit %</label>
                    </Tooltip>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="0.5"
                            value={settings.takeProfitDefault}
                            onChange={(e) => handleChange("takeProfitDefault", Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-white font-mono font-bold w-16 text-right">{settings.takeProfitDefault}%</span>
                    </div>
                </div>

                {/* Max Slippage */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Maximum acceptable price difference between order and execution.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Max Slippage Tolerance %</label>
                    </Tooltip>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={settings.maxSlippage}
                            onChange={(e) => handleChange("maxSlippage", Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-white font-mono font-bold w-16 text-right">{settings.maxSlippage}%</span>
                    </div>
                </div>

                {/* Large Order Confirmation */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Orders above this value will require confirmation before execution.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Confirm Large Orders</label>
                    </Tooltip>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">$</span>
                        <input
                            type="number"
                            value={settings.confirmLargeOrders}
                            onChange={(e) => handleChange("confirmLargeOrders", Number(e.target.value))}
                            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full focus:border-cyan-500 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Position Sizing Method */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <Tooltip content="Method for calculating position sizes: Fixed amount, % of portfolio, or Kelly Criterion.">
                    <h3 className="text-slate-200 font-bold flex items-center gap-2 mb-3 cursor-help">Position Sizing Method</h3>
                </Tooltip>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        onClick={() => handleChange("positionSizingMethod", "fixed")}
                        className={`p-3 border rounded cursor-pointer transition-all ${settings.positionSizingMethod === "fixed" ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                    >
                        <div className="font-bold text-white mb-1">Fixed Amount</div>
                        <div className="text-xs text-slate-400">Same dollar amount per trade</div>
                    </div>
                    <div
                        onClick={() => handleChange("positionSizingMethod", "percentage")}
                        className={`p-3 border rounded cursor-pointer transition-all ${settings.positionSizingMethod === "percentage" ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                    >
                        <div className="font-bold text-white mb-1">Portfolio %</div>
                        <div className="text-xs text-slate-400">Percentage of total portfolio</div>
                    </div>
                    <div
                        onClick={() => handleChange("positionSizingMethod", "kelly")}
                        className={`p-3 border rounded cursor-pointer transition-all ${settings.positionSizingMethod === "kelly" ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                    >
                        <div className="font-bold text-white mb-1">Kelly Criterion</div>
                        <div className="text-xs text-slate-400">Mathematically optimal sizing</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDataSettings = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Base Currency */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Localize your dashboard. Select your primary exchange region.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Base Reporting Currency</label>
                    </Tooltip>
                    <select
                        value={settings.baseCurrency}
                        onChange={(e) => handleChange("baseCurrency", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                    >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                </div>

                {/* Timezone */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Adjust time stamps to your local time or exchange time.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Market Timezone</label>
                    </Tooltip>
                    <div className="flex bg-slate-800 p-1 rounded">
                        <button
                            onClick={() => handleChange("timezone", "local")}
                            className={`flex-1 py-1 text-sm rounded transition-colors ${settings.timezone === "local" ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                        >
                            Local Time
                        </button>
                        <button
                            onClick={() => handleChange("timezone", "exchange")}
                            className={`flex-1 py-1 text-sm rounded transition-colors ${settings.timezone === "exchange" ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                        >
                            Exchange (EST)
                        </button>
                    </div>
                </div>

                {/* Number Format */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Choose number formats: 1,000.00 (US) or 1.000,00 (EU).">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Number Format</label>
                    </Tooltip>
                    <div className="flex bg-slate-800 p-1 rounded">
                        <button
                            onClick={() => handleChange("numberFormat", "US")}
                            className={`flex-1 py-1 text-sm rounded transition-colors ${settings.numberFormat === "US" ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                        >
                            US (1,000.00)
                        </button>
                        <button
                            onClick={() => handleChange("numberFormat", "EU")}
                            className={`flex-1 py-1 text-sm rounded transition-colors ${settings.numberFormat === "EU" ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
                        >
                            EU (1.000,00)
                        </button>
                    </div>
                </div>

                {/* Date Format */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Select date display: MM/DD/YYYY, DD/MM/YYYY, or ISO.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Date Format</label>
                    </Tooltip>
                    <select
                        value={settings.dateFormat}
                        onChange={(e) => handleChange("dateFormat", e.target.value as "US" | "EU" | "ISO")}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                    >
                        <option value="US">US (MM/DD/YYYY)</option>
                        <option value="EU">EU (DD/MM/YYYY)</option>
                        <option value="ISO">ISO (YYYY-MM-DD)</option>
                    </select>
                </div>

                {/* Market Data Source */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg col-span-1 md:col-span-2">
                    <Tooltip content="Choose your preferred data feed: Primary (fastest), Backup (fallback), or Aggregated.">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 mb-3 cursor-help">Market Data Source</h3>
                    </Tooltip>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            onClick={() => handleChange("marketDataSource", "primary")}
                            className={`p-3 border rounded cursor-pointer transition-all ${settings.marketDataSource === "primary" ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className="font-bold text-white mb-1">Primary Feed</div>
                            <div className="text-xs text-slate-400">Fastest, direct from exchange</div>
                        </div>
                        <div
                            onClick={() => handleChange("marketDataSource", "backup")}
                            className={`p-3 border rounded cursor-pointer transition-all ${settings.marketDataSource === "backup" ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className="font-bold text-white mb-1">Backup Feed</div>
                            <div className="text-xs text-slate-400">Secondary source fallback</div>
                        </div>
                        <div
                            onClick={() => handleChange("marketDataSource", "aggregated")}
                            className={`p-3 border rounded cursor-pointer transition-all ${settings.marketDataSource === "aggregated" ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className="font-bold text-white mb-1">Aggregated</div>
                            <div className="text-xs text-slate-400">Multiple sources combined</div>
                        </div>
                    </div>
                </div>

                {/* Data Streaming Mode */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg col-span-1 md:col-span-2">
                    <Tooltip content="Real-time (WebSocket) for instant updates or Polling for data-saving mode.">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 mb-3 cursor-help">Data Streaming Mode</h3>
                    </Tooltip>
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={() => handleChange("dataMode", "realtime")}
                            className={`p-3 border rounded cursor-pointer transition-all ${settings.dataMode === "realtime" ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className="font-bold text-white mb-1">Real-Time (WebSocket)</div>
                            <div className="text-xs text-slate-400">Updates 50x per second. High bandwidth.</div>
                        </div>
                        <div
                            onClick={() => handleChange("dataMode", "saver")}
                            className={`p-3 border rounded cursor-pointer transition-all ${settings.dataMode === "saver" ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className="font-bold text-white mb-1">Data Saver (Polling)</div>
                            <div className="text-xs text-slate-400">Updates every 5 seconds. Mobile friendly.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderVisualSettings = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Layout Density */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <Tooltip content="Customize your view. Switch to Compact to see more rows or Comfortable for easier reading.">
                    <label className="block text-slate-300 font-medium mb-4 cursor-help">Layout Density</label>
                </Tooltip>
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => handleChange("density", "comfortable")}
                        className={`p-4 border rounded cursor-pointer flex flex-col items-center justify-center h-32 transition-all ${settings.density === "comfortable" ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700'}`}
                    >
                        <Layout size={24} className="mb-2 text-purple-400" />
                        <div className="text-white font-medium">Comfortable</div>
                        <div className="text-xs text-slate-500 mt-1">More whitespace</div>
                    </div>
                    <div
                        onClick={() => handleChange("density", "compact")}
                        className={`p-4 border rounded cursor-pointer flex flex-col items-center justify-center h-32 transition-all ${settings.density === "compact" ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700'}`}
                    >
                        <Layout size={24} className="mb-2 text-cyan-400" />
                        <div className="text-white font-medium">Compact</div>
                        <div className="text-xs text-slate-500 mt-1">Bloomberg Style</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row Height */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Adjust vertical spacing of tables. Smaller heights fit more data.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Row Height</label>
                    </Tooltip>
                    <select
                        value={settings.rowHeight}
                        onChange={(e) => handleChange("rowHeight", e.target.value as "small" | "medium" | "large")}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                    >
                        <option value="small">Small (Compact)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="large">Large (Spacious)</option>
                    </select>
                </div>

                {/* Font Size */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Customize base font size for accessibility and preference.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Font Size</label>
                    </Tooltip>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="12"
                            max="18"
                            step="1"
                            value={settings.fontSize}
                            onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-white font-mono font-bold w-16 text-right">{settings.fontSize}px</span>
                    </div>
                </div>
            </div>

            {/* Chart Color Theme */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <Tooltip content="Choose color scheme for charts and data visualization.">
                    <label className="block text-slate-300 font-medium mb-2 cursor-help">Chart Color Theme</label>
                </Tooltip>
                <select
                    value={settings.theme}
                    onChange={(e) => handleChange("theme", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                >
                    <option value="standard">Standard (Green/Red)</option>
                    <option value="colorblind">Colorblind Safe (Blue/Orange)</option>
                    <option value="hollow">Hollow Candles</option>
                </select>
            </div>
        </div>
    );



    const renderSystemSettings = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* System Monitor */}
            <div className="p-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl">
                <div className="p-6 bg-slate-950/90 backdrop-blur rounded-[10px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Tooltip content="Keep the platform running smoothly. View real-time performance metrics.">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 cursor-help">
                                    <Cpu className="text-cyan-400" size={24} />
                                    System Monitor
                                </h3>
                            </Tooltip>
                            <p className="text-slate-400 text-sm mt-1">Real-time performance metrics.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-500">LIVE</span>
                        </div>
                    </div>
                    <Suspense fallback={<div className="h-48 bg-slate-900/50 animate-pulse rounded-lg" />}>
                        <SystemMonitor />
                    </Suspense>
                </div>
            </div>

            {/* System Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auto-Update */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                        <Tooltip content="Automatically install platform updates when available.">
                            <label className="block text-slate-300 font-medium cursor-help">Auto-Update</label>
                        </Tooltip>
                        <p className="text-xs text-slate-500 mt-1">Install updates automatically</p>
                    </div>
                    <button
                        onClick={() => handleChange("autoUpdate", !settings.autoUpdate)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoUpdate ? 'bg-green-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.autoUpdate ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* Beta Features */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                        <Tooltip content="Enable experimental features (may be unstable).">
                            <label className="block text-slate-300 font-medium cursor-help">Beta Features</label>
                        </Tooltip>
                        <p className="text-xs text-slate-500 mt-1">Access experimental features</p>
                    </div>
                    <button
                        onClick={() => handleChange("betaFeatures", !settings.betaFeatures)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.betaFeatures ? 'bg-amber-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.betaFeatures ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* Error Reporting */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                        <Tooltip content="Help improve the platform by sending anonymous error reports.">
                            <label className="block text-slate-300 font-medium cursor-help">Error Reporting</label>
                        </Tooltip>
                        <p className="text-xs text-slate-500 mt-1">Send crash reports</p>
                    </div>
                    <button
                        onClick={() => handleChange("errorReporting", !settings.errorReporting)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.errorReporting ? 'bg-blue-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.errorReporting ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* Cache Size */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <Tooltip content="Configure local cache size for market data storage.">
                        <label className="block text-slate-300 font-medium mb-2 cursor-help">Cache Size</label>
                    </Tooltip>
                    <select
                        value={settings.cacheSize}
                        onChange={(e) => handleChange("cacheSize", e.target.value as "small" | "medium" | "large")}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                    >
                        <option value="small">Small (100MB)</option>
                        <option value="medium">Medium (500MB)</option>
                        <option value="large">Large (1GB)</option>
                    </select>
                </div>
            </div>

            {/* Cache Management */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <Tooltip content="Check for the latest software patches, view changelogs, or reset local data.">
                    <h3 className="text-xl font-bold text-white mb-4 cursor-help">Cache Management</h3>
                </Tooltip>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-slate-300 font-medium">Clear Local Data</div>
                        <div className="text-xs text-slate-500">Fixes corrupted charts or settings issues.</div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("Are you sure? This will reset all your settings.")) {
                                resetSettings();
                                window.location.reload();
                            }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Reset
                    </button>
                </div>
            </div>
        </div>
    );

    const renderComingSoon = () => (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
            <Lock size={48} className="text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Pro Feature</h3>
            <p className="text-slate-500 mt-2 text-center max-w-sm">
                Advanced notifications and API keys are available in the Enterprise Plan.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/" className="inline-flex items-center group hover:opacity-100 transition-all mb-4" title="Return to Home">
                            <div className="relative h-14 w-56 transform group-hover:translate-x-1 transition-transform">
                                <Image src="/quantdash_logo.png" alt="Back to Dashboard" fill className="object-contain mix-blend-lighten" style={{ filter: 'contrast(1.5)' }} />
                            </div>
                        </Link>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Command Center
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setHelpSidebarOpen(!helpSidebarOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${helpSidebarOpen
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                                }`}
                        >
                            <HelpCircle size={18} />
                            <span className="hidden md:inline">Help</span>
                        </button>
                        <div className="hidden md:block text-right">
                            <div className="text-xs text-slate-500 uppercase tracking-widest">Settings</div>
                            <div className="font-mono text-cyan-400">v1.4.0</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 relative">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-1">
                            <div className="p-6">
                                <SettingsErrorBoundary>
                                    {activeTab === "risk" && renderRiskSettings()}
                                    {activeTab === "data" && renderDataSettings()}
                                    {activeTab === "system" && renderSystemSettings()}
                                    {activeTab === "visual" && renderVisualSettings()}
                                    {(activeTab === "notify" || activeTab === "security") && renderComingSoon()}
                                </SettingsErrorBoundary>
                            </div>
                        </div>
                    </div>

                    {/* Help Sidebar */}
                    <HelpSidebar
                        activeTab={activeTab}
                        isOpen={helpSidebarOpen}
                        onClose={() => setHelpSidebarOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}
