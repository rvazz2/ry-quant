"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCompanyInfo, getMarketOverview } from '@/lib/api';
import dynamic from 'next/dynamic';

const PriceChart = dynamic(() => import('../PriceChart'), { loading: () => <span className="text-amber-500 animate-pulse">LOADING CHART DATA...</span>, ssr: false });

interface TerminalLine {
    type: 'input' | 'output' | 'error' | 'system' | 'component' | 'news';
    content: React.ReactNode;
    timestamp: string;
}

export default function TerminalInterface() {
    const router = useRouter();
    const [lines, setLines] = useState<TerminalLine[]>([
        { type: 'system', content: 'QUANTDASH OS v3.1 [CONNECTED]', timestamp: new Date().toLocaleTimeString() },
        { type: 'system', content: 'COPYRIGHT (C) 2025 QUANTDASH LP. ALL RIGHTS RESERVED.', timestamp: new Date().toLocaleTimeString() },
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    // Focus input on click
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleCommand = async (cmdString: string) => {
        const cmd = cmdString.trim();
        if (!cmd) return;

        const timestamp = new Date().toLocaleTimeString();
        setLines(prev => [...prev, { type: 'input', content: cmd.toUpperCase(), timestamp } as TerminalLine].slice(-50));
        setIsProcessing(true);

        const parts = cmd.split(' ');
        let command = parts[0].toUpperCase();
        let args = parts.slice(1);

        // Smart Ticker Detection
        const keywords = ['HELP', 'CLEAR', 'CLS', 'EXIT', 'WEI', 'GP', 'DES', 'CN', 'TOP', 'MENU'];
        if (!keywords.includes(command) && /^[A-Z]{1,5}$/.test(command)) {
            args = [command];
            command = 'DES';
        }

        const commandPromise = async () => {
            switch (command) {
                case 'HELP':
                case 'MENU':
                    setLines(prev => [...prev, {
                        type: 'output',
                        content: (
                            <div className="space-y-1 font-mono text-sm max-w-2xl">
                                <div className="text-amber-500 border-b border-amber-500/30 pb-1 mb-2">MASTER COMMAND INDEX</div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-green-400">TOP</span>     <span className="text-white">Top Market News & Headlines</span>
                                    <span className="text-green-400">WEI</span>     <span className="text-white">World Equity Indices (Global Dashboard)</span>
                                    <span className="text-green-400">GP</span>      <span className="text-white">Graph Price (e.g. &quot;GP AAPL&quot;)</span>
                                    <span className="text-green-400">DES</span>     <span className="text-white">Security Description (e.g. &quot;NVDA&quot; or &quot;DES NVDA&quot;)</span>
                                    <span className="text-green-400">CN</span>      <span className="text-white">Company News (e.g. &quot;CN TSLA&quot;)</span>
                                    <span className="text-green-400">CLEAR</span>   <span className="text-white">Clear Screen</span>
                                    <span className="text-green-400">EXIT</span>    <span className="text-white">Logout / Return to GUI</span>
                                </div>
                            </div>
                        ),
                        timestamp
                    }]);
                    break;

                case 'CLEAR':
                case 'CLS':
                    setLines([]);
                    break;

                case 'EXIT':
                    router.push('/');
                    break;

                case 'WEI':
                    setLines(prev => [...prev, { type: 'system', content: 'RETRIEVING GLOBAL INDICES...', timestamp: new Date().toLocaleTimeString() }]);
                    const overview = await getMarketOverview();
                    setLines(prev => [...prev, {
                        type: 'component',
                        content: (
                            <div className="border border-slate-700 bg-slate-900 overflow-hidden w-full max-w-2xl mt-2">
                                <div className="bg-amber-600 px-2 py-1 text-black font-bold text-xs flex justify-between">
                                    <span>WEI - WORLD EQUITY INDICES</span>
                                    <span>[REAL-TIME]</span>
                                </div>
                                <div className="grid grid-cols-4 bg-slate-800 text-xs font-bold text-amber-500 p-1 border-b border-slate-700">
                                    <div>TICKER</div>
                                    <div className="text-right">PRICE</div>
                                    <div className="text-right">CHG</div>
                                    <div className="text-right">%CHG</div>
                                </div>
                                <div className="divide-y divide-slate-800">
                                    {overview.map((item: { symbol: string; name: string; price: number; change: number }, i: number) => (
                                        <div key={item.symbol || i} className="grid grid-cols-4 p-1 text-xs hover:bg-slate-800/50 font-mono cursor-default">
                                            <div className="text-green-400">{item.name.substring(0, 15)}</div>
                                            <div className="text-right text-white">{item.price.toFixed(2)}</div>
                                            <div className={`text-right ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                                            </div>
                                            <div className={`text-right ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    break;

                case 'GP':
                    if (args.length === 0) throw new Error("USAGE: GP <TICKER>");
                    const tickerGp = args[0].toUpperCase();
                    setLines(prev => [...prev, { type: 'system', content: `LOADING PRICE ACTION: ${tickerGp}...`, timestamp: new Date().toLocaleTimeString() }]);
                    const dataGp = await getCompanyInfo(tickerGp);
                    if (!dataGp) throw new Error(`TICKER NOT FOUND: ${tickerGp}`);

                    setLines(prev => [...prev, {
                        type: 'component',
                        content: (
                            <div className="border border-slate-700 bg-slate-950 w-full max-w-3xl mt-2">
                                <div className="bg-amber-600 px-2 py-1 text-black font-bold text-xs flex justify-between">
                                    <span>GP - GRAPH PRICE: {dataGp.name.toUpperCase()}</span>
                                    <span>{dataGp.currency || 'USD'}</span>
                                </div>
                                <div className="h-64 md:h-80 p-2 relative">
                                    <PriceChart symbol={dataGp.symbol} initialData={dataGp.chart_data} prevClose={dataGp.prev_close} />
                                </div>
                            </div>
                        ),
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    break;

                case 'DES':
                    if (args.length === 0) throw new Error("USAGE: DES <TICKER>");
                    const tickerDes = args[0].toUpperCase();
                    setLines(prev => [...prev, { type: 'system', content: `FETCHING SECURITY DESCRIPTION: ${tickerDes}...`, timestamp: new Date().toLocaleTimeString() }]);
                    const dataDes = await getCompanyInfo(tickerDes);
                    if (!dataDes) throw new Error(`TICKER NOT FOUND: ${tickerDes}`);

                    setLines(prev => [...prev, {
                        type: 'component',
                        content: (
                            <div className="border border-slate-700 bg-slate-900 w-full max-w-3xl font-mono text-xs mt-2">
                                <div className="bg-amber-600 px-2 py-1 text-black font-bold">
                                    DES - SECURITY DESCRIPTION: {dataDes.symbol}
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-amber-500 font-bold text-lg mb-2">{dataDes.name}</div>
                                        <div className="text-white mb-4 leading-relaxed">{dataDes.summary.length > 300 ? dataDes.summary.substring(0, 300) + "..." : dataDes.summary}</div>

                                        <div className="grid grid-cols-[100px_1fr] gap-1">
                                            <span className="text-green-500">SECTOR</span> <span className="text-white">{dataDes.sector}</span>
                                            <span className="text-green-500">INDUSTRY</span> <span className="text-white">{dataDes.industry}</span>
                                        </div>
                                    </div>
                                    <div className="border border-slate-700 p-2 bg-black">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-green-500 text-right">PRICE</div> <div className="text-white text-right font-bold bg-slate-800 px-1">{dataDes.current_price}</div>
                                            <div className="text-green-500 text-right">MKT CAP</div> <div className="text-white text-right">{(dataDes.market_cap / 1e9).toFixed(1)}B</div>
                                            <div className="text-green-500 text-right">P/E</div> <div className="text-white text-right">{dataDes.pe_ratio?.toFixed(2) || 'N/A'}</div>
                                            <div className="text-green-500 text-right">DIV YLD</div> <div className="text-white text-right">{(dataDes.dividend_yield ? (dataDes.dividend_yield * 100).toFixed(2) : '0.00')}%</div>
                                            <div className="text-green-500 text-right">52W HIGH</div> <div className="text-white text-right">{dataDes.fifty_two_week_high}</div>
                                            <div className="text-green-500 text-right">52W LOW</div> <div className="text-white text-right">{dataDes.fifty_two_week_low}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ),
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    break;

                case 'CN':
                case 'TOP':
                    const tickerNews = command === 'TOP' ? 'SPY' : (args[0] || 'SPY').toUpperCase();
                    setLines(prev => [...prev, { type: 'system', content: `FETCHING WIRES FOR ${tickerNews}...`, timestamp: new Date().toLocaleTimeString() }]);
                    const dataNews = await getCompanyInfo(tickerNews);

                    interface NewsItem {
                        title: string;
                        link: string;
                        providerPublishTime: number;
                        publisher: string;
                    }


                    if (!dataNews?.news || dataNews.news.length === 0) {
                        throw new Error("NO HEADLINES FOUND - CHECK CONNECTION");
                    }

                    setLines(prev => [...prev, {
                        type: 'component',
                        content: (
                            <div className="border border-slate-700 bg-slate-900 w-full max-w-3xl font-mono text-xs mt-2">
                                <div className="bg-red-600 px-2 py-1 text-white font-bold animate-pulse">
                                    {command === 'TOP' ? 'TOP - TOP BREAKING NEWS' : `CN - COMPANY NEWS: ${tickerNews}`}
                                </div>
                                <div className="divide-y divide-slate-800">
                                    {(dataNews.news as NewsItem[]).map((news, i) => (
                                        <div key={i} className="p-2 hover:bg-slate-800 cursor-pointer flex gap-4 group">
                                            <div className="text-amber-500 whitespace-nowrap hidden sm:block w-20">
                                                {new Date(news.providerPublishTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div>
                                                <a href={news.link} target="_blank" rel="noreferrer" className="text-white group-hover:text-cyan-400 group-hover:underline font-bold uppercase block transition-colors">
                                                    {news.title}
                                                </a>
                                                <div className="text-slate-500 mt-1">{news.publisher}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ),
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    break;

                default:
                    throw new Error(`UNKNOWN FUNCTION: ${command}. TYPE 'HELP' FOR DIRECTORY.`);
            }
        };

        try {
            await Promise.race([
                commandPromise(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("REQUEST TIMED OUT - DATA SOURCE UNRESPONSIVE")), 15000))
            ]);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "SYSTEM ERROR";
            setLines(prev => [...prev, { type: 'error', content: errorMessage, timestamp: new Date().toLocaleTimeString() }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isProcessing) {
            handleCommand(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-black border-x-4 border-slate-900 shadow-2xl overflow-hidden text-amber-500 font-mono text-sm selection:bg-amber-500/30 selection:text-white" onClick={() => inputRef.current?.focus()}>
            {/* Bloomberg Header */}
            <div className="flex justify-between items-center bg-slate-900 border-b border-slate-700 p-1 select-none text-xs shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="mr-2 hover:brightness-125 transition-all">
                        <img src="/quantdash_logo.png" alt="QuantDash" className="h-12 w-auto object-contain mix-blend-screen drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                    </Link>
                    <span className="bg-amber-600 text-black font-bold px-2 rounded-sm">1-BLOOMBERG</span>
                    <span className="text-cyan-400">QUANTDASH TERMINAL</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <span className="text-green-500 hidden sm:inline">S&P 500: <span className="text-white animate-pulse">LIVE</span></span>
                    <div>NY: {new Date().toLocaleTimeString()}</div>
                </div>
            </div>

            {/* Output Area */}
            <div className="flex-1 overflow-y-auto space-y-1 p-2 font-mono scrollbar-none">
                {lines.map((line, i) => (
                    <div key={i} className="flex gap-2">
                        {line.type !== 'component' && <span className="text-slate-600 shrink-0 select-none text-xs">[{line.timestamp}]</span>}
                        <div className={`w-full break-words ${line.type === 'error' ? 'text-red-500 font-bold' :
                            line.type === 'input' ? 'text-white' :
                                line.type === 'system' ? 'text-amber-500' : 'text-amber-500'
                            }`}>
                            {line.type === 'input' && <span className="text-amber-500 mr-2">{'>'}</span>}
                            {line.content}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Command Line Input */}
            <div className="flex items-center gap-2 border-t border-slate-700 p-2 bg-slate-900 shrink-0">
                <span className="text-amber-500 font-bold">{'>'}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={isProcessing}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-600 disabled:opacity-50 uppercase shadow-none font-bold"
                    placeholder={isProcessing ? "PROCESSING..." : "ENTER COMMAND OR TICKER..."}
                    autoComplete="off"
                    autoFocus
                />
            </div>
        </div>
    );
}
