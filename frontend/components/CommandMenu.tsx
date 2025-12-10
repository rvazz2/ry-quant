"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Monitor, Terminal, BarChart3, TrendingUp, Bitcoin, BookOpen, Calculator } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettings } from "@/contexts/SettingsContext";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const { setTheme } = useTheme();
    const { setLibraryOpen } = useSettings();

    // Toggle with Ctrl+K or Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    // Use a portal or simple fixed overlay
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <Command className="w-full bg-transparent">
                    <div className="flex items-center border-b border-slate-800 px-3" cmdk-input-wrapper="">
                        <Search className="w-5 h-5 text-slate-500 mr-2" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex-1 h-14 bg-transparent outline-none text-slate-200 placeholder:text-slate-500 font-medium"
                        />
                        <div className="text-xs text-slate-600 font-mono border border-slate-800 px-1.5 py-0.5 rounded">ESC</div>
                    </div>

                    <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-py-2">
                        <Command.Empty className="py-6 text-center text-slate-500 text-sm">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="text-xs font-bold text-slate-500 uppercase px-2 py-1.5 mb-1">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/"))}
                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white transition-colors"
                            >
                                <Monitor className="w-4 h-4 text-cyan-400" />
                                <span>Dashboard</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/crypto"))}
                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white transition-colors"
                            >
                                <Bitcoin className="w-4 h-4 text-amber-400" />
                                <span>Crypto Terminal</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/quant"))}
                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white transition-colors"
                            >
                                <BarChart3 className="w-4 h-4 text-indigo-400" />
                                <span>Quant Suite</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => runCommand(() => setLibraryOpen(true))}
                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white transition-colors"
                            >
                                <BookOpen className="w-4 h-4 text-emerald-400" />
                                <span>Knowledge Library</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="h-px bg-slate-800 my-1 mx-2" />

                        <Command.Group heading="Actions" className="text-xs font-bold text-slate-500 uppercase px-2 py-1.5 mb-1">
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("hacker"))}
                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white transition-colors"
                            >
                                <Terminal className="w-4 h-4 text-green-400" />
                                <span>Activate Hacker Mode</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("light"))} // 'light' is basically 'modern' default here due to CSS setup
                                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer aria-selected:bg-slate-800 aria-selected:text-white transition-colors"
                            >
                                <Monitor className="w-4 h-4 text-blue-400" />
                                <span>Switch to Modern Theme</span>
                            </Command.Item>
                        </Command.Group>

                    </Command.List>

                    <div className="border-t border-slate-800 p-2 text-[10px] text-slate-600 flex justify-between px-4 bg-slate-900/50">
                        <span>Navigate using arrows</span>
                        <span>Enter to select</span>
                    </div>
                </Command>
            </div>
        </div>
    );
}
