"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Clock, HelpCircle, CheckCircle2, XCircle, Play,
    RotateCcw, Eye, ArrowRight, BookmarkCheck,
} from "lucide-react";
import { IStudentQuizCard, QuizStudentStatus } from "@/app/types";
import { DifficultyBadge, StatusBadge, ScoreBadge } from "@/components/student/shared/badge";

interface QuizCardProps {
    quiz: IStudentQuizCard;
    subjectUuid: string;
    index: number;
}

function QuizActionButton({ quiz }: { quiz: IStudentQuizCard }) {
    const status = quiz.student_status;

    if (status === "NOT_STARTED") {
        return (
            <Link href={`/student/quiz/${quiz.uuid}`}>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1D61D2] text-white text-sm font-bold rounded-xl hover:bg-[#174EA6] transition-colors active:scale-95 shadow-sm">
                    <Play size={14} />
                    Mulai Quiz
                </button>
            </Link>
        );
    }

    if (status === "IN_PROGRESS") {
        return (
            <Link href={`/student/quiz/${quiz.uuid}`}>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors active:scale-95 shadow-sm">
                    <BookmarkCheck size={14} />
                    Lanjutkan
                </button>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link href={`/student/review/${quiz.uuid}`}>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#EAF3FF] text-[#1D61D2] text-sm font-bold rounded-xl hover:bg-[#DBEAFE] transition-colors active:scale-95">
                    <Eye size={13} />
                    Review
                </button>
            </Link>
            <Link href={`/student/quiz/${quiz.uuid}`}>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors active:scale-95">
                    <RotateCcw size={13} />
                    Ulangi
                </button>
            </Link>
        </div>
    );
}

export function QuizCard({ quiz, index }: QuizCardProps) {
    const isCompleted  = quiz.student_status === "COMPLETED";
    const isInProgress = quiz.student_status === "IN_PROGRESS";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={[
                "bg-white rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden",
                "hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition-all duration-300 group",
                isInProgress ? "border-amber-200" : isCompleted ? "border-emerald-100" : "border-gray-100",
            ].join(" ")}
        >
            {/* Top accent bar */}
            <div className={`h-1 ${
                isCompleted ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                isInProgress ? "bg-gradient-to-r from-amber-400 to-amber-500 animate-pulse" :
                "bg-gradient-to-r from-[#3B7DDE] to-[#1D61D2]"
            }`} />

            <div className="p-5 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#083E63] leading-snug group-hover:text-[#1D61D2] transition-colors line-clamp-2">
                            {quiz.quiz_title}
                        </h3>
                    </div>
                    {isCompleted && quiz.last_score !== null && (
                        <ScoreBadge score={quiz.last_score} size="md" />
                    )}
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <DifficultyBadge difficulty={quiz.difficulty} />
                    <StatusBadge status={quiz.student_status} />
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Clock size={13} /> {quiz.duration} menit
                    </div>
                    <div className="flex items-center gap-1">
                        <HelpCircle size={13} /> {quiz.total_questions} soal
                    </div>
                    {isCompleted && quiz.last_correct !== null && quiz.last_wrong !== null && (
                        <>
                            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                                <CheckCircle2 size={13} /> {quiz.last_correct}
                            </div>
                            <div className="flex items-center gap-1 text-red-500 font-semibold">
                                <XCircle size={13} /> {quiz.last_wrong}
                            </div>
                        </>
                    )}
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                    <QuizActionButton quiz={quiz} />
                    {quiz.student_status === "NOT_STARTED" && (
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                            <ArrowRight size={11} />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default QuizCard;
