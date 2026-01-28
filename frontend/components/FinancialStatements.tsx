"use client";

import React, { useState } from 'react';
import { Financials, FinancialStatementItem } from '@/lib/types';
import { FileText, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    data: Financials;
}

const FinancialStatements: React.FC<Props> = ({ data }) => {
    const [activeTab, setActiveTab] = useState("income");

    if (!data) return null;

    const formatCurrency = (val: number | string) => {
        if (typeof val === 'string') return val;
        if (val === 0) return <span className="text-slate-600">-</span>;
        if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
        if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
        return `$${val.toLocaleString()}`;
    };

    // Helper to identify key rows for highlighting
    const isKeyMetric = (key: string) => {
        const keyMetrics = [
            "Total Revenue", "Gross Profit", "Net Income", "EBITDA", "Free Cash Flow",
            "Operating Cash Flow", "Total Assets", "Total Debt", "Stockholders Equity"
        ];
        return keyMetrics.includes(key);
    };

    const renderTable = (items: FinancialStatementItem[], keys: string[]) => {
        if (!items || items.length === 0) return <div className="text-slate-400 p-8 text-center italic">No data available for this view.</div>;

        const rowKeys = keys.length > 0 ? keys : Object.keys(items[0]).filter(k => k !== 'date');

        return (
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                            <th className="px-6 py-4 font-semibold text-left min-w-[200px]">Metric</th>
                            {items.map((item, idx) => (
                                <th key={idx} className="px-6 py-4 font-semibold text-right min-w-[100px]">
                                    {new Date(item.date).getFullYear()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {rowKeys.map((key, idx) => {
                            const isKey = isKeyMetric(key);
                            return (
                                <tr
                                    key={key}
                                    className={`group transition-colors ${idx % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'
                                        } hover:bg-slate-800/40 ${isKey ? 'bg-slate-800/20' : ''}`}
                                >
                                    <td className={`px-6 py-3.5 transition-colors ${isKey
                                            ? 'font-bold text-white border-l-2 border-cyan-500/50 pl-[22px]'
                                            : 'font-medium text-slate-300 group-hover:text-slate-200 border-l-2 border-transparent'
                                        }`}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </td>
                                    {items.map((item, i) => (
                                        <td key={i} className={`px-6 py-3.5 font-mono text-right tabular-nums transition-colors ${isKey ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                                            }`}>
                                            {formatCurrency(item[key] || 0)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const tabs = [
        { id: 'income', label: 'Income', icon: DollarSign },
        { id: 'balance', label: 'Balance Sheet', icon: FileText },
        { id: 'cashflow', label: 'Cash Flow', icon: Activity },
    ];

    const incomeKeys = [
        "Total Revenue", "Cost Of Revenue", "Gross Profit", "Operating Income",
        "Net Income", "EBITDA", "Basic EPS", "Diluted EPS"
    ];

    const balanceKeys = [
        "Total Assets", "Total Current Assets", "Cash And Cash Equivalents",
        "Total Liabilities Net Minority Interest", "Total Current Liabilities", "Total Debt",
        "Stockholders Equity"
    ];

    const cashFlowKeys = [
        "Operating Cash Flow", "Investing Cash Flow", "Financing Cash Flow",
        "Capital Expenditure", "Free Cash Flow"
    ];

    return (
        <div className="glass-panel w-full mt-8 overflow-hidden rounded-2xl border border-white/5 shadow-2xl relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/20 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg border border-white/5 text-cyan-400">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        Financial Statements
                    </h3>
                </div>

                <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-white/10 shadow-inner">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${isActive
                                    ? 'text-cyan-950'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon size={14} className={isActive ? 'text-cyan-950' : 'text-slate-500'} />
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-slate-900/10 min-h-[400px] relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'income' && renderTable(data.income_statement, incomeKeys)}
                        {activeTab === 'balance' && renderTable(data.balance_sheet, balanceKeys)}
                        {activeTab === 'cashflow' && renderTable(data.cash_flow, cashFlowKeys)}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FinancialStatements;
