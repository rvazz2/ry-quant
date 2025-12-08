"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    delay?: number;
}

export default function Tooltip({
    content,
    children,
    position = "top",
    delay = 200
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState(position);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            adjustPosition();
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const adjustPosition = () => {
        if (!tooltipRef.current || !containerRef.current) return;

        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newPosition = position;

        // Check if tooltip goes off screen and adjust
        if (position === "top" && containerRect.top < tooltipRect.height + 10) {
            newPosition = "bottom";
        } else if (position === "bottom" && containerRect.bottom + tooltipRect.height + 10 > viewportHeight) {
            newPosition = "top";
        } else if (position === "left" && containerRect.left < tooltipRect.width + 10) {
            newPosition = "right";
        } else if (position === "right" && containerRect.right + tooltipRect.width + 10 > viewportWidth) {
            newPosition = "left";
        }

        setActualPosition(newPosition);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const getPositionClasses = () => {
        const baseClasses = "absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 border border-slate-700 rounded-lg shadow-xl whitespace-nowrap";

        switch (actualPosition) {
            case "top":
                return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 mb-2`;
            case "bottom":
                return `${baseClasses} top-full left-1/2 -translate-x-1/2 mt-2`;
            case "left":
                return `${baseClasses} right-full top-1/2 -translate-y-1/2 mr-2`;
            case "right":
                return `${baseClasses} left-full top-1/2 -translate-y-1/2 ml-2`;
            default:
                return baseClasses;
        }
    };

    const getArrowClasses = () => {
        const baseClasses = "absolute w-2 h-2 bg-slate-900 border-slate-700 transform rotate-45";

        switch (actualPosition) {
            case "top":
                return `${baseClasses} bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b`;
            case "bottom":
                return `${baseClasses} top-[-4px] left-1/2 -translate-x-1/2 border-l border-t`;
            case "left":
                return `${baseClasses} right-[-4px] top-1/2 -translate-y-1/2 border-r border-t`;
            case "right":
                return `${baseClasses} left-[-4px] top-1/2 -translate-y-1/2 border-l border-b`;
            default:
                return baseClasses;
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`${getPositionClasses()} animate-in fade-in slide-in-from-bottom-1 duration-200`}
                    role="tooltip"
                >
                    {content}
                    <div className={getArrowClasses()} />
                </div>
            )}
        </div>
    );
}
