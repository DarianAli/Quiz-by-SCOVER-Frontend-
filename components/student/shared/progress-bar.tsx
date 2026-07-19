"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
    value: number;              // 0-100
    max?: number;
    label?: string;
    showValue?: boolean;
    height?: "xs" | "sm" | "md";
    colorClass?: string;        // Tailwind class for bar color
    animate?: boolean;
    delay?: number;
}

const HEIGHT_MAP = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2.5",
};

export function ProgressBar({
    value,
    max = 100,
    label,
    showValue = false,
    height = "sm",
    colorClass = "bg-[#1D61D2]",
    animate = true,
    delay = 0,
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex items-center justify-between mb-1.5">
                    {label && <span className="text-xs font-medium text-gray-500">{label}</span>}
                    {showValue && (
                        <span className="text-xs font-bold text-gray-700">{Math.round(percentage)}%</span>
                    )}
                </div>
            )}
            <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${HEIGHT_MAP[height]}`}>
                {animate ? (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${colorClass}`}
                    />
                ) : (
                    <div
                        className={`h-full rounded-full ${colorClass}`}
                        style={{ width: `${percentage}%` }}
                    />
                )}
            </div>
        </div>
    );
}

export default ProgressBar;
