"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, Wallet, PiggyBank, Calculator, Target, Home } from 'lucide-react';
import { BudgetTab, RetirementTab, TaxTab, LifeTab } from '@/components/planning';

// Force Rebuild: v3
export default function PlanningPage() {
    const [activeTab, setActiveTab] = useState<'level1' | 'level2' | 'level3' | 'level4'>('level1');

    // Shared Data State
    const [salary, setSalary] = useState(65000);
    const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
    const [age, setAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(65);
    const [savingsRate, setSavingsRate] = useState(20);
    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch Profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get('/planning/profile');
                if (res.data) {
                    setSalary(res.data.salary);
                    setFilingStatus(res.data.filing_status);
                    if (res.data.age) setAge(res.data.age);
                    if (res.data.retirement_age) setRetirementAge(res.data.retirement_age);
                    if (res.data.savings_rate) setSavingsRate(res.data.savings_rate);
                }
            } catch (e) {
                console.error("Failed to load profile", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadProfile();
    }, []);

    // Auto-Save (Simple effect with debounce could be better, but this works for low frequency)
    useEffect(() => {
        if (!isLoaded) return;
        const saveTimer = setTimeout(() => {
            api.post('/planning/profile', {
                salary,
                filing_status: filingStatus,
                age,
                retirement_age: retirementAge,
                savings_rate: savingsRate
            }).catch(e => console.error("Auto-save failed", e));
        }, 1000); // 1s debounce
        return () => clearTimeout(saveTimer);
    }, [salary, filingStatus, age, retirementAge, savingsRate, isLoaded]);

    const renderTab = () => {
        switch (activeTab) {
            case 'level1':
                return <BudgetTab salary={salary} setSalary={setSalary} />;
            case 'level2':
                return <LifeTab />;
            case 'level3':
                return <RetirementTab salary={salary} />; // TODO: Pass age/retirementAge if needed by component
            case 'level4':
                return <TaxTab salary={salary} filingStatus={filingStatus} setSalary={setSalary} />;
            default:
                return <BudgetTab salary={salary} setSalary={setSalary} />;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <GraduationCap className="text-cyan-400" size={32} />
                        Financial Freedom Academy
                    </h1>
                    <p className="text-slate-400">The class you should have taken instead of Organic Chemistry.</p>
                </div>

                {/* Profile Settings */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="text-cyan-400" size={20} />
                        Your Strategy Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Current Age</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <span className="absolute right-4 top-2 text-slate-500 text-sm">years</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Retirement Age</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={retirementAge}
                                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <span className="absolute right-4 top-2 text-slate-500 text-sm">years</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Savings Rate</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={savingsRate}
                                    onChange={(e) => setSavingsRate(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <span className="absolute right-4 top-2 text-slate-500 text-sm">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation (Pills) */}
                <div className="flex flex-wrap gap-4 mb-8 border-b border-slate-800 pb-4">
                    <button
                        onClick={() => setActiveTab('level1')}
                        className={`group flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'level1'
                            ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                            : 'bg-transparent text-slate-400 border border-slate-700 hover:border-cyan-500/50 hover:text-white'
                            }`}
                    >
                        <Wallet size={18} className={activeTab === 'level1' ? 'text-slate-900' : 'text-slate-500 group-hover:text-cyan-400'} />
                        LEVEL 1: Calculated Survival
                    </button>

                    <button
                        onClick={() => setActiveTab('level2')}
                        className={`group flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'level2'
                            ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                            : 'bg-transparent text-slate-400 border border-slate-700 hover:border-cyan-500/50 hover:text-white'
                            }`}
                    >
                        <Home size={18} className={activeTab === 'level2' ? 'text-slate-900' : 'text-slate-500 group-hover:text-cyan-400'} />
                        LEVEL 2: Big Life Decisions
                    </button>

                    <button
                        onClick={() => setActiveTab('level3')}
                        className={`group flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'level3'
                            ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                            : 'bg-transparent text-slate-400 border border-slate-700 hover:border-cyan-500/50 hover:text-white'
                            }`}
                    >
                        <Target size={18} className={activeTab === 'level3' ? 'text-slate-900' : 'text-slate-500 group-hover:text-cyan-400'} />
                        LEVEL 3: Wealth Acceleration
                    </button>

                    <button
                        onClick={() => setActiveTab('level4')}
                        className={`group flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'level4'
                            ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                            : 'bg-transparent text-slate-400 border border-slate-700 hover:border-cyan-500/50 hover:text-white'
                            }`}
                    >
                        <Calculator size={18} className={activeTab === 'level4' ? 'text-slate-900' : 'text-slate-500 group-hover:text-cyan-400'} />
                        LEVEL 4: Tax Strategy
                    </button>

                </div>
                {/* Note: TaxTab is preserved but currently not linked in the 3-level flow requested. 
                    Could be added as a utility or Level 4 later. */}

                {/* Tab Content */}
                <div className="min-h-[600px]">
                    {renderTab()}
                </div>
            </div>
        </DashboardLayout>
    );
}
