"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
    CheckCircle2, XCircle, Clock, SkipForward, Trophy,
    Star, RotateCcw, Eye, ArrowLeft, Zap,
} from "lucide-react";
import { CircularProgressRing } from "@/components/student/shared/circular-progress";
import { DifficultyBadge } from "@/components/student/shared/badge";
import { getScoreColor, formatDuration } from "@/lib/student/format";
import { get } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";
import { Difficulty } from "@/app/types";

// ─── Stat Block ───────────────────────────────────────────────────────────────
function StatBlock({
    icon, label, value, colorClass, bgClass, delay = 0,
}: {
    icon: React.ReactNode; label: string; value: string | number;
    colorClass: string; bgClass: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl ${bgClass} border border-white`}
        >
            <div className={`p-2 rounded-xl bg-white shadow-sm ${colorClass}`}>{icon}</div>
            <p className={`text-2xl font-black tabular-nums ${colorClass}`}>{value}</p>
            <p className="text-xs font-medium text-gray-500 text-center">{label}</p>
        </motion.div>
    );
}

// ─── Question Breakdown Item ──────────────────────────────────────────────────
function BreakdownItem({
    index, question_text, is_correct, is_skipped, answer_text
}: {
    index: number; question_text: string; is_correct: boolean; is_skipped: boolean; answer_text?: string | null;
}) {
    const isEssay = !!answer_text;

    const statusColor = is_skipped
        ? "border-gray-200 bg-gray-50"
        : isEssay
        ? "border-amber-200 bg-amber-50"
        : is_correct
        ? "border-emerald-100 bg-emerald-50/40"
        : "border-red-100 bg-red-50/40";

    const icon = is_skipped
        ? <SkipForward size={14} className="text-gray-400 shrink-0" />
        : isEssay
        ? <Clock size={14} className="text-amber-500 shrink-0" />
        : is_correct
        ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
        : <XCircle size={14} className="text-red-500 shrink-0" />;

    return (
        <div className={`flex flex-col px-4 py-3 rounded-xl border ${statusColor} transition-all`}>
            <div className="flex items-center gap-3">
                <span className="text-xs font-black text-gray-400 w-4 shrink-0">{index}</span>
                {icon}
                <p className="text-xs text-gray-700 line-clamp-1 flex-1">{question_text}</p>
                {isEssay && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">Menunggu Penilaian</span>}
            </div>
            {isEssay && (
                <div className="mt-2 ml-10 text-[11px] text-gray-600 border-l-2 border-amber-300 pl-3 italic">
                    "{answer_text}"
                </div>
            )}
        </div>
    );
}

// ─── Result Page ──────────────────────────────────────────────────────────────
interface QuestionBreakdown {
    question_index: number;
    question_text: string;
    is_correct: boolean;
    is_skipped: boolean;
    answer_text?: string | null;
}

interface ResultData {
    quiz_uuid: string;
    quiz_title: string;
    subject_name: string;
    difficulty: Difficulty;
    score: {
        score: number;
        correct: number;
        wrong: number;
        skipped: number;
        duration_used: number;
        accuracy: number;
    };
    xp_earned: number;
    rank: number;
    question_breakdown: QuestionBreakdown[];
}

export default function ResultPage() {
    const router  = useRouter();
    const params = useParams<{ uuid: string }>();
    const uuid = params.uuid;

    const [result, setResult] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = getCookie("token") as string;
                const res = await get(`${BASE_API_URL}/student/result/${uuid}`, token);
                if (res.data?.success) {
                    setResult(res.data.data);
                } else {
                    setErrorMsg(res.data?.message || "Failed to load result");
                }
            } catch (err: any) {
                console.error(err);
                if (err?.response?.status === 404) {
                    setErrorMsg("Hasil kuis belum tersedia. Pastikan Anda sudah menyelesaikan kuis ini.");
                } else {
                    setErrorMsg(err?.response?.data?.message || "Gagal memuat hasil kuis.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        if (uuid) fetchResult();
    }, [uuid]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Memuat Hasil...</div>;
    }

    if (errorMsg || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-8 max-w-md w-full text-center space-y-5">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-[#083E63]">Gagal Memuat Hasil</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {errorMsg || "Hasil tidak ditemukan."}
                    </p>
                    <button
                        onClick={() => router.push("/student/subjects")}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0d4669] text-white font-bold text-sm hover:bg-[#112B66] transition-all active:scale-95 shadow-sm mt-4"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Daftar Quiz
                    </button>
                </div>
            </div>
        );
    }

    const s       = result.score;
    const color   = getScoreColor(s.score);

    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-8">

            {/* Back */}
            <button
                onClick={() => router.push("/student/subjects")}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0d4669] transition-colors group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Kembali ke Daftar Quiz
            </button>

            {/* ── Score Hero Card ─────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2] px-6 md:px-10 pt-8 pb-16">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                    <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-[#F4C430]/10 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <DifficultyBadge difficulty={result.difficulty} />
                                <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                                    {result.subject_name}
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{result.quiz_title}</h1>
                            <p className={`text-sm font-semibold mt-2 ${color.text} ${color.bg} inline-block px-3 py-1 rounded-full`}>
                                {color.label}
                            </p>
                        </div>

                        {/* XP + Rank */}
                        <div className="flex gap-3 shrink-0">
                            {result.xp_earned > 0 && (
                                <div className="flex flex-col items-center bg-[#F4C430]/20 backdrop-blur-sm rounded-2xl px-4 py-3 border border-[#F4C430]/30">
                                    <Zap size={16} className="text-[#F4C430] mb-1" />
                                    <span className="text-lg font-black text-[#F4C430]">+{result.xp_earned}</span>
                                    <span className="text-[10px] text-blue-200">XP</span>
                                </div>
                            )}
                            {result.rank && (
                                <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                                    <Trophy size={16} className="text-[#F4C430] mb-1" />
                                    <span className="text-lg font-black text-white">#{result.rank}</span>
                                    <span className="text-[10px] text-blue-200">Peringkat</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Score Ring — overlapping the header */}
                <div className="relative -mt-10 flex justify-center">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, type: "spring", damping: 16 }}
                        className="bg-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-1"
                    >
                        <CircularProgressRing value={s.score} size={140} strokeWidth={12} color={color.ring} trackColor={color.track}>
                            <div className="flex flex-col items-center">
                                <span className={`text-3xl font-black ${color.text} tabular-nums`}>{s.score}</span>
                                <span className="text-[11px] text-gray-400 font-medium">/ 100</span>
                            </div>
                        </CircularProgressRing>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="px-6 md:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBlock icon={<CheckCircle2 size={16} />} label="Benar" value={s.correct}
                        colorClass="text-emerald-600" bgClass="bg-emerald-50" delay={0.1} />
                    <StatBlock icon={<XCircle size={16} />} label="Salah" value={s.wrong}
                        colorClass="text-red-500" bgClass="bg-red-50" delay={0.15} />
                    <StatBlock icon={<SkipForward size={16} />} label="Dilewati" value={s.skipped}
                        colorClass="text-gray-400" bgClass="bg-gray-50" delay={0.2} />
                    <StatBlock icon={<Clock size={16} />} label="Waktu Digunakan" value={formatDuration(s.duration_used)}
                        colorClass="text-[#1D61D2]" bgClass="bg-[#EAF3FF]" delay={0.25} />
                </div>

                {/* Accuracy Bar */}
                <div className="px-6 md:px-8 pb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500">Akurasi Jawaban</span>
                        <span className={`text-sm font-black ${color.text}`}>{s.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.accuracy}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(to right, ${color.ring}, ${color.ring}dd)` }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* ── Question Breakdown ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 md:p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-[#0d4669]">Ringkasan Jawaban</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Detail per soal yang kamu kerjakan</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Benar
                        </span>
                        <span className="flex items-center gap-1 text-red-500 font-semibold">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Salah
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 font-semibold">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Lewat
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    {result.question_breakdown.map((q) => (
                        <BreakdownItem
                            key={q.question_index}
                            index={q.question_index}
                            question_text={q.question_text}
                            is_correct={q.is_correct}
                            is_skipped={q.is_skipped}
                            answer_text={q.answer_text}
                        />
                    ))}
                </div>
            </motion.div>

            {/* ── Action Buttons ─────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <Link href={`/student/quiz/${result.quiz_uuid}/review`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#EAF3FF] text-[#1D61D2] font-bold text-sm hover:bg-[#DBEAFE] transition-all active:scale-95 border border-[#DBEAFE]">
                        <Eye size={16} />
                        Review Jawaban
                    </button>
                </Link>
                {result.retake_policy !== "ONCE" && (
                    <Link href={`/student/quiz/${result.quiz_uuid}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 border border-gray-200">
                            <RotateCcw size={16} />
                            Kerjakan Ulang
                        </button>
                    </Link>
                )}
                <Link href="/student/subjects" className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#0d4669] text-white font-bold text-sm hover:bg-[#112B66] transition-all active:scale-95 shadow-sm">
                        <Star size={16} />
                        Kembali ke Subject
                    </button>
                </Link>
            </motion.div>
        </div>
    );
}
