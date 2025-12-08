import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lightbulb, ShieldCheck, Layers, Cpu, Globe, AlertTriangle } from 'lucide-react';

const CryptoEducation = () => {
    const [activeTab, setActiveTab] = useState('essentials');

    const tabs = [
        { id: 'essentials', label: 'Start Here', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'defi', label: 'DeFi Ecosystem', icon: <Layers className="w-4 h-4" /> },
        { id: 'risks', label: 'Security & Risks', icon: <ShieldCheck className="w-4 h-4" /> }
    ];

    return (
        <Card className="bg-[#111] border-[#222] overflow-hidden">
            <CardHeader className="border-b border-[#222]/50 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <CardTitle className="text-gray-200 flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Cpu className="w-6 h-6" />
                        </div>
                        Crypto Command Academy
                    </CardTitle>

                    {/* Custom Tab Switcher */}
                    <div className="flex p-1 bg-[#1A1A1A] rounded-lg border border-[#333]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                                    ${activeTab === tab.id
                                        ? 'bg-[#2A2A2A] text-white shadow-lg shadow-black/50 border border-[#333]'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'
                                    }
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 min-h-[400px]">
                {/* Tab Content: Essentials */}
                <div className={`${activeTab === 'essentials' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}`}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/10 to-blue-900/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                                <h3 className="text-indigo-300 font-semibold mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" /> What is Crypto?
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Cryptocurrency is digital money that doesn't rely on any central authority, like a government or bank, to uphold or maintain it. Instead, it relies on a distributed public ledger called a <strong>Blockchain</strong> to verify transactions.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/10 to-pink-900/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                                <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                                    <Globe className="w-5 h-5" /> Why does it matter?
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    It solves the "double-spend" problem without a middleman. For the first time, you can send value globally as easily as sending an email, 24/7, with full transparency and often lower fees than traditional banking.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Core Concepts</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: "Blockchain", desc: "A shared, immutable ledger that records transactions." },
                                    { title: "Private Key", desc: "Your digital signature. If you lose this, you lose your funds." },
                                    { title: "Mining/Staking", desc: "How the network is secured and new coins are created." }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-[#151515] border border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors group">
                                        <div className="text-sm font-bold text-gray-200 group-hover:text-indigo-400 mb-2">{item.title}</div>
                                        <div className="text-xs text-gray-500">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Content: DeFi */}
                <div className={`${activeTab === 'defi' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}`}>
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/10 to-teal-900/10 border border-emerald-500/20">
                            <h3 className="text-emerald-400 font-semibold text-lg mb-2">Decentralized Finance (DeFi)</h3>
                            <p className="text-gray-400 text-sm max-w-2xl">
                                Recreating traditional financial systems (lending, borrowing, trading) with autonomous code called <strong>Smart Contracts</strong>. No banks, no paperwork, just code.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-400 border-l-2 border-emerald-500 pl-3">Popular Use Cases</h4>
                                <ul className="space-y-3">
                                    {[
                                        { name: "DEX (Uniswap)", desc: "Trade tokens directly with others. No signup required." },
                                        { name: "Lending (Aave)", desc: "Deposit crypto to earn interest, or borrow against it." },
                                        { name: "Stablecoins (USDC)", desc: "Crypto pegged to the US Dollar for stability." }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1A1A1A] transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-200">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.desc}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-400 border-l-2 border-purple-500 pl-3">Yield Farming 101</h4>
                                <div className="p-4 rounded-xl bg-[#151515] border border-[#333] text-sm text-gray-400 space-y-3">
                                    <p>
                                        <span className="text-white font-bold">Liquidity Mining:</span> providing two tokens (e.g., ETH + USDC) to a DEX to help others trade. You earn trading fees + extra token rewards.
                                    </p>
                                    <div className="h-px bg-[#333]" />
                                    <p>
                                        <span className="text-amber-400 font-bold">Warning:</span> Impermanent Loss happens if one token's price changes drastically compared to the other while provided as liquidity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Content: Risks */}
                <div className={`${activeTab === 'risks' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'}`}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 rounded-2xl bg-red-900/10 border border-red-500/20">
                                <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Major Risks
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li className="flex gap-2">
                                        <span className="text-red-500">•</span>
                                        <span><strong>Smart Contract Bugs:</strong> Code flaws can be exploited by hackers to drain funds.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500">•</span>
                                        <span><strong>Rug Pulls:</strong> Developers abandoning a project and taking all the money.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500">•</span>
                                        <span><strong>Volatility:</strong> Prices can drop 50%+ in a single day. Only invest what you can lose.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-5 rounded-2xl bg-blue-900/10 border border-blue-500/20">
                                <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" /> Best Practices
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li className="flex gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>Hardware Wallet:</strong> Use a Ledger or Trezor for large amounts (Cold Storage).</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>Revoke Permissions:</strong> Regularly check and revoke contract allowances.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>DYOR:</strong> Do Your Own Research. Don't blindly follow influencers.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CryptoEducation;
