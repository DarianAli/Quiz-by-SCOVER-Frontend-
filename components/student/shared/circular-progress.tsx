"use client";

import { motion } from "framer-motion";

interface CircularProgressProps {
    value: number;           // 0-100
    size?: number;           // px
    strokeWidth?: number;
    color?: string;          // stroke color hex
    trackColor?: string;
    label?: string;
    sublabel?: string;
    animate?: boolean;
}

export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 10,
    color = "#1D61D2",
    trackColor = "#EAF3FF",
    label,
    sublabel,
    animate = true,
}: CircularProgressProps) {
    const clamped = Math.min(100, Math.max(0, value));
    const radius  = (size - strokeWidth) / 2;
    const circ    = 2 * Math.PI * radius;
    const offset  = circ - (clamped / 100) * circ;

    return (
        <div className="flex flex-col items-center justify-center gap-1.5" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
                aria-label={`Progress: ${clamped}%`}
                role="img"
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                {animate ? (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                ) : (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                    />
                )}
            </svg>
            {/* Center Text overlay */}
            <div
                className="absolute flex flex-col items-center justify-center"
                style={{ width: size, height: size }}
            >
                {label && <span className="text-xs font-bold text-[#0d4669] leading-none">{label}</span>}
                {sublabel && <span className="text-[10px] text-gray-400 mt-0.5">{sublabel}</span>}
            </div>
        </div>
    );
}

/** Standalone ring that works without absolute positioning - wraps SVG + center label */
export function CircularProgressRing({
    value,
    size = 120,
    strokeWidth = 10,
    color = "#1D61D2",
    trackColor = "#EAF3FF",
    children,
    animate = true,
}: Omit<CircularProgressProps, "label" | "sublabel"> & { children?: React.ReactNode }) {
    const clamped = Math.min(100, Math.max(0, value));
    const radius  = (size - strokeWidth) / 2;
    const circ    = 2 * Math.PI * radius;
    const offset  = circ - (clamped / 100) * circ;

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute inset-0 -rotate-90"
            >
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
                {animate ? (
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth={strokeWidth}
                        strokeLinecap="round" strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                ) : (
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth={strokeWidth}
                        strokeLinecap="round" strokeDasharray={circ}
                        strokeDashoffset={offset}
                    />
                )}
            </svg>
            <div className="relative z-10 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}

export default CircularProgressRing;
