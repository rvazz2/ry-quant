import React from 'react';

interface StatBoxProps {
    label: string;
    value: string | number;
    highlight?: boolean;
    color?: string;
}

const StatBox = React.memo(({ label, value, highlight, color }: StatBoxProps) => (
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <div className="text-xs text-slate-500 mb-1">{label}</div>
        <div className={`text-xl font-extrabold ${color ? color : highlight ? 'text-purple-400' : 'text-white'}`}>
            {value}
        </div>
    </div>
));

StatBox.displayName = 'StatBox';

export default StatBox;
