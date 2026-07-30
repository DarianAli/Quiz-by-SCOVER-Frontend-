"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft, ArrowRight, CheckCircle2, XCircle,
    SkipForward, Bookmark, ChevronLeft, ChevronRight,
    Eye,
} from "lucide-react";
import { DifficultyBadge } from "@/components/student/shared/badge";
import type { IReviewQuestion } from "@/app/types";
import { get } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";

// ─── Status helpers ───────────────────────────────────────────────────────────
type ReviewStatus = "correct" | "wrong" | "marked" | "skipped";

function getQuestionStatus(q: IReviewQuestion): ReviewStatus {
    if (q.is_skipped)        return "skipped";
    if (q.is_marked_review)  return "marked";
    if (q.is_correct)        return "correct";
    return "wrong";
}

const STATUS_NAV: Record<ReviewStatus, string> = {
    correct: "bg-emerald-500 text-white",
    wrong:   "bg-red-500 text-white",
    marked:  "bg-[#F4C430] text-[#0d4669]",
    skipped: "bg-gray-200 text-gray-500",
};

const STATUS_CARD: Record<ReviewStatus, { border: string; badge: React.ReactNode }> = {
    correct: {
        border: "border-emerald-200 bg-emerald-50/30",
        badge: <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-100 px-2.5 py-1 rounded-full"><CheckCircle2 size={13}/> Benar</span>,
    },
    wrong: {
        border: "border-red-200 bg-red-50/30",
        badge: <span className="flex items-center gap-1.5 text-red-700 font-bold text-xs bg-red-100 px-2.5 py-1 rounded-full"><XCircle size={13}/> Salah</span>,
    },
    marked: {
        border: "border-[#F4C430]/50 bg-[#FFF8E1]/50",
        badge: <span className="flex items-center gap-1.5 text-amber-700 font-bold text-xs bg-amber-100 px-2.5 py-1 rounded-full"><Bookmark size={13}/> Ditandai</span>,
    },
    skipped: {
        border: "border-gray-200 bg-gray-50/50",
        badge: <span className="flex items-center gap-1.5 text-gray-500 font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-full"><SkipForward size={13}/> Dilewati</span>,
    },
};

type FilterType = "ALL" | ReviewStatus;

// ─── Review Page ──────────────────────────────────────────────────────────────
export default function ReviewPage() {
    const params = useParams<{ uuid: string }>();
    const uuid = params.uuid;

    const [review, setReview] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [filter, setFilter]             = useState<FilterType>("ALL");
    const [direction, setDirection]       = useState<"next" | "prev">("next");

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const token = getCookie("token") as string;
                const res = await get(`${BASE_API_URL}/student/review/${uuid}`, token);
                if (res.data?.success) {
                    setReview(res.data.data);
                } else {
                    console.error("Failed to load review");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        if (uuid) fetchReview();
    }, [uuid]);

    const filteredQuestions = useMemo(() => {
        if (!review) return [];
        if (filter === "ALL") return review.questions;
        return review.questions.filter((q: IReviewQuestion) => getQuestionStatus(q) === filter);
    }, [filter, review]);

    // Count per status
    const counts = useMemo(() => {
        if (!review) return { correct: 0, wrong: 0, marked: 0, skipped: 0 };
        return {
            correct: review.questions.filter((q: IReviewQuestion) => getQuestionStatus(q) === "correct").length,
            wrong:   review.questions.filter((q: IReviewQuestion) => getQuestionStatus(q) === "wrong").length,
            marked:  review.questions.filter((q: IReviewQuestion) => getQuestionStatus(q) === "marked").length,
            skipped: review.questions.filter((q: IReviewQuestion) => getQuestionStatus(q) === "skipped").length,
        };
    }, [review]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Memuat Review...</div>;
    }

    if (!review) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Review tidak ditemukan.</div>;
    }

    const currentQuestion = filteredQuestions[currentIndex] ?? review.questions[0];
    const status          = getQuestionStatus(currentQuestion);
    const cardStyle       = STATUS_CARD[status];

    function navigate(dir: "prev" | "next") {
        setDirection(dir);
        setCurrentIndex(i =>
            dir === "next"
                ? Math.min(i + 1, filteredQuestions.length - 1)
                : Math.max(i - 1, 0)
        );
    }

    function jumpTo(index: number) {
        setDirection(index > currentIndex ? "next" : "prev");
        setCurrentIndex(index);
    }

    const slideVariants = {
        enter:  (dir: string) => ({ x: dir === "next" ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:   (dir: string) => ({ x: dir === "next" ? -40 : 40, opacity: 0 }),
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-8">

            {/* Back */}
            <Link href={`/student/result/${review.quiz_uuid}`}>
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0d4669] transition-colors group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Kembali ke Hasil
                </button>
            </Link>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2] rounded-2xl p-5 md:p-7 text-white relative overflow-hidden"
            >
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full" />
                <div className="relative">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <DifficultyBadge difficulty={review.difficulty} />
                        <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">{review.subject_name}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">{review.quiz_title}</h1>
                            <div className="flex flex-wrap gap-3 mt-3">
                                <span className="flex items-center gap-1.5 text-xs text-blue-100 bg-white/10 px-3 py-1 rounded-full">
                                    <Eye size={11}/> Review Mode
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                                    ✓ {review.correct_count} Benar
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-red-300 bg-red-500/20 px-3 py-1 rounded-full font-semibold">
                                    ✗ {review.wrong_count} Salah
                                </span>
                                {review.skipped_count > 0 && (
                                    <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                                        — {review.skipped_count} Lewat
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center shrink-0">
                            <p className="text-3xl font-black">{review.score}</p>
                            <p className="text-[10px] text-blue-200">Skor</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {([
                    { key: "ALL",     label: "Semua",    count: review.total_questions, cls: "bg-[#0d4669] text-white" },
                    { key: "correct", label: "✓ Benar",  count: counts.correct, cls: "bg-emerald-500 text-white" },
                    { key: "wrong",   label: "✗ Salah",  count: counts.wrong,   cls: "bg-red-500 text-white" },
                    { key: "marked",  label: "⚑ Ditandai", count: counts.marked, cls: "bg-[#F4C430] text-[#0d4669]" },
                    { key: "skipped", label: "— Lewat",  count: counts.skipped, cls: "bg-gray-400 text-white" },
                ] as const).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setFilter(tab.key as FilterType); setCurrentIndex(0); }}
                        className={[
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                            filter === tab.key ? tab.cls + " shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400",
                        ].join(" ")}
                    >
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            filter === tab.key ? "bg-white/30" : "bg-gray-100"
                        }`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Question Card ──────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Soal {currentIndex + 1} dari {filteredQuestions.length}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate("prev")} disabled={currentIndex === 0}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition-all">
                                <ChevronLeft size={14} />
                            </button>
                            <button onClick={() => navigate("next")} disabled={currentIndex === filteredQuestions.length - 1}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition-all">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={`${currentQuestion.idQuestion}-${filter}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className={`bg-white rounded-2xl border-2 ${cardStyle.border} shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden`}
                        >
                            {/* Question Header */}
                            <div className="px-5 md:px-6 pt-5 pb-4 border-b border-gray-50">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                                            Soal {currentQuestion.question_index}
                                        </span>
                                        <DifficultyBadge difficulty={currentQuestion.difficulty} />
                                    </div>
                                    {cardStyle.badge}
                                </div>
                                <p className="text-sm md:text-base font-semibold text-[#0d4669] leading-relaxed">
                                    {currentQuestion.question_text}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="px-5 md:px-6 py-5 space-y-2.5">
                                {currentQuestion.options?.map((opt: any, oi: number) => {
                                    const label      = String.fromCharCode(65 + oi);
                                    const isSelected = opt.idOption === currentQuestion.selected_option_id;
                                    const isCorrect  = opt.is_correct;

                                    let optStyle = "border-gray-100 bg-white text-gray-600";
                                    if (isCorrect)               optStyle = "border-emerald-300 bg-emerald-50 text-emerald-800";
                                    if (isSelected && !isCorrect) optStyle = "border-red-300 bg-red-50 text-red-800";

                                    return (
                                        <div
                                            key={opt.idOption}
                                            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${optStyle}`}
                                        >
                                            <div className={[
                                                "shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black",
                                                isCorrect ? "bg-emerald-500 text-white" :
                                                isSelected && !isCorrect ? "bg-red-500 text-white" :
                                                "bg-gray-100 text-gray-500",
                                            ].join(" ")}>
                                                {label}
                                            </div>
                                            <span className="text-sm flex-1">{opt.option_text}</span>
                                            <div className="shrink-0">
                                                {isCorrect && <CheckCircle2 size={15} className="text-emerald-500" />}
                                                {isSelected && !isCorrect && <XCircle size={15} className="text-red-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="px-5 md:px-6 pb-5 flex flex-wrap gap-3 text-[11px]">
                                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                    <div className="w-3 h-3 rounded bg-emerald-500" /> Jawaban Benar
                                </span>
                                {currentQuestion.selected_option_id !== null && !currentQuestion.is_correct && (
                                    <span className="flex items-center gap-1 text-red-500 font-semibold">
                                        <div className="w-3 h-3 rounded bg-red-500" /> Jawabanmu
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Mobile nav buttons */}
                    <div className="flex gap-3 lg:hidden">
                        <button onClick={() => navigate("prev")} disabled={currentIndex === 0}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-30">
                            <ChevronLeft size={16} /> Sebelumnya
                        </button>
                        <button onClick={() => navigate("next")} disabled={currentIndex === filteredQuestions.length - 1}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1D61D2] text-white text-sm font-bold hover:bg-[#174EA6] disabled:opacity-40">
                            Selanjutnya <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Navigator Sidebar ──────────────────────────────── */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4">
                        <h4 className="text-xs font-bold text-[#0d4669] uppercase tracking-wide mb-3">Navigator Soal</h4>
                        <div className="grid grid-cols-5 gap-1.5">
                            {filteredQuestions.map((q: any, i: number) => {
                                const s = getQuestionStatus(q);
                                const isCurrent = i === currentIndex;
                                return (
                                    <button
                                        key={q.idQuestion}
                                        onClick={() => jumpTo(i)}
                                        className={[
                                            "w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200",
                                            isCurrent ? "ring-2 ring-[#0d4669] ring-offset-1 scale-110" : "",
                                            STATUS_NAV[s],
                                        ].join(" ")}
                                        title={`Soal ${q.question_index}`}
                                    >
                                        {q.question_index}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 pt-3 border-t border-gray-50 space-y-1.5">
                            {[
                                { color: "bg-emerald-500", label: "Benar",    count: counts.correct },
                                { color: "bg-red-500",     label: "Salah",    count: counts.wrong   },
                                { color: "bg-[#F4C430]",   label: "Ditandai", count: counts.marked  },
                                { color: "bg-gray-300",    label: "Dilewati", count: counts.skipped },
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

                    {/* Score summary */}
                    <div className="bg-[#EAF3FF] rounded-2xl border border-[#DBEAFE] p-4 text-center">
                        <p className="text-xs text-[#1D61D2] font-semibold mb-1">Skor Akhir</p>
                        <p className="text-4xl font-black text-[#0d4669]">{review.score}</p>
                        <p className="text-xs text-gray-500 mt-1">{review.correct_count} dari {review.total_questions} benar</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
