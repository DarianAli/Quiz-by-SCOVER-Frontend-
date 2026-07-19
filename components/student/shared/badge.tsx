"use client";

import { Difficulty, QuizStudentStatus } from "@/app/types";

interface DifficultyBadgeProps {
    difficulty: Difficulty;
    size?: "sm" | "md";
}

const DIFFICULTY_STYLES: Record<Difficulty, { bg: string; text: string; dot: string; label: string }> = {
    [Difficulty.EASY]:   { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500", label: "Mudah"   },
    [Difficulty.MEDIUM]: { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500",   label: "Sedang"  },
    [Difficulty.HARD]:   { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500",     label: "Sulit"   },
};

export function DifficultyBadge({ difficulty, size = "sm" }: DifficultyBadgeProps) {
    const style = DIFFICULTY_STYLES[difficulty];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${style.bg} ${style.text} ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
        </span>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
    status: QuizStudentStatus;
    size?: "sm" | "md";
}

const STATUS_STYLES: Record<QuizStudentStatus, { bg: string; text: string; dot: string; label: string }> = {
    NOT_STARTED:  { bg: "bg-gray-100",      text: "text-gray-600",        dot: "bg-gray-400",        label: "Belum Dikerjakan" },
    IN_PROGRESS:  { bg: "bg-blue-50",       text: "text-blue-700",        dot: "bg-blue-500",        label: "Sedang Dikerjakan" },
    COMPLETED:    { bg: "bg-emerald-50",    text: "text-emerald-700",     dot: "bg-emerald-500",     label: "Selesai" },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    const style = STATUS_STYLES[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${style.bg} ${style.text} ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === "IN_PROGRESS" ? "animate-pulse" : ""}`} />
            {style.label}
        </span>
    );
}

// ─── Score Badge ─────────────────────────────────────────────────────────────

interface ScoreBadgeProps {
    score: number;
    size?: "sm" | "md";
}

export function ScoreBadge({ score, size = "sm" }: ScoreBadgeProps) {
    const style = score >= 80
        ? { bg: "bg-emerald-50", text: "text-emerald-700" }
        : score >= 60
        ? { bg: "bg-amber-50",   text: "text-amber-700"   }
        : { bg: "bg-red-50",     text: "text-red-700"     };

    return (
        <span className={`inline-flex items-center font-bold rounded-lg ${style.bg} ${style.text} ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
            {score}
        </span>
    );
}

// ─── Trend Badge ──────────────────────────────────────────────────────────────

type Trend = "UP" | "DOWN" | "STABLE";

interface TrendBadgeProps {
    trend: Trend;
}

const TREND_STYLE: Record<Trend, { label: string; icon: string; cls: string }> = {
    UP:     { label: "Naik",   icon: "↑", cls: "bg-emerald-50 text-emerald-700" },
    DOWN:   { label: "Turun",  icon: "↓", cls: "bg-red-50 text-red-600"         },
    STABLE: { label: "Stabil", icon: "→", cls: "bg-gray-100 text-gray-500"      },
};

export function TrendBadge({ trend }: TrendBadgeProps) {
    const s = TREND_STYLE[trend];
    return (
        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${s.cls}`}>
            {s.icon} {s.label}
        </span>
    );
}
