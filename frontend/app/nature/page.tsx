"use client";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Leaf, TreePine, Mountain, Sun, Cloud, Wind } from 'lucide-react';

export default function NatureBreakPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-4">
                        <Leaf className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 mb-3">
                        Nature Break
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Tired of finance? Take a moment to relax. Studies show viewing nature scenes reduces stress and improves focus.
                    </p>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="group relative overflow-hidden rounded-2xl border border-[#333] hover:border-green-500/50 transition-all duration-500 shadow-xl">
                        <div className="aspect-video relative">
                            <img
                                src="/images/nature/nature-2.jpg"
                                alt="Stadium View"
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                <div>
                                    <span className="text-white text-lg font-semibold">Clear Skies</span>
                                    <p className="text-gray-300 text-sm">Sometimes the best views are at the places we love</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl border border-[#333] hover:border-green-500/50 transition-all duration-500 shadow-xl">
                        <div className="aspect-video relative">
                            <img
                                src="/images/nature/nature-3.jpg"
                                alt="Sunset Road"
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                <div>
                                    <span className="text-white text-lg font-semibold">Golden Hour</span>
                                    <p className="text-gray-300 text-sm">The quiet beauty of an empty road at sunset</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breathing Exercise */}
                <div className="max-w-2xl mx-auto mt-12">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-green-500/20 text-center">
                        <h3 className="text-green-300 font-semibold mb-3 flex items-center justify-center gap-2">
                            <Wind className="w-5 h-5" /> Quick Breathing Exercise
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.
                        </p>
                        <div className="flex items-center justify-center gap-8 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">4s</div>
                                <div className="text-gray-500">Inhale</div>
                            </div>
                            <div className="text-gray-600">→</div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-400">7s</div>
                                <div className="text-gray-500">Hold</div>
                            </div>
                            <div className="text-gray-600">→</div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-teal-400">8s</div>
                                <div className="text-gray-500">Exhale</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
                    <div className="p-4 rounded-xl bg-[#111] border border-[#222] hover:border-green-500/30 transition-colors">
                        <TreePine className="w-6 h-6 text-green-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">Step Away</h4>
                        <p className="text-gray-500 text-xs">A 5-minute break every hour boosts productivity by 15%.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#111] border border-[#222] hover:border-green-500/30 transition-colors">
                        <Sun className="w-6 h-6 text-amber-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">Get Sunlight</h4>
                        <p className="text-gray-500 text-xs">Natural light helps regulate cortisol and improve mood.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#111] border border-[#222] hover:border-green-500/30 transition-colors">
                        <Mountain className="w-6 h-6 text-blue-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">Change Scenery</h4>
                        <p className="text-gray-500 text-xs">Different environments spark creativity and fresh thinking.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
