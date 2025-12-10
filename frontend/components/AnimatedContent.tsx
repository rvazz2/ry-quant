"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedContentProps {
    children: ReactNode;
    viewKey: string;
}

export const AnimatedContent = ({ children, viewKey }: AnimatedContentProps) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={viewKey}
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                transition={{
                    duration: 0.3,
                    ease: [0.25, 1, 0.5, 1] // Custom cubic-bezier for "premium" feel
                }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
