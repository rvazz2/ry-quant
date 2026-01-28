"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, LineChart, Cpu, Activity, Zap, Bitcoin, PlayCircle, Sun, Moon, Sunset, CloudSun } from 'lucide-react';

// --- BioModal Component ---
interface Student {
  name: string;
  role: string;
  education: string;
  college: string;
  bio: string;
  icon: React.ReactNode;
}

const BioModal = React.memo(({ student, isOpen, onClose }: { student: Student | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="glass-panel max-w-lg w-full p-8 relative scale-100 animate-in zoom-in-95 duration-200 border-t border-cyan-500/20" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            {student.icon}
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{student.name}</h3>
            <p className="text-cyan-400 font-bold tracking-wide uppercase text-sm">{student.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Education</h4>
            <p className="text-white text-lg font-semibold">{student.education}</p>
            <p className="text-slate-400 text-sm font-medium">{student.college}</p>
          </div>

          <div className="p-5 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Focus</h4>
            <p className="text-slate-200 leading-relaxed font-light">{student.bio}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
});

BioModal.displayName = 'BioModal';

export default function LandingPage() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('night');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 10) setTimeOfDay('morning');
      else if (hour >= 10 && hour < 17) setTimeOfDay('day');
      else if (hour >= 17 && hour < 20) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const students = useMemo(() => [
    {
      name: "Ryan Vazzano",
      role: "Co-Founder, Head of Quant",
      education: "Finance",
      college: "Gies College of Business (UIUC)",
      bio: "Specializing in quantitative analysis, financial modeling, and efficient market hypothesis testing. Building the bridge between institutional finance and retail accessibility.",
      icon: <Activity className="text-cyan-400" size={36} />
    },
    {
      name: "Alexander Lauinger",
      role: "Co-Founder, Head of Algorithmic Systems",
      education: "Computer Science",
      college: "Siebel School of Computing & Data Science (Grainger College of Engineering)",
      bio: "Architecting high-frequency data pipelines, distributed systems, and scalable full-stack infrastructure. Turning complex math into performant code.",
      icon: <Cpu className="text-purple-400" size={36} />
    }
  ], []);

  // Use generated Chicago images for the Chicago Moods
  const backgroundImages = {
    morning: "/hero/morning.png",
    day: "/hero/day.png",
    evening: "/hero/evening.png",
    night: "/hero/night.png"
  };

  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning': return { text: "Chicago Sunrise", icon: <Sun size={14} className="text-orange-400" /> };
      case 'day': return { text: "Live from the Loop", icon: <CloudSun size={14} className="text-sky-400" /> };
      case 'evening': return { text: "Golden Hour View", icon: <Sunset size={14} className="text-amber-400" /> };
      default: return { text: "Institutional Grade Analytics", icon: <Moon size={14} className="text-cyan-400" /> };
    }
  };

  const greeting = getGreeting();

  return (
    <div className={`min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden relative`}>
      <BioModal student={selectedStudent} isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} />

      {/* Dynamic Time-Lapse Background Images */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {mounted && (
          <>
            <div className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${timeOfDay === 'morning' ? 'opacity-100' : 'opacity-0'}`}>
              <Image src="/hero/morning.png" alt="Chicago Sunrise" fill className="object-cover" priority />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${timeOfDay === 'day' ? 'opacity-100' : 'opacity-0'}`}>
              <Image src="/hero/day.png" alt="Chicago Day" fill className="object-cover" priority />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${timeOfDay === 'evening' ? 'opacity-100' : 'opacity-0'}`}>
              <Image src="/hero/evening.png" alt="Chicago Evening" fill className="object-cover" priority />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${timeOfDay === 'night' ? 'opacity-100' : 'opacity-0'}`}>
              <Image src="/hero/night.png" alt="Chicago Night" fill className="object-cover" priority />
            </div>

            {/* Overlay Gradient for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
          </>
        )}
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-[rgba(8,10,20,0.7)] backdrop-blur-xl sticky top-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/quantdash_logo.png" alt="QuantDash" className="h-16 w-auto object-contain mix-blend-lighten hover:brightness-110 transition-all" style={{ filter: 'contrast(1.5)' }} />
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors tracking-wide">Features</a>
            <a href="#mission" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors tracking-wide">Mission</a>
            <Link
              href="/dashboard"
              className="px-7 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_25px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_-5px_rgba(6,182,212,0.7)] hover:-translate-y-0.5"
            >
              Launch Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center max-w-5xl mx-auto mb-28 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-widest mb-10 hover:bg-cyan-900/40 transition-all cursor-default shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${timeOfDay === 'morning' ? 'bg-orange-400' : timeOfDay === 'evening' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${timeOfDay === 'morning' ? 'bg-orange-500' : timeOfDay === 'evening' ? 'bg-amber-500' : 'bg-cyan-500'}`}></span>
            </span>
            {greeting.text}
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.95] drop-shadow-2xl">
            Stop Gambling. <br />
            Start <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 neon-text-cyan">Winning</span>.
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-14 max-w-3xl mx-auto leading-relaxed font-light">
            Professional-grade financial modeling, automated DCF valuation, and proprietary alpha-generating signals.
            <span className="text-white font-medium block mt-3 drop-shadow-md">Built for the retail trader who demands an edge.</span>
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
              className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white text-xl font-bold rounded-2xl border border-white/10 hover:border-white/20 transition-all w-full sm:w-auto backdrop-blur-sm flex items-center gap-3 group"
            >
              <PlayCircle size={24} className="group-hover:text-cyan-400 transition-colors" />
              Our Philosophy
            </button>
          </div>
        </div>

        {/* Founders Section - Updated with strong glassmorphism */}
        <div id="mission" className="max-w-6xl mx-auto scroll-mt-24">
          <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-[0.3em] text-center mb-16">Built By Students, For Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {students.map((student, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedStudent(student)}
                className="group relative glass-panel glass-panel-hover p-10 cursor-pointer flex items-center gap-8"
              >
                <div className="absolute top-6 right-6 text-slate-600 group-hover:text-cyan-400 transition-colors">
                  <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="w-24 h-24 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-xl group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] shrink-0">
                  {student.icon}
                </div>

                <div className="min-w-0">
                  <h4 className="text-5xl font-cursive text-white mb-3 group-hover:text-cyan-400 transition-colors pt-2 leading-none">{student.name}</h4>
                  <p className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-2 border border-cyan-500/20 bg-cyan-500/5 inline-block px-2 py-1 rounded">{student.role}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[240px] italic">{student.college}</p>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* The Problem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mt-56">
          <div className="space-y-10">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              The Problem with <br />
              <span className="text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">Modern Education</span>
            </h2>
            <div className="prose prose-invert text-lg text-slate-300 leading-relaxed font-light space-y-6">
              <p>
                You spent 16 years in school learning about mitochondria and calculus. But the day you graduated, <strong className="text-white font-semibold decoration-rose-500 decoration-2 underline underline-offset-4">nobody told you how to manage debt, file taxes, or grow your money.</strong>
              </p>
              <p className="border-l-4 border-rose-500 pl-6 italic text-slate-400">
                &quot;You were thrown into the deep end of capitalism without a life jacket.&quot;
              </p>
            </div>
          </div>

          <div className="glass-panel p-10 md:p-14 relative overflow-hidden border-l-4 border-l-rose-500 shadow-[0_0_60px_-10px_rgba(244,63,94,0.15)] group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-[80px] -z-10 group-hover:bg-rose-600/20 transition-colors duration-1000" />

            <div className="space-y-10 relative z-10">
              <div className="flex gap-7 items-start">
                <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] grayscale group-hover:grayscale-0 transition-all duration-500">📉</span>
                <div>
                  <h3 className="font-bold text-white text-2xl mb-2">Inflation is Eating You</h3>
                  <p className="text-slate-400 leading-relaxed">Your savings lose value every single day you don&apos;t invest. Cash is trash.</p>
                </div>
              </div>
              <div className="flex gap-7 items-start">
                <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] grayscale group-hover:grayscale-0 transition-all duration-500 delay-100">💸</span>
                <div>
                  <h3 className="font-bold text-white text-2xl mb-2">Debt is Compounding</h3>
                  <p className="text-slate-400 leading-relaxed">Student loans are designed to keep you working until you&apos;re 70. Break the cycle.</p>
                </div>
              </div>
              <div className="flex gap-7 items-start">
                <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] grayscale group-hover:grayscale-0 transition-all duration-500 delay-200">🚫</span>
                <div>
                  <h3 className="font-bold text-white text-2xl mb-2">The &quot;Standard Path&quot; is Broken</h3>
                  <p className="text-slate-400 leading-relaxed">Work until 65 then retire? That math doesn&apos;t work anymore.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div id="features" className="glass-panel p-12 md:p-24 border-t border-cyan-500/30 text-center space-y-16 relative overflow-visible group mt-56 scroll-mt-24">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70"></div>
          <div className="absolute -top-40 -right-40 bg-cyan-500/10 w-[600px] h-[600px] rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-all duration-1000"></div>
          <div className="absolute -bottom-40 -left-40 bg-blue-500/10 w-[600px] h-[600px] rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-1000"></div>

          <div className="relative z-10">
            <div className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-8 shadow-[0_0_15px_rgba(34,211,238,0.2)]">The Antidote</div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8">The Solution: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 neon-text-cyan">QuantDash</span></h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
              This isn&apos;t just a stock tracker. It&apos;s your cheat sheet for the real world. We provide the institutional-grade tools usually reserved for Wall Street, simplified for your dorm room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 relative z-10">
            {[
              { title: "Institutional Data", icon: LineChart, desc: "Real-time market analytics used by hedge funds.", link: "/research", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/50" },
              { title: "Crypto Command", icon: Bitcoin, desc: "Live DeFi yields, whale alerts, and token analytics.", link: "/crypto", color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
              { title: "Financial Literacy", icon: BookOpen, desc: "Test your knowledge with our Interactive Quiz.", link: "/dashboard?view=quiz", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50" },
              { title: "Algorithmic Tools", icon: Cpu, desc: "Tools to optimize your portfolio mathematically.", link: "/quant", color: "text-purple-400", bg: "bg-purple-500/10", border: "hover:border-purple-500/50" }
            ].map((feature, i) => (
              <Link
                key={i}
                href={feature.link}
                className={`bg-black/40 border border-white/5 p-8 rounded-3xl ${feature.border} transition-all cursor-pointer hover:-translate-y-3 hover:shadow-2xl group/card flex flex-col items-center text-center backdrop-blur-md`}
              >
                <div className={`w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/10 ${feature.color} mb-6 group-hover/card:scale-110 group-hover/card:${feature.bg} transition-all duration-300 shadow-lg`}>
                  <feature.icon size={36} />
                </div>
                <h3 className={`font-bold text-white text-xl mb-3 group-hover/card:${feature.color} transition-colors`}>{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* The Goal */}
        <div className="text-center py-32 mt-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          <h2 className="text-3xl font-bold text-slate-400 mb-10 tracking-[0.2em] uppercase">Our Goal for You</h2>
          <p className="text-4xl md:text-6xl text-slate-200 font-thin mb-16 max-w-5xl mx-auto leading-tight">
            Turn <span className="text-rose-400 font-bold decoration-wavy underline decoration-rose-500/30">&quot;Broke Student&quot;</span> into <span className="text-emerald-400 font-bold decoration-wavy underline decoration-emerald-500/30">&quot;Wealthy Adult&quot;</span>.
          </p>
          <Link href="/planning" className="inline-flex px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-bold text-lg items-center gap-3 transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            See how we do it <ArrowRight size={20} />
          </Link>
        </div>

        {/* Footer */}
        <footer className="relative z-10 py-12 text-center text-slate-600 text-sm border-t border-white/5 mt-32">
          <p>© {new Date().getFullYear()} Ry Quant. All rights reserved.</p>
          <p className="mt-2 text-xs opacity-50">QuantDash™ is a trademark of Ry Quant.</p>
        </footer>

      </div>
    </div>
  );
}
