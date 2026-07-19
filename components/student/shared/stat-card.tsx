"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    iconBg?: string;
    trend?: number;            // positive = up, negative = down
    trendLabel?: string;
    suffix?: string;
    description?: string;
    delay?: number;
}

export function StatCard({
    label,
    value,
    icon,
    iconBg = "bg-[#EAF3FF]",
    trend,
    trendLabel,
    suffix,
    description,
    delay = 0,
}: StatCardProps) {
    const trendColor = trend === undefined ? "" : trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-gray-400";
    const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</p>
                    <div className="flex items-end gap-1 flex-wrap">
                        <span className="text-2xl md:text-3xl font-bold text-[#0d4669] leading-none tabular-nums">
                            {value}
                        </span>
                        {suffix && (
                            <span className="text-sm font-semibold text-gray-400 mb-0.5">{suffix}</span>
                        )}
                    </div>
                    {(trend !== undefined || description) && (
                        <div className="flex items-center gap-1 mt-2">
                            {TrendIcon && trend !== undefined && (
                                <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
                                    <TrendIcon size={12} />
                                    {Math.abs(trend)}%
                                </span>
                            )}
                            {trendLabel && (
                                <span className="text-xs text-gray-400">{trendLabel}</span>
                            )}
                            {description && !trendLabel && (
                                <span className="text-xs text-gray-400">{description}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${iconBg} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}

export default StatCard;
