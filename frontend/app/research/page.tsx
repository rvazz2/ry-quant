import React, { Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Research from '@/components/Research';

export default function ResearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Research...</div>}>
            <DashboardLayout>
                <Research />
            </DashboardLayout>
        </Suspense>
    );
}
