import React, { Suspense } from 'react';
import LibraryContent from '@/components/library/LibraryContent';

export default function LibraryPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-slate-500 animate-pulse">Loading Library...</div>}>
                <LibraryContent />
            </Suspense>
        </div>
    );
}
