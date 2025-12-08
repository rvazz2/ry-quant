"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, ArrowRight, BookOpen, LineChart, Cpu, Activity, Zap, ShieldAlert, Bitcoin } from 'lucide-react';

// --- Bio Modal Component ---
const BioModal = React.memo(({ student, isOpen, onClose }: { student: any, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="glass-panel max-w-lg w-full p-8 relative scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            {student.icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{student.name}</h3>
            <p className="text-cyan-400 font-medium">{student.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-black/20 rounded-lg border border-white/5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Education</h4>
            <p className="text-white text-lg font-semibold">{student.education}</p>
            <p className="text-slate-400 text-sm">{student.college}</p>
          </div>

          <div className="p-4 bg-black/20 rounded-lg border border-white/5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Focus</h4>
            <p className="text-slate-200 leading-relaxed font-light">{student.bio}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

BioModal.displayName = 'BioModal';

export default function LandingPage() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const students = useMemo(() => [
    {
      name: "Ryan Vazzano",
      role: "Co-Founder, Head of Quant",
      education: "Finance",
      college: "Gies College of Business (UIUC)",
      bio: "Specializing in quantitative analysis, financial modeling, and efficient market hypothesis testing. Building the bridge between institutional finance and retail accessibility.",
      icon: <Activity className="text-cyan-400" size={32} />
    },
    {
      name: "Alexander Lauinger",
      role: "Co-Founder, Head of Algorithmic Systems",
      education: "Computer Science",
      college: "Siebel School of Computing & Data Science (Grainger College of Engineering)",
      bio: "Architecting high-frequency data pipelines, distributed systems, and scalable full-stack infrastructure. Turning complex math into performant code.",
      icon: <Cpu className="text-purple-400" size={32} />
    }
  ], []);

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-cyan-500/20 selection:text-cyan-400 overflow-hidden relative">
      <BioModal student={selectedStudent} isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} />

      {/* Decorative Background Elements (On top of global background) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-[rgba(10,10,12,0.6)] backdrop-blur-md sticky top-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-100 transition-colors">
              Quant<span className="text-cyan-400">Dash</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">Features</a>
            <a href="#mission" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">Mission</a>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.7)] hover:-translate-y-0.5"
            >
              Launch Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center max-w-5xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-8 hover:bg-cyan-500/20 transition-all cursor-default shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Institutional Grade Analytics
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500 mb-8 tracking-tighter leading-[0.9]">
            Stop Gambling. <br />
            Start <span className="text-cyan-400 glow-text drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]">Winning</span>.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Professional-grade financial modeling, automated DCF valuation, and proprietary alpha-generating signals.
            <span className="text-slate-200 font-medium block mt-2">Built for the retail trader who demands an edge.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xl font-bold rounded-2xl transition-all shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] hover:shadow-[0_0_50px_-5px_rgba(6,182,212,0.8)] hover:scale-105 w-full sm:w-auto flex items-center justify-center gap-3 group"
            >
              <Zap size={24} className="fill-slate-900 group-hover:scale-110 transition-transform" />
              Start Free Research
            </Link>
            <button
              onClick={() => router.push('/mission')}
              className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white text-xl font-bold rounded-2xl border border-white/10 hover:border-white/20 transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              Our Philosophy
            </button>
          </div>
        </div>

        {/* Founders Section - Updated */}
        <div id="mission" className="max-w-5xl mx-auto scroll-mt-24">
          <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center mb-12">Built By Students, For Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {students.map((student, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedStudent(student)}
                className="group relative glass-panel glass-panel-hover p-8 cursor-pointer"
              >
                <div className="absolute top-6 right-6 text-slate-600 group-hover:text-cyan-400 transition-colors">
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-lg group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] shrink-0">
                    {student.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-5xl font-cursive text-white mb-2 group-hover:text-cyan-400 transition-colors pt-1 leading-none">{student.name}</h4>
                    <p className="text-sm text-cyan-500 font-bold uppercase tracking-wider mb-1">{student.role}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{student.college}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* The Problem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-48">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">The Problem</h2>
            <div className="prose prose-invert text-lg text-slate-400 leading-relaxed font-light">
              <p>
                You spent 16 years in school learning about mitochondria and calculus. But the day you graduated, <strong className="text-white font-semibold decoration-cyan-500 underline underline-offset-4">nobody told you how to manage debt, file taxes, or grow your money.</strong>
              </p>
              <p>
                You were thrown into the deep end of capitalism without a life jacket.
              </p>
            </div>
          </div>
          <div className="glass-panel p-8 md:p-12 relative overflow-hidden border-l-4 border-l-rose-500 shadow-[0_0_50px_-20px_rgba(244,63,94,0.2)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -z-10" />

            <div className="space-y-8 relative z-10">
              <div className="flex gap-6 items-start">
                <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">📉</span>
                <div>
                  <h3 className="font-bold text-white text-xl mb-1">Inflation is Eating You</h3>
                  <p className="text-slate-400 leading-relaxed">Your savings lose value every single day you don't invest.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">💸</span>
                <div>
                  <h3 className="font-bold text-white text-xl mb-1">Debt is Compounding</h3>
                  <p className="text-slate-400 leading-relaxed">Student loans are designed to keep you working until you're 70.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">🚫</span>
                <div>
                  <h3 className="font-bold text-white text-xl mb-1">The "Standard Path" is Broken</h3>
                  <p className="text-slate-400 leading-relaxed">Work until 65 then retire? That math doesn't work anymore.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div id="features" className="glass-panel p-10 md:p-20 border-t border-cyan-500/30 text-center space-y-12 relative overflow-hidden group mt-48 scroll-mt-24">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          <div className="absolute -top-40 -right-40 bg-cyan-500/10 w-[500px] h-[500px] rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-all duration-1000"></div>

          <div className="relative z-10">
            <div className="inline-block px-3 py-1 bg-cyan-500/10 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">The Antidote</div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">The Solution: <span className="text-cyan-400 neon-text-cyan">QuantDash</span></h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
              This isn't just a stock tracker. It's your cheat sheet for the real world. We provide the institutional-grade tools usually reserved for Wall Street, simplified for your dorm room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4 relative z-10">
            <div
              onClick={() => router.push('/research')}
              className="bg-black/30 border border-white/5 p-8 rounded-2xl hover:border-cyan-500/50 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] group/card flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/10 text-cyan-400 mb-6 group-hover/card:scale-110 group-hover/card:bg-cyan-500/10 transition-all">
                <LineChart size={32} />
              </div>
              <h3 className="font-bold text-white text-xl mb-3 group-hover/card:text-cyan-400 transition-colors">Institutional Data</h3>
              <p className="text-slate-400 leading-relaxed">Real-time market analytics used by hedge funds.</p>
            </div>
            <div
              onClick={() => router.push('/crypto')}
              className="bg-black/30 border border-white/5 p-8 rounded-2xl hover:border-cyan-500/50 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] group/card flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/10 text-cyan-400 mb-6 group-hover/card:scale-110 group-hover/card:bg-cyan-500/10 transition-all">
                <Bitcoin size={32} />
              </div>
              <h3 className="font-bold text-white text-xl mb-3 group-hover/card:text-cyan-400 transition-colors">Crypto Command</h3>
              <p className="text-slate-400 leading-relaxed">Live DeFi yields, whale alerts, and token analytics.</p>
            </div>
            <div
              onClick={() => router.push('/planning')}
              className="bg-black/30 border border-white/5 p-8 rounded-2xl hover:border-cyan-500/50 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] group/card flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/10 text-cyan-400 mb-6 group-hover/card:scale-110 group-hover/card:bg-cyan-500/10 transition-all">
                <BookOpen size={32} />
              </div>
              <h3 className="font-bold text-white text-xl mb-3 group-hover/card:text-cyan-400 transition-colors">Financial Literacy</h3>
              <p className="text-slate-400 leading-relaxed">Learn the rules of the money game before you play.</p>
            </div>
            <div
              onClick={() => router.push('/quant')}
              className="bg-black/30 border border-white/5 p-8 rounded-2xl hover:border-cyan-500/50 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] group/card flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/10 text-cyan-400 mb-6 group-hover/card:scale-110 group-hover/card:bg-cyan-500/10 transition-all">
                <Cpu size={32} />
              </div>
              <h3 className="font-bold text-white text-xl mb-3 group-hover/card:text-cyan-400 transition-colors">Algorithmic Tools</h3>
              <p className="text-slate-400 leading-relaxed">Tools to optimize your portfolio mathematically.</p>
            </div>
          </div>
        </div>

        {/* The Goal */}
        <div className="text-center py-24 mt-20">
          <h2 className="text-3xl font-bold text-white mb-8">Our Goal for You</h2>
          <p className="text-3xl md:text-5xl text-slate-300 font-extralight mb-12 max-w-4xl mx-auto leading-tight">
            Turn <span className="text-rose-400 font-semibold decoration-wavy underline decoration-rose-500/30">"Broke Student"</span> into <span className="text-emerald-400 font-semibold decoration-wavy underline decoration-emerald-500/30">"Wealthy Adult"</span>.
          </p>
          <Link href="/planning" className="inline-flex text-cyan-400 hover:text-cyan-300 font-bold text-lg items-center gap-2 hover:gap-3 transition-all hover:underline underline-offset-4 decoration-2">
            See how we do it <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}
