"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface TimerProps {
    durationMinutes: number;
    onExpire: () => void;
    startTime?: Date;
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function QuizTimer({ durationMinutes, onExpire, startTime }: TimerProps) {
    const totalSeconds = durationMinutes * 60;

    const calcRemaining = useCallback(() => {
        if (!startTime) return totalSeconds;
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        return Math.max(0, totalSeconds - elapsed);
    }, [startTime, totalSeconds]);

    const [remaining, setRemaining] = useState(calcRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            const rem = calcRemaining();
            setRemaining(rem);
            if (rem <= 0) {
                clearInterval(interval);
                onExpire();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [calcRemaining, onExpire]);

    const pct      = (remaining / totalSeconds) * 100;
    const isUrgent = remaining <= 300; // 5 minutes
    const isCritical = remaining <= 60;

    return (
        <div className={[
            "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm transition-all duration-500",
            isCritical ? "bg-red-100 text-red-600 border border-red-200 animate-pulse" :
            isUrgent   ? "bg-amber-50 text-amber-700 border border-amber-200" :
                         "bg-[#EAF3FF] text-[#1D61D2] border border-[#DBEAFE]",
        ].join(" ")}
            aria-live="polite"
            aria-label={`Waktu tersisa: ${formatTime(remaining)}`}
        >
            {isUrgent && <AlertTriangle size={14} />}
            {formatTime(remaining)}
        </div>
    );
}

// ─── Question Navigator ───────────────────────────────────────────────────────

type NavStatus = "NOT_ANSWERED" | "ANSWERED" | "MARKED_REVIEW" | "CURRENT";

interface QuestionNavProps {
    total: number;
    answers: Record<number, number>;       // questionId → optionId (index based here is question index 0-based)
    markedReview: Set<number>;             // 0-based indices
    currentIndex: number;
    onJump: (index: number) => void;
}

const NAV_STYLES: Record<NavStatus, string> = {
    CURRENT:       "bg-[#1D61D2] text-white shadow-md ring-2 ring-[#1D61D2]/30 scale-110",
    ANSWERED:      "bg-emerald-500 text-white",
    MARKED_REVIEW: "bg-amber-400 text-white",
    NOT_ANSWERED:  "bg-gray-100 text-gray-500 hover:bg-gray-200",
};

export function QuestionNavigator({ total, answers, markedReview, currentIndex, onJump }: QuestionNavProps) {
    function getStatus(index: number): NavStatus {
        if (index === currentIndex) return "CURRENT";
        if (markedReview.has(index)) return "MARKED_REVIEW";
        // answers keyed by questionId — using index+1 for 1-based questionId mapping in dummy
        if (Object.prototype.hasOwnProperty.call(answers, index + 1)) return "ANSWERED";
        return "NOT_ANSWERED";
    }

    const answeredCount = Object.keys(answers).length;
    const reviewCount   = markedReview.size;
    const notAnswered   = total - answeredCount;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#0d4669] uppercase tracking-wide">Navigasi Soal</h4>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: total }, (_, i) => {
                    const status = getStatus(i);
                    return (
                        <button
                            key={i}
                            onClick={() => onJump(i)}
                            className={[
                                "w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200",
                                NAV_STYLES[status],
                            ].join(" ")}
                            aria-label={`Soal ${i + 1}: ${status}`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-2 border-t border-gray-50">
                {[
                    { color: "bg-emerald-500", label: "Terjawab", count: answeredCount },
                    { color: "bg-[#1D61D2]",   label: "Sedang dikerjakan", count: 1 },
                    { color: "bg-amber-400",    label: "Ditandai", count: reviewCount },
                    { color: "bg-gray-200",     label: "Belum dijawab", count: notAnswered },
                ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                            <span className="text-[11px] text-gray-500">{item.label}</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Submit Confirmation Modal ────────────────────────────────────────────────

interface SubmitModalProps {
    totalQuestions: number;
    answeredCount: number;
    markedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function SubmitModal({
    totalQuestions,
    answeredCount,
    markedCount,
    onConfirm,
    onCancel,
    isLoading = false,
}: SubmitModalProps) {
    const skipped = totalQuestions - answeredCount;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 24, stiffness: 300 }}
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4"
            >
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-14 h-14 bg-[#EAF3FF] rounded-2xl flex items-center justify-center mb-1">
                        <AlertTriangle size={24} className="text-[#1D61D2]" />
                    </div>
                    <h3 className="text-base font-bold text-[#0d4669]">Submit Quiz?</h3>
                    <p className="text-sm text-gray-500">Pastikan kamu sudah memeriksa semua jawaban sebelum submit.</p>
                </div>

                {/* Summary */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Soal</span>
                        <span className="font-bold text-gray-700">{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">Terjawab</span>
                        <span className="font-bold text-emerald-700">{answeredCount}</span>
                    </div>
                    {markedCount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-amber-600">Ditandai untuk review</span>
                            <span className="font-bold text-amber-700">{markedCount}</span>
                        </div>
                    )}
                    {skipped > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-red-500">Belum dijawab</span>
                            <span className="font-bold text-red-600">{skipped}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Batalkan
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-[#1D61D2] text-white text-sm font-bold hover:bg-[#174EA6] transition-colors active:scale-95 disabled:opacity-60"
                    >
                        {isLoading ? "Mengirim..." : "Submit"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
