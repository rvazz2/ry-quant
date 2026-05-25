"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldAlert, ArrowLeft, ExternalLink } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden relative">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(124,58,237,0.08),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.08),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/85 to-slate-950/95" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-[rgba(8,10,20,0.7)] backdrop-blur-xl sticky top-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-16 w-48">
              <Image 
                src="/quantdash_logo.png" 
                alt="QuantDash" 
                fill 
                className="object-contain mix-blend-lighten hover:brightness-110 transition-all" 
                style={{ filter: 'contrast(1.5)' }} 
              />
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors tracking-wide flex items-center gap-2">
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.7)]"
            >
              Launch Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Service</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Last Updated: May 25, 2026
          </p>
        </div>

        <div className="glass-panel p-8 md:p-12 border-t border-cyan-500/20 shadow-2xl">
          
          {/* CRITICAL FINANCIAL DISCLAIMER SECTION */}
          <div className="flex flex-col md:flex-row gap-5 bg-amber-500/5 border border-amber-500/25 rounded-2xl p-6 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-xl shrink-0 h-fit w-fit">
              <ShieldAlert size={28} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-amber-400 font-bold text-lg mb-2">IMPORTANT: NO FINANCIAL ADVICE & RISK WARNING</h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                QuantDash is a quantitative financial intelligence and analytics dashboard designed purely for <strong>educational and informational purposes</strong>. 
                Ry Quant and its co-founders (Ryan Vazzano, Alexander Lauinger) are not registered financial advisors, broker-dealers, or investment analysts. 
                No content, tools, signals, templates, or calculations provided on this site constitute professional financial, investment, tax, or legal advice, nor a solicitation or recommendation to buy or sell any security, option, cryptocurrency, or digital asset. 
                All financial decisions carry risk, and you should always consult with a certified financial professional before making any investment decisions.
              </p>
            </div>
          </div>

          <div className="space-y-8 text-slate-300 text-sm md:text-base leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By using QuantDash or any products, services, and content offered by Ry Quant, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Accuracy and Reliance on Data</h2>
              <p>
                Financial data, charts, option pricing, sentiment analyses, and simulated metrics on this website are aggregated from various third-party sources or generated algorithmically. While we strive to maintain high accuracy, we do not warrant that any data is free from errors, complete, or up-to-date. You use this data solely at your own risk and discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Backtesting & Trading Simulator Disclaimer</h2>
              <p>
                Any backtested, simulated, or historical performance metrics displayed on QuantDash are entirely hypothetical and do not guarantee future results. Simulated trading differs from real trading due to factors such as slippage, market liquidity, commission fees, and execution latency. Ry Quant is not responsible for any differences between simulated performance and actual trading results.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Limitation of Liability</h2>
              <p className="uppercase text-xs font-bold text-rose-400 tracking-wider mb-2">
                All services are provided "as is" and "as available".
              </p>
              <p>
                To the fullest extent permitted by applicable law, Ry Quant, its co-founders, contributors, and hosting providers shall not be held liable for any direct, indirect, incidental, special, or consequential damages (including, but not limited to, loss of profits, data corruption, capital losses, or system downtime) arising out of or in connection with your use or inability to use this platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Intellectual Property</h2>
              <p>
                The designs, code, branding, logos, proprietary mathematical models, and unique interface layouts are the intellectual property of Ry Quant and its co-founders. You may not copy, reverse-engineer, frame, or sell any assets or code from this platform without prior written authorization.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Modifications to Service</h2>
              <p>
                We reserve the right to modify, suspend, or terminate the platform or any part of its features at any time without notice or liability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the State of Illinois, without regard to conflict of law principles.
              </p>
            </section>

          </div>

          <div className="border-t border-white/5 pt-8 mt-10 text-center text-xs text-slate-500">
            <p>
              If you have any questions or feedback regarding these terms, please submit them using our feedback system or contact us at <a href="mailto:info@ryquant.com" className="text-cyan-400 hover:underline">info@ryquant.com</a>.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-slate-600 text-sm border-t border-white/5 mt-20">
        <p>© {new Date().getFullYear()} Ry Quant. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-50">QuantDash™ is a trademark of Ry Quant.</p>
      </footer>
    </div>
  );
}
