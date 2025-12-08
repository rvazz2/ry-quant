"use client";

import React, { useState } from 'react';
import { Financials, FinancialStatementItem } from '@/lib/types';

interface Props {
    data: Financials;
}

const FinancialStatements: React.FC<Props> = ({ data }) => {
    const [activeTab, setActiveTab] = useState("income");

    if (!data) return null;

    const formatCurrency = (val: number | string) => {
        if (typeof val === 'string') return val;
        if (val === 0) return "-";
        if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
        if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
        return `$${val.toLocaleString()}`;
    };

    const renderTable = (items: FinancialStatementItem[], keys: string[]) => {
        if (!items || items.length === 0) return <div className="text-slate-400 p-4">No data available</div>;

        const rowKeys = keys.length > 0 ? keys : Object.keys(items[0]).filter(k => k !== 'date');

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300 border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                            <th className="px-6 py-4 font-semibold text-left">Metric</th>
                            {items.map((item, idx) => (
                                <th key={idx} className="px-6 py-4 font-semibold text-right">
                                    {new Date(item.date).getFullYear()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {rowKeys.map((key) => (
                            <tr key={key} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-3 font-medium text-slate-300 group-hover:text-white transition-colors">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </td>
                                {items.map((item, idx) => (
                                    <td key={idx} className="px-6 py-3 font-mono text-slate-400 text-right tabular-nums group-hover:text-slate-200">
                                        {formatCurrency(item[key] || 0)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

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
        <div className="glass-panel w-full mt-6 overflow-hidden rounded-xl border border-slate-800/60 shadow-xl">
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Financial Statements
                </h3>

                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {['income', 'balance', 'cashflow'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide ${activeTab === tab
                                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/50'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                                }`}
                        >
                            {tab === 'income' ? 'Income' : tab === 'balance' ? 'Balance Sheet' : 'Cash Flow'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/20">
                {activeTab === 'income' && renderTable(data.income_statement, incomeKeys)}
                {activeTab === 'balance' && renderTable(data.balance_sheet, balanceKeys)}
                {activeTab === 'cashflow' && renderTable(data.cash_flow, cashFlowKeys)}
            </div>
        </div>
    );
};

export default FinancialStatements;
