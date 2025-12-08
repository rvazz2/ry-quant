import React from 'react';
import { Ship, Truck, AlertTriangle, Globe, Anchor, PackageCheck } from 'lucide-react';

const SupplyChain2025 = () => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                    <Globe className="text-blue-400" />
                    Global Supply Chain Update
                </h3>
                <p className="text-slate-300">
                    Status: <strong>December 2025</strong> • Holiday Peak Season
                </p>
                <div className="mt-4 flex gap-3 text-sm">
                    <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <PackageCheck size={14} /> Peak Season Stable
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <img src="https://flagcdn.com/w20/cn.png" className="w-4 h-3 rounded-sm opacity-80" alt="China" /> High Tariffs
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Ocean & Shipping */}
                <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-2">
                        <Ship className="text-cyan-400" size={18} /> Ocean Freight
                    </h4>
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li>
                            <strong className="block text-white mb-1">Capacity: Stable</strong>
                            Space on vessels from Europe and Asia to the US is currently available.
                        </li>
                        <li>
                            <strong className="block text-white mb-1">Red Sea / Suez</strong>
                            <div className="bg-slate-900/50 p-2 rounded border border-slate-700 mt-1">
                                Major carriers (e.g., Maersk) continue to divert or monitor due to safety, but networks have adjusted.
                            </div>
                        </li>
                    </ul>
                </div>

                {/* 2. Inland Logistics */}
                <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-2">
                        <Truck className="text-indigo-400" size={18} /> Inland Logistics
                    </h4>
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li>
                            <strong className="block text-white mb-1">Ground Pressure</strong>
                            While ocean freight is smooth, trucking and rail face pressure.
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                            <span>Railcar shortages and driver constraints are tightening North American capacity.</span>
                        </li>
                    </ul>
                </div>

                {/* 3. Tariff Landscape */}
                <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700/50 pb-2">
                        <Anchor className="text-rose-400" size={18} /> Trade & Customs
                    </h4>
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li>
                            <strong className="block text-white mb-1">Aggressive Tariffs</strong>
                            2025 has seen new duties up to 25% on Canada/Mexico imports and up to 145% on specific Chinese goods (EVs, Steel).
                        </li>
                        <li>
                            <strong className="block text-white mb-1">CBP Audits</strong>
                            Intensified scrutiny on "de minimis" shipments (Shein/Temu type packages) and Southeast Asia routing.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex gap-4 items-start">
                <div className="bg-slate-800 p-3 rounded-full">
                    <PackageCheck className="text-emerald-400" size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-100 mb-1">Peak Season Status</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        We are in the final shipping weeks for the holiday season. Most major retailers have secured inventory. Parcel networks (UPS, FedEx) are managing high volumes but remain stable.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SupplyChain2025;
