"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface BeneishData {
    m_score: number;
    manipulator: boolean;
    details: {
        DSRI: number;
        GMI: number;
        AQI: number;
        SGI: number;
        DEPI: number;
        SGAI: number;
        LVGI: number;
        TATA: number;
    };
    ticker: string;
}

const FraudDetector = ({ ticker }: { ticker: string }) => {
    const [data, setData] = useState<BeneishData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = React.useCallback(async () => {
        if (!ticker) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8000/api/accounting/beneish/${ticker}`);
            if (!res.ok) throw new Error("Fetch failed");
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
            setError("Failed to fetch data. Please check ticker.");
        } finally {
            setLoading(false);
        }
    }, [ticker]);

    React.useEffect(() => {
        analyze();
    }, [analyze]);

    return (
        <div className="glass-panel p-6 border-l-4 border-rose-500 space-y-6 h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <AlertTriangle className="text-rose-500" />
                        Beneish M-Score
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Probabilistic model to detect earnings manipulation.
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                    <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Analyzing Accounting Quality...</span>
                </div>
            )}

            {error && <div className="text-rose-400 text-sm p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2"><AlertTriangle size={16} />{error}</div>}

            {data && !loading && <FraudResults data={data} />}
        </div>
    );
};

const FraudResults = React.memo(({ data }: { data: BeneishData }) => {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className={`p-4 rounded-xl border ${data.manipulator ? 'bg-red-500/20 border-red-500' : 'bg-emerald-500/20 border-emerald-500'} flex items-center justify-between`}>
                <div>
                    <div className="text-sm font-bold uppercase opacity-80 mb-1">M-Score</div>
                    <div className="text-4xl font-black">{data.m_score.toFixed(3)}</div>
                </div>
                <div className="flex items-center gap-2">
                    {data.manipulator ? (
                        <>
                            <AlertTriangle size={32} className="text-red-500" />
                            <div className="text-right">
                                <div className="font-bold text-red-400">High Probability</div>
                                <div className="text-xs text-red-300">of Manipulation</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={32} className="text-emerald-500" />
                            <div className="text-right">
                                <div className="font-bold text-emerald-400">Low Probability</div>
                                <div className="text-xs text-emerald-300">of Manipulation</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.details).map(([key, value]) => (
                    <div key={key} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">{key}</div>
                        <div className={`text-lg font-bold ${value > 1.2 ? 'text-amber-400' : 'text-slate-300'}`}>
                            {value.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
FraudResults.displayName = 'FraudResults';


export default FraudDetector;
