"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// const UpdateManager = dynamic(() => import("@/components/UpdateManager"), { ssr: false });
// const PWAUpdater = dynamic(() => import("@/components/PWAUpdater"), { ssr: false });
// const CopilotWidget = dynamic(() => import("@/components/ai/CopilotWidget"), { ssr: false });

export default function GlobalWrappers() {
    return (
        <>
            {/* <UpdateManager /> */}
            {/* <PWAUpdater /> */}
            {/* <CopilotWidget /> */}
        </>
    );
}
