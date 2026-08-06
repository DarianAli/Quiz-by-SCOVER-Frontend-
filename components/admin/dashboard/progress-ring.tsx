"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
  progressColor?: string;
}

export function ProgressRing({
  progress,
  size = 76,
  strokeWidth = 7,
  circleColor = "#E2E8F0",
  progressColor = "#1D61D2",
}: ProgressRingProps) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={circleColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Center Percentage Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-extrabold text-slate-900 leading-none">
          {Math.round(clampedProgress)}%
        </span>
      </div>
    </div>
  );
}
