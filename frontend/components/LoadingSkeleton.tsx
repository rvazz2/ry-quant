import React from 'react';
// Re-compile override

interface SkeletonProps {
    className?: string;
}

export const ShimmerSkeleton = ({ className }: SkeletonProps) => {
    return (
        <div className={`relative overflow-hidden bg-slate-800/50 rounded ${className}`}>
            <div className="absolute inset-0 animate-[shimmer-slide_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
        </div>
    );
};
