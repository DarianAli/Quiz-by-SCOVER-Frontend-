"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft, ChevronRight, Bookmark, BookmarkCheck,
    BookOpen, Send, AlertCircle,
} from "lucide-react";
import { DifficultyBadge } from "@/components/student/shared/badge";
import { Difficulty } from "@/app/types";
import {
    QuizTimer,
    QuestionNavigator,
    SubmitModal,
} from "@/components/student/quiz/quiz-components";

import { get, post } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";
import { Difficulty } from "@/app/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizOption {
    idOption: number;
    uuid: string;
    option_text: string;
    option_image?: string;
}

interface QuizQuestion {
    idQuestion: number;
    uuid: string;
    question_text: string;
    question_image?: string;
    difficulty: string;
    question_type?: string;
    poin: number;
    options: QuizOption[];
}

interface QuizData {
    uuid: string;
    quiz_title: string;
    difficulty: string;
    duration: number;
    subject_name?: string;
    subject?: { uuid: string; subject_name: string };
    can_attempt?: boolean;
    questions: QuizQuestion[];
}

export default function QuizPage() {
    const router = useRouter();
    const params = useParams<{ uuid: string }>();
    const uuid = params.uuid;

    const startRef = useRef(new Date());

    // State
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    // ✅ answers: { [questionUuid]: optionUuid } — TIDAK menggunakan integer ID
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [markedReview, setMarkedReview] = useState<Set<number>>(new Set());
    const [showSubmit, setShowSubmit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [direction, setDirection] = useState<"next" | "prev">("next");
    const hasInitialized = useRef(false)

    useEffect(() => {
        if (hasInitialized.current) return
        hasInitialized.current = true

        const initQuiz = async () => {
            try {
                const token = getCookie("token") as string;

                // 1. Fetch quiz details via student endpoint (UUID-based)
                const quizRes = await get(`${BASE_API_URL}/student/quiz/${uuid}`, token);

                // ✅ Cek success dari body response (bukan hanya HTTP status)
                if (!quizRes.data?.success) {
                    setError(quizRes.data?.message || "Quiz tidak ditemukan atau tidak bisa diakses.");
                    return;
                }

                const quizData = quizRes.data.data as QuizData;
                setQuiz(quizData);

                // Update start time berdasarkan waktu server (jika resume)
                if (quizData.questions.length === 0) {
                    setError("Quiz ini belum memiliki soal.");
                    return;
                }

                // Cek apakah user diperbolehkan attempt (misal sudah mencapai attempt_limit)
                if (quizData.can_attempt === false) {
                    // Redirect ke halaman result
                    router.replace(`/student/quiz/${uuid}/result`);
                    return;
                }

                // 2. Start / resume attempt — backend cari sendiri attemptId via userId+quizId
                const attemptRes = await post(`${BASE_API_URL}/quiz/${uuid}/attempt/start`, {}, token);

                if (!attemptRes.data?.success) {
                    // Jangan crash — set error dan arahkan kembali
                    setError(attemptRes.data?.message || "Gagal memulai attempt.");
                    setTimeout(() => router.back(), 2000);
                    return;
                }

                const attemptData = attemptRes.data.data;

                // ✅ Jika resume, restore saved_answers menggunakan UUID (bukan integer)
                // saved_answers dari backend berisi { [questionsId]: optionsId } (integer internal)
                // Kita perlu convert ke { [questionUuid]: optionUuid } menggunakan data quiz
                if (attemptData.is_resume && attemptData.saved_answers) {
                    const savedRaw: Record<number, number | string> = attemptData.saved_answers;
                    const restoredAnswers: Record<string, string> = {};

                    for (const q of quizData.questions) {
                        const savedAnswer = savedRaw[q.idQuestion];
                        if (savedAnswer !== undefined) {
                            if (typeof savedAnswer === "string") {
                                // Essay answer_text
                                restoredAnswers[q.uuid] = savedAnswer;
                            } else {
                                // Multiple choice optionId
                                const matchedOption = q.options.find(o => o.idOption === savedAnswer);
                                if (matchedOption) {
                                    restoredAnswers[q.uuid] = matchedOption.uuid;
                                }
                            }
                        }
                    }
                    setAnswers(restoredAnswers);
                }

                // Update start time jika resume
                if (attemptData.start_time) {
                    startRef.current = new Date(attemptData.start_time);
                }

            } catch (err: any) {
                console.error("Quiz init error", err);
                const msg = err?.response?.data?.message
                    ?? err?.message
                    ?? "Gagal menginisialisasi quiz.";
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        };

        if (uuid) initQuiz();
    }, [uuid, router]);

    const currentQuestion = quiz?.questions?.[currentIndex] ?? null;
    const totalQuestions = quiz?.questions?.length ?? 0;
    const answeredCount = Object.keys(answers).length;

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ✅ Autosave jawaban menggunakan UUID — tidak ada integer ID di payload
    // Essay: debounced 600ms. Multiple choice: immediate.
    const handleAnswer = useCallback((questionUuid: string, optionUuid?: string, answer_text?: string) => {
        // Update local state immediately
        setAnswers(prev => ({ ...prev, [questionUuid]: answer_text ?? (optionUuid as string) }));
        if (!quiz || !uuid) return;

        const doSave = async () => {
            try {
                const token = getCookie("token") as string;
                await post(`${BASE_API_URL}/quiz/${uuid}/answers`, {
                    questionUuid,
                    optionUuid,
                    answer_text,
                }, token);
            } catch (err) {
                console.error("Failed to autosave answer", err);
            }
        };

        if (answer_text !== undefined) {
            // Essay: debounce 600ms to avoid hammering the server on every keystroke
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => doSave(), 600);
        } else {
            // Multiple choice: save immediately
            doSave();
        }
    }, [quiz, uuid]);

    // Toggle mark for review
    const toggleMark = useCallback(() => {
        setMarkedReview(prev => {
            const next = new Set(prev);
            if (next.has(currentIndex)) next.delete(currentIndex);
            else next.add(currentIndex);
            return next;
        });
    }, [currentIndex]);

    // Navigate
    const goTo = useCallback((index: number) => {
        setDirection(index > currentIndex ? "next" : "prev");
        setCurrentIndex(index);
    }, [currentIndex]);

    const goPrev = () => { if (currentIndex > 0) goTo(currentIndex - 1); };
    const goNext = () => { if (currentIndex < totalQuestions - 1) goTo(currentIndex + 1); };

    // ✅ Submit — backend cari attempt aktif secara internal via userId+quizUuid
    const handleSubmit = useCallback(async () => {
        if (!quiz || !uuid) return;
        setIsSubmitting(true);
        try {
            const token = getCookie("token") as string;
            // ✅ Tidak ada idAttempt di URL — backend resolves via userId+quizId
            const res = await post(`${BASE_API_URL}/quiz/${uuid}/attempt/submit`, {}, token);
            if (res.data?.success) {
                router.push(`/student/quiz/${uuid}/result`);
            } else {
                alert(res.data?.message || "Gagal mengumpulkan quiz.");
                setIsSubmitting(false);
            }
        } catch (err: any) {
            console.error("Failed to submit", err);
            alert(err?.response?.data?.message ?? "Gagal mengumpulkan quiz.");
            setIsSubmitting(false);
        }
    }, [router, quiz, uuid]);

    const handleTimeExpire = useCallback(() => {
        setShowSubmit(true);
        handleSubmit();
    }, [handleSubmit]);

    const variants = {
        enter: (dir: "next" | "prev") => ({ x: dir === "next" ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: "next" | "prev") => ({ x: dir === "next" ? -40 : 40, opacity: 0 }),
    };

    // ─── Loading state ────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-[#1D61D2] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Memuat kuis...</p>
                </div>
            </div>
        );
    }

    // ─── Error state — tidak crash (white screen), tampil pesan ──────────────
    if (error || !quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                        <AlertCircle size={28} className="text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">
                        {error || "Kuis tidak ditemukan"}
                    </h2>
                    <p className="text-sm text-gray-500">
                        Silakan kembali dan coba lagi. Jika masalah berlanjut, hubungi tentor Anda.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2.5 bg-[#1D61D2] text-white text-sm font-semibold rounded-xl hover:bg-[#174EA6] transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const isMarked = markedReview.has(currentIndex);

    return (
        <div className="min-h-full pb-10">

            {/* ── Quiz Header ─────────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                    {/* Left: subject + title */}
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D61D2] uppercase tracking-wide">
                            {quiz.subject?.subject_name ?? quiz.subject_name}
                        </p>
                        <h1 className="text-base font-bold text-[#083E63] truncate max-w-[200px] md:max-w-none">
                            {quiz.quiz_title}
                        </h1>
                    </div>

                    {/* Center: progress */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                            <BookOpen size={13} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">
                                {currentIndex + 1}/{totalQuestions}
                            </span>
                        </div>
                        {/* ✅ optional chaining — tidak crash jika quiz.difficulty undefined */}
                        <DifficultyBadge difficulty={(quiz?.difficulty as Difficulty) ?? "EASY"} />
                    </div>

                    {/* Right: timer + finish */}
                    <div className="flex items-center gap-3">
                        <QuizTimer
                            durationMinutes={quiz.duration}
                            startTime={startRef.current}
                            onExpire={handleTimeExpire}
                        />
                        <button
                            onClick={() => setShowSubmit(true)}
                            className="hidden sm:flex items-center gap-1.5 bg-[#083E63] hover:bg-[#083E63]/90 text-white px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                            <Send size={14} /> Finish
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#1D61D2] to-[#3B7DDE]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* ── Main Layout ──────────────────────────────────────────── */}
            <div className="flex gap-6 p-5 md:p-8 max-w-[1400px] mx-auto">

                {/* Question Area */}
                <div className="flex-1 min-w-0 space-y-5">

                    {/* Question card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {/* Question Header */}
                                <div className="px-5 md:px-7 pt-5 pb-4 border-b border-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            Soal {currentIndex + 1} dari {totalQuestions}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {/* ✅ optional chaining agar tidak crash */}
                                            <DifficultyBadge difficulty={(currentQuestion?.difficulty as Difficulty) ?? "EASY"} />
                                            <span className="text-[11px] text-gray-300">{currentQuestion?.poin ?? 0} poin</span>
                                        </div>
                                    </div>
                                    <p className="text-base md:text-lg font-semibold text-[#0d4669] leading-relaxed">
                                        {currentQuestion?.question_text}
                                    </p>
                                    {currentQuestion?.question_image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={currentQuestion.question_image}
                                            alt="Gambar soal"
                                            className="mt-4 rounded-xl max-h-48 object-contain border border-gray-100"
                                        />
                                    )}
                                </div>

                                {/* Options / Answer Input */}
                                {(() => {
                                    const qType = currentQuestion?.question_type?.toUpperCase();
                                    const isEssayType = qType === 'ESSAY' || qType === 'SHORT_ANSWER';

                                    if (isEssayType) {
                                        return (
                                            <div className="px-5 md:px-7 py-5">
                                                <textarea
                                                    className="w-full min-h-[180px] p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-[#1D61D2] focus:ring-4 focus:ring-[#1D61D2]/10 transition-all duration-200 resize-y text-sm text-gray-700 leading-relaxed outline-none placeholder:text-gray-300"
                                                    placeholder="Ketik jawaban Anda di sini..."
                                                    value={currentQuestion ? (answers[currentQuestion.uuid] || "") : ""}
                                                    onChange={(e) => currentQuestion && handleAnswer(currentQuestion.uuid, undefined, e.target.value)}
                                                />
                                                <p className="text-xs text-gray-400 mt-2">Jawaban essay akan disimpan otomatis.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="px-5 md:px-7 py-5 space-y-3">
                                            {currentQuestion?.options?.map((option, oi) => {
                                                const isSelected = currentQuestion ? answers[currentQuestion.uuid] === option.uuid : false;
                                                const optionLabel = String.fromCharCode(65 + oi);
                                                return (
                                                    <motion.button
                                                        key={option.uuid}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => currentQuestion && handleAnswer(currentQuestion.uuid, option.uuid)}
                                                        className={[
                                                            "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left",
                                                            "transition-all duration-200 group",
                                                            isSelected
                                                                ? "border-[#1D61D2] bg-[#EAF3FF] shadow-sm"
                                                                : "border-gray-100 bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFC]",
                                                        ].join(" ")}
                                                        aria-pressed={isSelected}
                                                        aria-label={`Pilihan ${optionLabel}: ${option.option_text}`}
                                                    >
                                                        <div className={[
                                                            "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-200",
                                                            isSelected
                                                                ? "bg-[#1D61D2] text-white"
                                                                : "bg-gray-100 text-gray-500 group-hover:bg-[#DBEAFE] group-hover:text-[#1D61D2]",
                                                        ].join(" ")}>
                                                            {optionLabel}
                                                        </div>
                                                        <span className={`text-sm leading-relaxed ${isSelected ? "text-[#0d4669] font-semibold" : "text-gray-700"}`}>
                                                            {option.option_text}
                                                        </span>
                                                        {option.option_image && (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={option.option_image} alt="" className="ml-auto w-16 h-16 object-contain rounded-lg" />
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Bar */}
                    <div className="flex items-center justify-between">
                        {/* Prev */}
                        <button
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <ChevronLeft size={16} /> Sebelumnya
                        </button>

                        {/* Mark + Mobile counter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 md:hidden">{currentIndex + 1}/{totalQuestions}</span>
                            <button
                                onClick={toggleMark}
                                className={[
                                    "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95",
                                    isMarked
                                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                                        : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 border border-transparent",
                                ].join(" ")}
                                aria-pressed={isMarked}
                            >
                                {isMarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                                <span className="hidden sm:inline">{isMarked ? "Ditandai" : "Tandai"}</span>
                            </button>
                        </div>

                        {/* Next / Submit */}
                        {currentIndex < totalQuestions - 1 ? (
                            <button
                                onClick={goNext}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D61D2] text-white text-sm font-bold hover:bg-[#174EA6] transition-all active:scale-95 shadow-sm"
                            >
                                Selanjutnya <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowSubmit(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-sm"
                            >
                                <Send size={14} /> Submit Quiz
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar — Question Navigator (Desktop only) */}
                <div className="hidden lg:block w-56 shrink-0">
                    <div className="sticky top-[90px] space-y-4">
                        <QuestionNavigator
                            total={totalQuestions}
                            answers={answers}
                            markedReview={markedReview}
                            currentIndex={currentIndex}
                            onJump={goTo}
                            // ✅ Kirimkan uuid list untuk key mapping di navigator
                            questionIds={quiz.questions.map(q => q.uuid)}
                        />
                        {/* Submit Button */}
                        <button
                            onClick={() => setShowSubmit(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95 shadow-sm"
                        >
                            <Send size={14} /> Submit Quiz
                        </button>
                        <p className="text-center text-[11px] text-gray-400">
                            {answeredCount}/{totalQuestions} soal terjawab
                        </p>
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
            <AnimatePresence>
                {showSubmit && (
                    <SubmitModal
                        totalQuestions={totalQuestions}
                        answeredCount={answeredCount}
                        markedCount={markedReview.size}
                        onConfirm={handleSubmit}
                        onCancel={() => setShowSubmit(false)}
                        isLoading={isSubmitting}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
