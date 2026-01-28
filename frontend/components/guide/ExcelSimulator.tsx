"use client";

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface SimulatorProps {
    type: 'SUM' | 'VLOOKUP' | 'IF';
}

interface CellData {
    value: string | number;
    style?: string;
    isHeader?: boolean;
}

export default function ExcelSimulator({ type }: SimulatorProps) {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [grid, setGrid] = useState<Record<string, CellData>>({});
    const [selection, setSelection] = useState<string | null>(null);
    const [formulaBar, setFormulaBar] = useState("");
    const [activeCell, setActiveCell] = useState<string | null>(null);

    // Initial setup based on type
    const setupGrid = () => {
        let newGrid: Record<string, CellData> = {};

        if (type === 'SUM') {
            newGrid = {
                'A1': { value: 'Item', isHeader: true }, 'B1': { value: 'Cost', isHeader: true },
                'A2': { value: 'Apple' }, 'B2': { value: 1.50 },
                'A3': { value: 'Banana' }, 'B3': { value: 0.80 },
                'A4': { value: 'Milk' }, 'B4': { value: 3.20 },
                'A5': { value: 'Total', style: 'font-bold' }, 'B5': { value: '' }
            };
        } else if (type === 'VLOOKUP') {
            newGrid = {
                'A1': { value: 'ID', isHeader: true }, 'B1': { value: 'Product', isHeader: true }, 'C1': { value: 'Price', isHeader: true },
                'A2': { value: '101' }, 'B2': { value: 'Widget' }, 'C2': { value: 25 },
                'A3': { value: '102' }, 'B3': { value: 'Gadget' }, 'C3': { value: 40 },
                'E1': { value: 'Lookup ID', isHeader: true }, 'F1': { value: 'Result', isHeader: true },
                'E2': { value: '102' }, 'F2': { value: '' }
            };
        } else if (type === 'IF') {
            newGrid = {
                'A1': { value: 'Name', isHeader: true }, 'B1': { value: 'Score', isHeader: true }, 'C1': { value: 'Result', isHeader: true },
                'A2': { value: 'Alice' }, 'B2': { value: 85 }, 'C2': { value: '' },
                'A3': { value: 'Bob' }, 'B3': { value: 40 }, 'C3': { value: '' },
            };
        }
        setGrid(newGrid);
        setStep(0);
        setSelection(null);
        setFormulaBar("");
        setActiveCell(null);
    };

    useEffect(() => {
        setupGrid();
    }, [type]);

    useEffect(() => {
        if (!isPlaying) return;

        let timeout: NodeJS.Timeout;

        const runStep = () => {
            // Sequence logic
            if (type === 'SUM') {
                if (step === 0) { // Select cell
                    setSelection('B5');
                    setActiveCell('B5');
                    setStep(1);
                    timeout = setTimeout(runStep, 800);
                } else if (step === 1) { // Type formula start
                    setFormulaBar("=SUM(");
                    setStep(2);
                    timeout = setTimeout(runStep, 600);
                } else if (step === 2) { // Select range
                    setSelection('B2:B4');
                    setFormulaBar("=SUM(B2:B4");
                    setStep(3);
                    timeout = setTimeout(runStep, 1000);
                } else if (step === 3) { // Close paren
                    setFormulaBar("=SUM(B2:B4)");
                    setStep(4);
                    timeout = setTimeout(runStep, 500);
                } else if (step === 4) { // Enter result
                    setGrid(prev => ({ ...prev, 'B5': { value: 5.50 } }));
                    setSelection('B5');
                    setFormulaBar("=SUM(B2:B4)"); // Formula persists in bar
                    setIsPlaying(false); // End
                }
            } else if (type === 'VLOOKUP') {
                if (step === 0) {
                    setSelection('F2'); setActiveCell('F2'); setStep(1); timeout = setTimeout(runStep, 800);
                } else if (step === 1) {
                    setFormulaBar("=VLOOKUP("); setStep(2); timeout = setTimeout(runStep, 600);
                } else if (step === 2) { // Select Lookup Value
                    setSelection('E2'); setFormulaBar("=VLOOKUP(E2,"); setStep(3); timeout = setTimeout(runStep, 1000);
                } else if (step === 3) { // Select Table Array
                    setSelection('A2:C3'); setFormulaBar("=VLOOKUP(E2, A2:C3,"); setStep(4); timeout = setTimeout(runStep, 1000);
                } else if (step === 4) { // Type Col Index
                    setFormulaBar("=VLOOKUP(E2, A2:C3, 2,"); setSelection('F2'); setStep(5); timeout = setTimeout(runStep, 600);
                } else if (step === 5) { // Type Exact Match
                    setFormulaBar("=VLOOKUP(E2, A2:C3, 2, FALSE)"); setStep(6); timeout = setTimeout(runStep, 600);
                } else if (step === 6) {
                    setGrid(prev => ({ ...prev, 'F2': { value: 'Gadget' } }));
                    setIsPlaying(false);
                }
            } else if (type === 'IF') {
                if (step === 0) {
                    setSelection('C2'); setActiveCell('C2'); setStep(1); timeout = setTimeout(runStep, 800);
                } else if (step === 1) {
                    setFormulaBar('=IF(B2>=50, "Pass", "Fail")'); // Simplified typing for demo
                    setStep(2); timeout = setTimeout(runStep, 1500);
                } else if (step === 2) {
                    setGrid(prev => ({ ...prev, 'C2': { value: 'Pass' } }));
                    setSelection('C3'); setActiveCell('C3');
                    setFormulaBar("");
                    setStep(3); timeout = setTimeout(runStep, 800);
                } else if (step === 3) { // AutoFill or Copy
                    setFormulaBar('=IF(B3>=50, "Pass", "Fail")');
                    setGrid(prev => ({ ...prev, 'C3': { value: 'Fail' } }));
                    setIsPlaying(false);
                }
            }
        };

        if (isPlaying) {
            runStep();
        }

        return () => clearTimeout(timeout);
    }, [isPlaying, step, type]);

    const renderCell = (row: number, col: number) => {
        const colChar = String.fromCharCode(65 + col); // 0 -> A
        const cellId = `${colChar}${row + 1}`; // 0,0 -> A1
        const cell = grid[cellId];

        let isSelected = false;
        if (selection) {
            if (selection === cellId) isSelected = true;
            else if (selection.includes(':')) {
                // Simple range check logic (simplified for limited demo grid)
                const [start, end] = selection.split(':');
                // Check if cell is in range (very basic bounding box check)
                // Assuming columns A-Z and single digit rows for demo simplicity
                const sCol = start.charCodeAt(0); const sRow = parseInt(start.substring(1));
                const eCol = end.charCodeAt(0); const eRow = parseInt(end.substring(1));
                const cCol = cellId.charCodeAt(0); const cRow = parseInt(cellId.substring(1));

                if (cCol >= sCol && cCol <= eCol && cRow >= sRow && cRow <= eRow) isSelected = true;
            }
        }

        return (
            <div
                key={cellId}
                className={`
                    border border-slate-700 h-8 flex items-center px-2 text-sm relative
                    ${cell?.isHeader ? 'bg-slate-800 font-bold text-slate-300' : 'bg-slate-900 text-slate-200'}
                    ${cell?.style || ''}
                    ${isSelected ? 'bg-emerald-500/10' : ''}
                `}
            >
                {cell?.value}
                {isSelected && (
                    <div className="absolute inset-0 border-2 border-emerald-500 pointer-events-none z-10">
                        {/* Fill Handle */}
                        {selection === cellId && <div className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 bg-emerald-500" />}
                    </div>
                )}
            </div>
        );
    };

    // 6x6 Grid
    return (
        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col my-6">
            {/* Toolbar Simulator */}
            <div className="bg-emerald-900/20 border-b border-slate-800 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">X</div>
                    <div className="text-xs text-slate-400">Excel Simulator Mode</div>
                </div>
                <button
                    onClick={() => { setupGrid(); setIsPlaying(true); }}
                    className="flex items-center gap-2 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors"
                >
                    {isPlaying ? <RotateCcw size={14} className="animate-spin" /> : <Play size={14} />}
                    {isPlaying ? 'Replaying...' : 'Watch Demo'}
                </button>
            </div>

            {/* Formula Bar */}
            <div className="bg-slate-900 border-b border-slate-800 p-1 flex items-center gap-2 text-sm">
                <div className="w-8 text-center text-slate-500 font-mono border-r border-slate-800">{activeCell || ''}</div>
                <div className="px-2 text-slate-500 font-serif italic">fx</div>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded h-6 flex items-center px-2 font-mono text-slate-200">
                    {formulaBar}
                    {isPlaying && <span className="animate-pulse w-0.5 h-4 bg-emerald-500 ml-0.5"></span>}
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 bg-slate-950 overflow-x-auto">
                <div className="grid grid-cols-[30px_repeat(6,1fr)] gap-0">
                    {/* Header Row */}
                    <div className="bg-slate-900 border border-slate-700"></div>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map(c => (
                        <div key={c} className="bg-slate-900 border border-slate-700 text-center text-xs text-slate-400 py-1">{c}</div>
                    ))}

                    {/* Rows */}
                    {[0, 1, 2, 3, 4, 5].map(row => (
                        <React.Fragment key={row}>
                            <div className="bg-slate-900 border border-slate-700 text-center text-xs text-slate-400 flex items-center justify-center">{row + 1}</div>
                            {[0, 1, 2, 3, 4, 5].map(col => renderCell(row, col))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
