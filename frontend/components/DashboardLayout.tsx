"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Activity, Calculator, Search, Settings, SquareTerminal, BookOpen, BrainCircuit, Bitcoin, Menu, X, GraduationCap, HardDrive, FileSpreadsheet, Command, Zap, FileText } from 'lucide-react';
import { SearchResult } from '@/lib/types';
import MarketStatus from './MarketStatus';
import ErrorBoundary from './ErrorBoundary';
import { useSettings } from "@/contexts/SettingsContext";
import ConnectionStatus from './ConnectionStatus';
import { CosmicBackground } from './ui/CosmicBackground';
import Fuse from 'fuse.js';
import { LIBRARY_TOPICS } from '@/lib/library-data';
import { useRouter } from 'next/navigation';
import { CommandMenu } from './CommandMenu';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const SidebarContent = () => {
    const { updateAvailable, setLibraryOpen } = useSettings();

    return (
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2 px-3 neon-text-shadow-sm flex items-center justify-between">
                <span>Platform</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            </div>

            <NavItem href="/dashboard?view=overview" icon={<LayoutDashboard size={18} className="text-sky-400" />} label="Overview" />
            <NavItem href="/crypto" icon={<Bitcoin size={18} className="text-orange-400" />} label="Crypto Command" />
            <NavItem href="/research" icon={<Search size={18} className="text-violet-400" />} label="Stock Research" />
            <NavItem href="/macro" icon={<Activity size={18} className="text-rose-400" />} label="Tharunomics" />
            <NavItem href="/valuation" icon={<Calculator size={18} className="text-emerald-400" />} label="Valuation Sandbox" />

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8 px-3 flex items-center justify-between">
                <span>Education & Sim</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            </div>
            <NavItem href="/dashboard?view=library" icon={<BookOpen size={18} className="text-lime-400" />} label="Library" />
            <NavItem href="/dashboard?view=quiz" icon={<GraduationCap size={18} className="text-yellow-400" />} label="Financial Quiz" />
            <NavItem href="/excel" icon={<FileSpreadsheet size={18} className="text-emerald-400" />} label="Excel Skills" />
            <NavItem href="/planning" icon={<BookOpen size={18} className="text-amber-400" />} label="Financial Planning" />
            <NavItem href="/simulator" icon={<Activity size={18} className="text-indigo-400" />} label="Trading Simulator" />

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8 px-3 flex items-center justify-between">
                <span>Psychology</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            </div>
            <NavItem href="/behavioral" icon={<BrainCircuit size={18} className="text-pink-400" />} label="Behavioral Engine" />

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8 px-3 flex items-center justify-between">
                <span>Quant Lab</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            </div>
            <NavItem href="/dashboard?view=efficient-frontier" icon={<TrendingUp size={18} className="text-teal-400" />} label="Efficient Frontier" />
            <NavItem href="/dashboard?view=options" icon={<Calculator size={18} className="text-purple-400" />} label="Options Strategy Lab" />
            <NavItem href="/dashboard?view=backtester" icon={<Activity size={18} className="text-blue-400" />} label="Backtester" />
            <NavItem href="/quant" icon={<Calculator size={18} className="text-cyan-400" />} label="Greeks 3D Lab" />
            <NavItem href="/terminal" icon={<SquareTerminal size={18} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />} label="Terminal" />

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8 px-3 flex items-center justify-between">
                <span>System</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            </div>
            <NavItem
                href="/settings"
                icon={
                    <div className="relative">
                        <Settings size={18} />
                        {updateAvailable && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse box-shadow-glow-red" />}
                    </div>
                }
                label="Settings"
            />
            <NavItem href="/system" icon={<HardDrive size={18} className="text-red-400" />} label="Health & Control" />
        </nav>
    );
};

const NavItem = React.memo(({ icon, label, href, view, onClick }: { icon: React.ReactNode, label: string, href?: string, view?: string, onClick?: () => void }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const currentView = searchParams.get('view') || 'overview';

    // Determine if active
    let isActive = false;
    if (href) {
        isActive = pathname === href;
    } else if (view) {
        isActive = pathname === '/dashboard' && currentView === view;
    } else if (onClick && label === "Library") {
        // Special case for Library drawer - maybe check if drawer is open? 
        // For now, simpler to not show active state or just rely on 'onClick'
        isActive = false;
    }

    const linkHref = href ? href : view ? `/?view=${view}` : '#';

    // Fix active state logic for dashboard sub-views
    if (href?.includes('?view=')) {
        const viewParam = href.split('?view=')[1];
        isActive = pathname === '/dashboard' && currentView === viewParam;
    } else if (href === '/dashboard' && !pathname.includes('view')) {
        isActive = pathname === '/dashboard' && currentView === 'overview';
    }

    // Safety: Only show active state on client after mount to prevent hydration mismatch
    const isActuallyActive = mounted && isActive;

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1 border border-transparent`}
            >
                <div className={`transition-transform duration-300 group-hover:scale-110`}>
                    {icon}
                </div>
                <span className="font-medium tracking-wide text-sm">{label}</span>
            </button>
        );
    }

    return (
        <Link
            href={linkHref}
            prefetch={true}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group/nav ${isActuallyActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1 border border-transparent'
                }`}>
            {isActuallyActive && (
                <div className="absolute left-0 top-0 h-full w-[3px] bg-cyan-400 shadow-[0_0_15px_2px_rgba(6,182,212,0.8)]" />
            )}
            <div className={`transition-transform duration-300 ${isActuallyActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'group-hover/nav:scale-110 group-hover/nav:text-cyan-400/80'}`}>
                {icon}
            </div>
            <span className={`font-medium tracking-wide text-sm ${isActuallyActive ? 'text-cyan-100 font-semibold' : ''}`}>{label}</span>
        </Link>
    );
});



const STATIC_PAGES = [
    { title: "Dashboard Overview", url: "/dashboard?view=overview", category: "Pages", icon: <LayoutDashboard size={18} /> },
    { title: "Crypto Command", url: "/crypto", category: "Pages", icon: <Bitcoin size={18} /> },
    { title: "Stock Research", url: "/research", category: "Pages", icon: <Search size={18} /> },
    { title: "Tharunomics (Macro)", url: "/macro", category: "Pages", icon: <Activity size={18} /> },
    { title: "Valuation Sandbox", url: "/valuation", category: "Pages", icon: <Calculator size={18} /> },
    { title: "Knowledge Library", url: "/dashboard?view=library", category: "Pages", icon: <BookOpen size={18} /> },
    { title: "Financial Quiz", url: "/dashboard?view=quiz", category: "Pages", icon: <GraduationCap size={18} /> },
    { title: "Excel Skills", url: "/excel", category: "Pages", icon: <FileSpreadsheet size={18} /> },
    { title: "Financial Planning", url: "/planning", category: "Pages", icon: <BookOpen size={18} /> },
    { title: "Behavioral Engine", url: "/behavioral", category: "Pages", icon: <BrainCircuit size={18} /> },
    { title: "Settings", url: "/settings", category: "Pages", icon: <Settings size={18} /> },
    { title: "System Health", url: "/system", category: "Pages", icon: <HardDrive size={18} /> },
];

const GLOSSARY_ITEMS = LIBRARY_TOPICS.flatMap(topic =>
    topic.terms.map(term => ({
        title: term.term,
        description: term.definition,
        category: "Glossary",
        url: `/dashboard?view=library&topic=${topic.id}&term=${encodeURIComponent(term.term)}`,
        icon: <FileText size={18} />
    }))
);

const STATIC_INDEX = [...STATIC_PAGES, ...GLOSSARY_ITEMS];

const fuseOptions = {
    keys: [
        { name: 'title', weight: 0.7 },
        { name: 'description', weight: 0.3 },
        { name: 'category', weight: 0.2 }
    ],
    threshold: 0.3,
    ignoreLocation: true
};

const CommandItem = ({ icon, label, subLabel, href, onClick }: { icon: React.ReactNode, label: string, subLabel?: string, href?: string, onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 group transition-all border border-transparent hover:border-white/5"
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0">
                    {icon}
                </div>
                <div className="flex flex-col items-start truncate">
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{label}</span>
                    {subLabel && <span className="text-xs text-slate-500 truncate group-hover:text-slate-400">{subLabel}</span>}
                </div>
            </div>
            {href && <div className="hidden group-hover:flex text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-cyan-400 font-mono">JUMP</div>}
        </button>
    );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const fullKey = pathname + (searchParams?.toString() || "");
    // Command Palette State
    const [isCmdKOpen, setIsCmdKOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<any[]>([]); // Unified results
    const [searching, setSearching] = React.useState(false);

    // Mobile Nav State
    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

    // Fuse Instance
    const [fuse] = React.useState(() => new Fuse(STATIC_INDEX, fuseOptions));

    // Toggle Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCmdKOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Search Logic
    React.useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);

            // 1. Static Search (Sync)
            const staticResults = fuse.search(searchQuery).map(result => result.item);

            // 2. Stock Search (Async)
            let stockResults: any[] = [];
            try {
                const { searchTickers } = await import('@/lib/api');
                const tickers = await searchTickers(searchQuery);
                stockResults = tickers.map(t => ({
                    title: t.symbol,
                    description: t.name,
                    category: 'Stocks',
                    url: `/research?ticker=${t.symbol}`,
                    icon: <Zap size={18} className="text-yellow-400" />
                }));
            } catch (error) {
                console.error("API Search failed", error);
            }

            // Combine Results
            // Sort order: Pages -> Stocks -> Glossary
            const consolidated = [
                ...staticResults.filter(r => r.category === 'Pages'),
                ...stockResults,
                ...staticResults.filter(r => r.category === 'Glossary')
            ].slice(0, 50); // Limit total results for performance

            setSearchResults(consolidated);
            setSearching(false);
        };

        const delayDebounceFn = setTimeout(performSearch, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fuse]);

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleSelect = (result: any) => {
        setIsCmdKOpen(false);
        if (result.category === 'Stocks') {
            // For stocks, we might want a full page reload or handled by router if internal
            router.push(result.url);
        } else {
            router.push(result.url);
        }
    };

    return (
        <div suppressHydrationWarning className="min-h-screen bg-transparent text-slate-100 flex font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden">
            {/* Background Ambient Glow */}
            <CosmicBackground />

            {/* Sidebar */}
            <aside className="w-72 bg-[rgba(11,14,20,0.4)] backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col relative z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)] h-screen">
                <div className="pt-8 pb-6 px-6 flex items-center justify-center relative overflow-visible group">
                    <Link href="/" className="block hover:opacity-100 hover:scale-105 transition-all duration-300 relative z-10 w-full flex justify-center">
                        <img
                            src="/quantdash_logo.png"
                            alt="QuantDash"
                            className="h-16 w-auto object-contain mix-blend-lighten"
                            style={{ filter: 'contrast(1.5)' }}
                        />
                    </Link>
                </div>

                <div className="px-5 py-6">
                    <button
                        onClick={() => setIsCmdKOpen(true)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-white/10 hover:border-cyan-500/30 rounded-2xl text-sm text-slate-400 transition-all group duration-300"
                    >
                        <span className="flex items-center gap-3 group-hover:text-cyan-300 transition-colors">
                            <Search size={16} />
                            <span>Quick Search...</span>
                        </span>
                        <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded bg-black/30 border border-white/10 px-2 font-mono text-[10px] font-bold text-slate-500 group-hover:text-cyan-400 transition-colors shadow-inner">
                            <span className="text-xs">⌘</span> K
                        </kbd>
                    </button>
                </div>

                {/* Suspense Boundary for Sidebar Navigation using searchParams */}
                <Suspense fallback={<div className="p-4 text-slate-500 text-sm animate-pulse">Loading Nav...</div>}>
                    <SidebarContent />
                </Suspense>

                <div className="p-4 border-t border-white/5 bg-gradient-to-t from-slate-900/50 to-transparent">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all">
                            RV
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Ryan Vazzano</p>
                            <p className="text-xs text-cyan-500/80 font-medium tracking-wide">Head of Quant</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen relative z-10 scroll-smooth custom-scrollbar bg-gradient-to-br from-transparent to-black/20">
                {/* Floating Glass Header */}
                <header className="h-16 mt-4 mx-6 rounded-2xl border border-white/10 flex items-center justify-between px-6 bg-[rgba(11,14,20,0.5)] backdrop-blur-2xl shadow-lg shadow-black/20 sticky top-4 z-30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <button
                            className="md:hidden mr-2 text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                            onClick={() => setIsMobileNavOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        <h2 className="text-sm font-medium text-slate-400 flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 hover:border-emerald-500/30 transition-colors cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent font-semibold tracking-wide text-xs uppercase">Live Connection</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-300 transition-colors group hidden sm:flex px-4 py-2 rounded-full hover:bg-white/5">
                            <BookOpen size={16} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
                            <span>Mission Control</span>
                        </Link>

                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

                        <div className="flex items-center gap-4">
                            <MarketStatus />
                            <span className="text-xs text-cyan-400 font-mono bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/20 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]">
                                {mounted && new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out max-w-[1920px] mx-auto">
                    <ErrorBoundary name="Dashboard Content">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={fullKey}
                                initial={{ opacity: 0, y: 15, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="h-full"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </ErrorBoundary>
                </div>
            </main>

            {/* Command Palette Modal */}
            {isCmdKOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsCmdKOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5 max-h-[70vh] flex flex-col">
                        <div className="flex items-center border-b border-white/10 px-5 py-5 shrink-0">
                            <Command className="text-cyan-500 mr-4" size={24} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search tickers, glossary terms, or pages..."
                                className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 text-xl font-light"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (searchResults.length > 0) {
                                            handleSelect(searchResults[0]);
                                        }
                                    }
                                }}
                            />
                            <div className="text-[10px] font-bold text-slate-500 border border-slate-700/50 rounded px-2 py-1 bg-slate-800/50">ESC</div>
                        </div>

                        <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
                            {/* Quick Links (if no search) */}
                            {searchQuery.length < 2 && (
                                <div className="space-y-1 p-2">
                                    <div className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Suggested Tools</div>
                                    <CommandItem icon={<LayoutDashboard size={18} />} label="Overview" href="/dashboard?view=overview" onClick={() => setIsCmdKOpen(false)} />
                                    <CommandItem icon={<Search size={18} />} label="Stock Research" href="/research" onClick={() => setIsCmdKOpen(false)} />
                                    <CommandItem icon={<Bitcoin size={18} />} label="Crypto Command" href="/crypto" onClick={() => setIsCmdKOpen(false)} />
                                    <CommandItem icon={<Calculator size={18} />} label="Valuation Sandbox" href="/valuation" onClick={() => setIsCmdKOpen(false)} />
                                </div>
                            )}

                            {/* Search Results */}
                            {searchQuery.length >= 2 && (
                                <div className="space-y-4 p-2">
                                    {searching && searchResults.length === 0 ? (
                                        <div className="px-4 py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                                            <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                            <span className="text-sm">Searching ecosystem...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <>
                                            {/* Group by Category */}
                                            {['Pages', 'Stocks', 'Glossary'].map(category => {
                                                const items = searchResults.filter(r => r.category === category);
                                                if (items.length === 0) return null;
                                                return (
                                                    <div key={category} className="space-y-1">
                                                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-900/50 rounded md:w-fit">{category}</div>
                                                        {items.map((result, idx) => (
                                                            <CommandItem
                                                                key={`${category}-${idx}`}
                                                                icon={result.icon || <Search size={18} />}
                                                                label={result.title}
                                                                subLabel={result.description}
                                                                onClick={() => handleSelect(result)}
                                                            />
                                                        ))}
                                                    </div>
                                                )
                                            })}
                                        </>
                                    ) : (
                                        !searching && <div className="px-4 py-12 text-center text-slate-500 text-sm">No results found for &quot;{searchQuery}&quot;.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-[#0a0a0c] border-t border-white/5 px-4 py-3 text-[10px] text-slate-600 flex justify-between items-center shrink-0">
                            <div className="flex gap-4">
                                <span><strong className="text-slate-400">↑↓</strong> to navigate</span>
                                <span><strong className="text-slate-400">↵</strong> to select</span>
                            </div>
                            <span className="opacity-50">Global Index Active</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Navigation Overlay */}
            {isMobileNavOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileNavOpen(false)}
                    />
                    <aside className="relative w-80 bg-[#0d101c] h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col border-r border-white/10">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                QUANT<span className="font-light text-slate-100">DASH</span>
                            </h1>
                            <button onClick={() => setIsMobileNavOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <SidebarContent />
                        </div>
                    </aside>
                </div>
            )}
            <ConnectionStatus />
        </div>
    );
};

export default DashboardLayout;
