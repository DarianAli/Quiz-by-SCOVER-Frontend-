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
import MathText from "@/components/shared/MathText";

import { get, post } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";


// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizOption {
    idOption: number;
    uuid: string;
    option_text: string;
    option_image?: string;
}

interface QuestionImage {
    id: number;
    filename: string;
    url: string;
    order_index: number;
}

interface QuizQuestion {
    idQuestion: number;
    uuid: string;
    question_text: string;
    question_image?: string;
    question_images?: QuestionImage[];
    difficulty: string;
    question_type?: string;
    poin: number;
    options: QuizOption[];
    allow_multiple_answers?: boolean;
    is_strict?: boolean;
    // Children for STORY_GROUP
    children?: QuizQuestion[];
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
    const [quiz, setQuiz]         = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]         = useState<string | null>(null);

    const [currentIndex, setCurrentIndex]   = useState(0);
    // ✅ answers: { [questionUuid]: optionUuid } — TIDAK menggunakan integer ID
    const [answers, setAnswers]             = useState<Record<string, string>>({});
    const [markedReview, setMarkedReview]   = useState<Set<number>>(new Set());
    const [showSubmit, setShowSubmit]       = useState(false);
    const [isSubmitting, setIsSubmitting]   = useState(false);
    const [direction, setDirection]         = useState<"next" | "prev">("next");
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

    const currentQuestion  = quiz?.questions?.[currentIndex] ?? null;
    const totalQuestions   = quiz?.questions?.length ?? 0;
    const answeredCount    = Object.keys(answers).length;

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ✅ Autosave jawaban menggunakan UUID — tidak ada integer ID di payload
    // Essay: debounced 600ms. Multiple choice: immediate.
    // handleAnswer supports three calling conventions:
    // 1. Single choice: handleAnswer(qUuid, optionUuid)
    // 2. Essay/FillBlank: handleAnswer(qUuid, undefined, "text")
    // 3. Multiple Complex: handleAnswer(qUuid, undefined, undefined, ["optUuid1","optUuid2"])
    const handleAnswer = useCallback((
        questionUuid: string,
        optionUuid?: string,
        answer_text?: string,
        optionUuids?: string[]
    ) => {
        // Update local state immediately
        if (optionUuids !== undefined) {
            // Multiple complex: store as JSON-encoded array for display purposes
            setAnswers(prev => ({ ...prev, [questionUuid]: JSON.stringify(optionUuids) }));
        } else {
            setAnswers(prev => ({ ...prev, [questionUuid]: answer_text ?? (optionUuid as string) }));
        }
        if (!quiz || !uuid) return;

        const doSave = async () => {
            try {
                const token = getCookie("token") as string;
                await post(`${BASE_API_URL}/quiz/${uuid}/answers`, {
                    questionUuid,
                    optionUuid,
                    answer_text,
                    optionUuids,
                }, token);
            } catch (err) {
                console.error("Failed to autosave answer", err);
            }
        };

        if (answer_text !== undefined) {
            // Essay / FillBlank: debounce 600ms
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => doSave(), 600);
        } else {
            // Multiple choice / complex: save immediately
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
        enter:  (dir: "next" | "prev") => ({ x: dir === "next" ?  40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:   (dir: "next" | "prev") => ({ x: dir === "next" ? -40 :  40, opacity: 0 }),
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
                                    <MathText
                                        text={currentQuestion?.question_text ?? ""}
                                        className="text-base md:text-lg font-semibold text-[#0d4669] leading-relaxed"
                                    />
                                    {/* Multiple images / attached image support (when not already embedded inline in question_text) */}
                                    {!currentQuestion?.question_text?.includes("![") && (
                                        currentQuestion?.question_images && currentQuestion.question_images.length > 0 ? (
                                            <div className="mt-4 flex flex-col gap-3">
                                                {currentQuestion.question_images.map((img) => (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        key={img.id}
                                                        src={img.url.startsWith("http") || img.url.startsWith("data:") ? img.url : `${BASE_API_URL}${img.url.startsWith("/") ? "" : "/"}${img.url}`}
                                                        alt="Gambar soal"
                                                        className="rounded-xl max-h-48 object-contain border border-gray-100"
                                                    />
                                                ))}
                                            </div>
                                        ) : currentQuestion?.question_image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={currentQuestion.question_image.startsWith("http") || currentQuestion.question_image.startsWith("data:") ? currentQuestion.question_image : `${BASE_API_URL}/public/question_image/${currentQuestion.question_image}`}
                                                alt="Gambar soal"
                                                className="mt-4 rounded-xl max-h-48 object-contain border border-gray-100"
                                            />
                                        ) : null
                                    )}
                                </div>

                                {/* Options / Answer Input */}
                                {(() => {
                                    const qType = currentQuestion?.question_type?.toUpperCase();
                                    const isEssayType    = qType === 'ESSAY' || qType === 'SHORT_ANSWER';
                                    const isFillBlank    = qType === 'FILL_BLANK';
                                    const isMultiComplex = qType === 'MULTIPLE_COMPLEX' || currentQuestion?.allow_multiple_answers;
                                    const isStoryGroup   = qType === 'STORY_GROUP';

                                    // ── Essay / Short Answer ──────────────────────────────────
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

                                    // ── Fill in the Blank ─────────────────────────────────────
                                    if (isFillBlank) {
                                        return (
                                            <div className="px-5 md:px-7 py-5">
                                                <label className="block text-xs font-semibold text-gray-500 mb-2">
                                                    Ketik jawaban untuk melengkapi blank:
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3.5 rounded-xl border-2 border-gray-100 bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 transition-all duration-200 text-sm text-gray-700 outline-none placeholder:text-gray-300"
                                                    placeholder="Ketik jawaban di sini..."
                                                    value={currentQuestion ? (answers[currentQuestion.uuid] || "") : ""}
                                                    onChange={(e) => currentQuestion && handleAnswer(currentQuestion.uuid, undefined, e.target.value)}
                                                />
                                                {currentQuestion?.is_strict && (
                                                    <p className="text-[11px] text-teal-600 mt-1.5 font-medium">
                                                        ⚠ Case-sensitive — perhatikan huruf kapital.
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1.5">Jawaban akan disimpan otomatis.</p>
                                            </div>
                                        );
                                    }

                                    // ── Multiple Complex (checkbox) ───────────────────────────
                                    if (isMultiComplex) {
                                        // Parse selected UUIDs from state (stored as JSON array string)
                                        let selectedUuids: string[] = [];
                                        try {
                                            const raw = currentQuestion ? (answers[currentQuestion.uuid] || "[]") : "[]";
                                            selectedUuids = JSON.parse(raw);
                                            if (!Array.isArray(selectedUuids)) selectedUuids = [];
                                        } catch { selectedUuids = []; }

                                        const toggleOption = (optUuid: string) => {
                                            if (!currentQuestion) return;
                                            const next = selectedUuids.includes(optUuid)
                                                ? selectedUuids.filter(u => u !== optUuid)
                                                : [...selectedUuids, optUuid];
                                            handleAnswer(currentQuestion.uuid, undefined, undefined, next);
                                        };

                                        return (
                                            <div className="px-5 md:px-7 py-5 space-y-3">
                                                <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100">
                                                    ☑ Pilih SEMUA jawaban yang benar.
                                                </p>
                                                {currentQuestion?.options?.map((option, oi) => {
                                                    const isSelected = selectedUuids.includes(option.uuid);
                                                    const optionLabel = String.fromCharCode(65 + oi);
                                                    return (
                                                        <motion.button
                                                            key={option.uuid}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => toggleOption(option.uuid)}
                                                            className={[
                                                                "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left",
                                                                "transition-all duration-200 group",
                                                                isSelected
                                                                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                                                    : "border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30",
                                                            ].join(" ")}
                                                            aria-pressed={isSelected}
                                                            aria-label={`Pilihan ${optionLabel}: ${option.option_text}`}
                                                        >
                                                            {/* Checkbox indicator */}
                                                            <div className={[
                                                                "shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-black transition-all duration-200",
                                                                isSelected
                                                                    ? "bg-indigo-500 border-indigo-500 text-white"
                                                                    : "border-gray-200 bg-gray-50 text-gray-500",
                                                            ].join(" ")}>
                                                                {isSelected ? "✓" : optionLabel}
                                                            </div>
                                                            <MathText
                                                                text={option.option_text}
                                                                className={`text-sm leading-relaxed flex-1 ${isSelected ? "text-indigo-900 font-semibold" : "text-gray-700"}`}
                                                            />
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }

                                    // ── Story Group: story already shown in prompt, show children ──
                                    if (isStoryGroup) {
                                        const children = currentQuestion?.children ?? [];
                                        return (
                                            <div className="px-5 md:px-7 py-5 space-y-6">
                                                {children.length === 0 && (
                                                    <p className="text-sm text-gray-400 italic">
                                                        Soal ini belum memiliki pertanyaan lanjutan.
                                                    </p>
                                                )}
                                                {children.map((child, ci) => {
                                                    const childType  = child.question_type?.toUpperCase();
                                                    const childLabel = String.fromCharCode(97 + ci); // a, b, c ...
                                                    const childAnswerRaw = answers[child.uuid] || "";

                                                    return (
                                                        <div key={child.uuid} className="border border-amber-100 rounded-2xl overflow-hidden bg-white">
                                                            {/* Child question header */}
                                                            <div className="px-4 pt-4 pb-2 border-b border-amber-50">
                                                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                                                                    {ci + 1}. {child.question_type?.replace("_", " ")} · {child.poin} pts
                                                                </span>
                                                                <MathText
                                                                    text={child.question_text}
                                                                    className="text-sm font-semibold text-[#0d4669] mt-1 leading-relaxed"
                                                                />
                                                            </div>

                                                            {/* Child answer area */}
                                                            <div className="p-4">
                                                                {(childType === 'ESSAY' || childType === 'SHORT_ANSWER') ? (
                                                                    <textarea
                                                                        className="w-full min-h-[100px] p-3 rounded-xl border-2 border-gray-100 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-sm text-gray-700 outline-none placeholder:text-gray-300 resize-y"
                                                                        placeholder="Ketik jawaban..."
                                                                        value={childAnswerRaw}
                                                                        onChange={(e) => handleAnswer(child.uuid, undefined, e.target.value)}
                                                                    />
                                                                ) : childType === 'FILL_BLANK' ? (
                                                                    <input
                                                                        type="text"
                                                                        className="w-full p-3 rounded-xl border-2 border-gray-100 bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 transition-all text-sm text-gray-700 outline-none placeholder:text-gray-300"
                                                                        placeholder="Isi blank..."
                                                                        value={childAnswerRaw}
                                                                        onChange={(e) => handleAnswer(child.uuid, undefined, e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        {child.options?.map((opt, oi) => {
                                                                            const childType2 = child.question_type?.toUpperCase();
                                                                            const isMulti2 = childType2 === 'MULTIPLE_COMPLEX' || child.allow_multiple_answers;
                                                                            let isSelected2 = false;

                                                                            if (isMulti2) {
                                                                                try {
                                                                                    const arr = JSON.parse(childAnswerRaw || "[]");
                                                                                    isSelected2 = Array.isArray(arr) && arr.includes(opt.uuid);
                                                                                } catch { isSelected2 = false; }
                                                                            } else {
                                                                                isSelected2 = childAnswerRaw === opt.uuid;
                                                                            }

                                                                            const optLabel = String.fromCharCode(65 + oi);
                                                                            return (
                                                                                <motion.button
                                                                                    key={opt.uuid}
                                                                                    whileTap={{ scale: 0.98 }}
                                                                                    onClick={() => {
                                                                                        if (isMulti2) {
                                                                                            let arr: string[] = [];
                                                                                            try { arr = JSON.parse(childAnswerRaw || "[]"); } catch {}
                                                                                            const next = arr.includes(opt.uuid)
                                                                                                ? arr.filter(u => u !== opt.uuid)
                                                                                                : [...arr, opt.uuid];
                                                                                            handleAnswer(child.uuid, undefined, undefined, next);
                                                                                        } else {
                                                                                            handleAnswer(child.uuid, opt.uuid);
                                                                                        }
                                                                                    }}
                                                                                    className={[
                                                                                        "w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 group",
                                                                                        isSelected2
                                                                                            ? "border-amber-400 bg-amber-50 shadow-sm"
                                                                                            : "border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/30",
                                                                                    ].join(" ")}
                                                                                    aria-pressed={isSelected2}
                                                                                >
                                                                                    <div className={[
                                                                                        "shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black transition-all",
                                                                                        isSelected2 ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500",
                                                                                    ].join(" ")}>
                                                                                        {isSelected2 && isMulti2 ? "✓" : optLabel}
                                                                                    </div>
                                                                                    <MathText
                                                                                        text={opt.option_text}
                                                                                        className={`text-sm flex-1 ${isSelected2 ? "text-amber-900 font-semibold" : "text-gray-700"}`}
                                                                                    />
                                                                                </motion.button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }

                                    // ── Standard single-choice (Multiple Choice, True/False) ──
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
                                                        <MathText
                                                            text={option.option_text}
                                                            className={`text-sm leading-relaxed ${isSelected ? "text-[#0d4669] font-semibold" : "text-gray-700"}`}
                                                        />
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
