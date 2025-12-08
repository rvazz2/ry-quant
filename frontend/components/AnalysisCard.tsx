import React from 'react';

interface AnalysisCardProps {
    title: string;
    value: string;
    color: string;
    desc: string;
    insight: string;
}

const AnalysisCard = ({ title, value, color, desc, insight }: AnalysisCardProps) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-200 font-bold text-sm">{title}</h4>
            <span className={`font-mono font-bold ${color}`}>{value}</span>
        </div>
        <p className="text-slate-400 text-xs mb-3 min-h-[2.5em]">{desc}</p>
        <div className="bg-slate-900/50 p-2 rounded border border-slate-800/50">
            <p className="text-slate-300 text-xs italic">
                <span className="text-slate-500 not-italic font-bold mr-1">Insight:</span>
                {insight}
            </p>
        </div>
    </div>
);

export default AnalysisCard;
