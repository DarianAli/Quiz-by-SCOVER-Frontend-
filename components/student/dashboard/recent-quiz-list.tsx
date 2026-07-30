"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, XCircle, RotateCcw, BookOpen } from "lucide-react";
import { IRecentQuizItem, IInProgressQuizItem } from "@/app/types";
import { DifficultyBadge, ScoreBadge } from "@/components/student/shared/badge";
import { timeAgo } from "@/lib/student/format";

interface RecentQuizListProps {
    data: IRecentQuizItem[];
}

export function RecentQuizList({ data }: RecentQuizListProps) {
    if (!data.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
                <BookOpen size={36} className="text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-400">Belum ada kuis yang dikerjakan</p>
                <p className="text-xs text-gray-300 mt-1">Kerjakan kuis pertamamu sekarang!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-[#083E63]">Kuis Terbaru</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Riwayat kuis yang baru dikerjakan</p>
                </div>
                <Link href="/student/subjects" className="flex items-center gap-1 text-xs font-semibold text-[#1D61D2] hover:text-[#174EA6] group transition-colors">
                    Lihat semua <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="divide-y divide-gray-50">
                {data.map((quiz, i) => {
                    const accuracy = Math.round((quiz.correct / quiz.total_questions) * 100);
                    return (
                        <motion.div
                            key={quiz.score_uuid}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group"
                        >
                            {/* Score ring */}
                            <div className="shrink-0">
                                <ScoreBadge score={quiz.score} size="md" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#1D61D2] transition-colors">
                                    {quiz.quiz_title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-gray-400">{quiz.subject_name}</span>
                                    <span className="text-gray-200">·</span>
                                    <DifficultyBadge difficulty={quiz.difficulty} />
                                    <span className="text-gray-200">·</span>
                                    <span className="text-xs text-gray-400">{timeAgo(quiz.finished_time)}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="hidden sm:flex items-center gap-4 shrink-0">
                                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                    <CheckCircle2 size={12} /> {quiz.correct}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                                    <XCircle size={12} /> {quiz.wrong}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock size={12} /> {quiz.duration_used}m
                                </div>
                                <span className="text-xs font-bold text-gray-500">{accuracy}%</span>
                            </div>

                            {/* Action */}
                            <div className="shrink-0">
                                <Link href={`/student/review/${quiz.quiz_uuid}`}>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1D61D2] bg-[#EAF3FF] hover:bg-[#DBEAFE] transition-colors">
                                        <RotateCcw size={11} />
                                        Review
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Continue Learning ────────────────────────────────────────────────────────

interface ContinueLearningProps {
    data: IInProgressQuizItem[];
}

export function ContinueLearning({ data }: ContinueLearningProps) {
    if (!data.length) return null;

    return (
        <div className="space-y-3">
            {data.map((quiz, i) => (
                <motion.div
                    key={quiz.quiz_uuid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-gradient-to-r from-[#EAF3FF] to-white rounded-2xl border border-[#DBEAFE] p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300"
                >
                    {/* Pulse indicator */}
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1D61D2] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1D61D2] uppercase tracking-wide mb-0.5">Lanjutkan</p>
                        <p className="text-base font-bold text-[#083E63] truncate">{quiz.quiz_title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{quiz.subject_name} · {quiz.total_questions} soal · {quiz.duration} menit</p>
                    </div>

                    <Link href={`/student/quiz/${quiz.quiz_uuid}`}>
                        <button className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#1D61D2] text-white text-sm font-bold rounded-xl hover:bg-[#174EA6] transition-colors active:scale-95">
                            Lanjut <ArrowRight size={14} />
                        </button>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
