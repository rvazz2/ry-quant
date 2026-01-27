"use client";

import React from 'react';
import { X, HelpCircle, Shield, Globe, Cpu, Layout } from 'lucide-react';

interface HelpSidebarProps {
    activeTab: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpSidebar({ activeTab, isOpen, onClose }: HelpSidebarProps) {
    const getHelpContent = () => {
        switch (activeTab) {
            case "risk":
                return {
                    icon: <Shield className="text-red-400" size={24} />,
                    title: "Risk & Execution",
                    description: "Control your exposure. Set default lot sizes, maximum loss limits per day, and toggle 'one-click' trading protections.",
                    sections: [
                        {
                            title: "Fat Finger Protection",
                            content: "The maximum order value acts as a safety net, preventing accidentally large orders that could devastate your account. Orders above this threshold will be automatically blocked."
                        },
                        {
                            title: "Daily Loss Limits",
                            content: "Protect yourself from catastrophic losses. When your daily loss exceeds this limit, all trading will be automatically paused until the next trading session."
                        },
                        {
                            title: "Default Stop Loss & Take Profit",
                            content: "Set your default risk/reward parameters. These values will be automatically applied to new positions unless manually overridden, ensuring consistent risk management."
                        },
                        {
                            title: "Slippage Tolerance",
                            content: "Define the maximum acceptable difference between your order price and execution price. Orders exceeding this slippage will be rejected to protect against poor fills."
                        },
                        {
                            title: "Position Sizing",
                            content: "Choose how position sizes are calculated: Fixed (same dollar amount), Percentage (% of portfolio), or Kelly Criterion (mathematically optimal sizing based on edge)."
                        }
                    ]
                };
            case "data":
                return {
                    icon: <Globe className="text-cyan-400" size={24} />,
                    title: "Data & Regional",
                    description: "Localize your dashboard. Select your primary exchange region, adjust time stamps to your local time, and choose number formats.",
                    sections: [
                        {
                            title: "Currency & Exchange",
                            content: "Select your base reporting currency. All portfolio values, P&L, and performance metrics will be displayed in this currency."
                        },
                        {
                            title: "Time Zone Settings",
                            content: "Choose between your local time or exchange time (EST for US markets). This affects all timestamps, charts, and economic event displays."
                        },
                        {
                            title: "Number & Date Formats",
                            content: "Customize how numbers and dates are displayed. US format uses commas (1,000.00) while EU uses periods (1.000,00). Choose what feels natural to you."
                        },
                        {
                            title: "Data Streaming Mode",
                            content: "Real-time mode uses WebSocket connections for instant updates (50+ per second), ideal for active trading. Data Saver mode polls every 5 seconds, reducing bandwidth for mobile users."
                        },
                        {
                            title: "Market Data Sources",
                            content: "Choose your preferred data feed: Primary (fastest), Backup (fallback), or Aggregated (combines multiple sources for accuracy)."
                        }
                    ]
                };
            case "system":
                return {
                    icon: <Cpu className="text-purple-400" size={24} />,
                    title: "System & Updates",
                    description: "Keep the platform running smoothly. Check for the latest software patches, view changelogs, or reset local data.",
                    sections: [
                        {
                            title: "System Monitor",
                            content: "Real-time performance metrics including FPS (frames per second), memory usage, network latency, and session uptime. Use this to diagnose performance issues."
                        },
                        {
                            title: "Auto-Update",
                            content: "When enabled, the platform will automatically download and install updates. Disable if you prefer to manually control when updates are applied."
                        },
                        {
                            title: "Beta Features",
                            content: "Access cutting-edge features before they're officially released. Note: Beta features may be unstable and could contain bugs."
                        },
                        {
                            title: "Error Reporting",
                            content: "Help improve the platform by sending anonymous crash reports and error logs to our development team. No personal data or trading information is ever transmitted."
                        },
                        {
                            title: "Cache Management",
                            content: "Clear local data to fix corrupted charts, settings issues, or other anomalies. This will reset all settings to defaults and clear cached market data."
                        }
                    ]
                };
            case "visual":
                return {
                    icon: <Layout className="text-blue-400" size={24} />,
                    title: "Visual Density",
                    description: "Customize your view. Switch to Compact to see more rows of data at once, or Comfortable for easier reading with more spacing.",
                    sections: [
                        {
                            title: "Layout Density",
                            content: "Comfortable mode provides more whitespace and larger text for easier reading. Compact mode (Bloomberg-style) maximizes information density, perfect for multi-monitor setups."
                        },
                        {
                            title: "Row Height & Spacing",
                            content: "Adjust the vertical spacing of tables and lists. Smaller heights fit more data on screen, while larger heights improve readability."
                        },
                        {
                            title: "Font Size",
                            content: "Customize the base font size for the entire platform. This affects all text except charts. Useful for high-DPI displays or vision accessibility."
                        },
                        {
                            title: "Chart Color Theme",
                            content: "Standard uses traditional green/red. Colorblind Safe uses blue/orange for accessibility. Hollow Candles show price action with unfilled bars."
                        }
                    ]
                };
            default:
                return null;
        }
    };

    const content = getHelpContent();
    if (!content) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed right-0 top-0 h-full
                w-80 md:w-96 bg-slate-950 border-l border-slate-800
                transition-transform duration-300 ease-in-out z-50
                shadow-2xl shadow-black
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="h-full overflow-y-auto p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            {content.icon}
                            <div>
                                <h3 className="text-lg font-bold text-white">{content.title}</h3>
                                <p className="text-xs text-slate-400 mt-1">Detailed Guide</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors p-1"
                            aria-label="Close help sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Description */}
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg mb-6">
                        <div className="flex items-start gap-2">
                            <HelpCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {content.description}
                            </p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-4">
                        {content.sections.map((section, index) => (
                            <div
                                key={index}
                                className="p-4 bg-slate-900/30 border border-slate-800/50 rounded-lg hover:border-slate-700 transition-colors"
                            >
                                <h4 className="text-sm font-bold text-white mb-2">
                                    {section.title}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Footer tip */}
                    <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <p className="text-xs text-cyan-400 text-center">
                            💡 Hover over any setting for quick tips
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
