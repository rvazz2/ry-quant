"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Terminal } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const isHacker = theme === 'hacker';

    return (
        <button
            onClick={() => setTheme(isHacker ? 'light' : 'hacker')}
            className={`
        relative p-2 rounded-lg transition-all duration-500 overflow-hidden
        ${isHacker
                    ? 'bg-green-900/20 text-green-400 border border-green-500/50 hover:bg-green-900/40'
                    : 'bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700'
                }
      `}
            title={isHacker ? "Deactivate Hacker Mode" : "Activate Hacker Mode"}
        >
            <div className="relative z-10">
                {isHacker ? <Terminal size={18} /> : <Monitor size={18} />}
            </div>

            {/* Glitch effect on hover/active could go here */}
        </button>
    );
}
