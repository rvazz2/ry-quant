"use client";

import React, { useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { generatePDFReport } from '@/lib/api';

interface ReportButtonProps {
    ticker: string;
}

export default function ReportButton({ ticker }: ReportButtonProps) {
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const blob = await generatePDFReport(ticker);

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${ticker}_Analyst_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4" />
                    Generate Analyst Report
                </>
            )}
        </button>
    );
}
