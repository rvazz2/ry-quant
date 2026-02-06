"use client";

import React from 'react';
import CryptoEducation from './CryptoEducation';
import CryptoNews from './CryptoNews';

export default function CryptoDashboard() {
    return (
        <div className="space-y-8 relative z-10">
            {/* Crypto Education Section */}
            <CryptoEducation />

            {/* Crypto News Section */}
            <div className="border-t border-[#222] pt-8">
                <CryptoNews />
            </div>
        </div>
    );
}
