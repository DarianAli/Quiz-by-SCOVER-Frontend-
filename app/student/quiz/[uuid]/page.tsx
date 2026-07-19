"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, ChevronRight, Bookmark, BookmarkCheck,
    BookOpen, Send,
} from "lucide-react";
import { dummyQuizDetail as quiz } from "@/constants/dummy/student-quiz";
import { DifficultyBadge } from "@/components/student/shared/badge";
import {
    QuizTimer,
    QuestionNavigator,
    SubmitModal,
} from "@/components/student/quiz/quiz-components";

export default function QuizPage() {
    const router   = useRouter();
    const startRef = useRef(new Date());

    // State
    const [currentIndex, setCurrentIndex]       = useState(0);
    const [answers, setAnswers]                  = useState<Record<number, number>>({});
    const [markedReview, setMarkedReview]        = useState<Set<number>>(new Set());
    const [showSubmit, setShowSubmit]            = useState(false);
    const [isSubmitting, setIsSubmitting]        = useState(false);
    const [direction, setDirection]              = useState<"next" | "prev">("next");

    const currentQuestion = quiz.questions[currentIndex];
    const totalQuestions  = quiz.questions.length;
    const answeredCount   = Object.keys(answers).length;

    // Select answer (autosave)
    const handleAnswer = useCallback((questionId: number, optionId: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    }, []);

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

    // Submit
    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        // TODO: POST /student/attempt/submit
        await new Promise(r => setTimeout(r, 1200));
        router.push(`/student/result/${quiz.uuid}`);
    }, [router]);

    const handleTimeExpire = useCallback(() => {
        setShowSubmit(true);
    }, []);

    const variants = {
        enter:  (dir: "next" | "prev") => ({ x: dir === "next" ?  40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:   (dir: "next" | "prev") => ({ x: dir === "next" ? -40 :  40, opacity: 0 }),
    };

    const isMarked       = markedReview.has(currentIndex);
    const selectedOption = answers[currentQuestion.idQuestion];

    return (
        <div className="min-h-full pb-10">

            {/* ── Quiz Header ─────────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                    {/* Left: subject + title */}
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D61D2] uppercase tracking-wide">{quiz.subject_name}</p>
                        <h1 className="text-base font-bold text-[#083E63] truncate max-w-[200px] md:max-w-none">{quiz.quiz_title}</h1>
                    </div>

                    {/* Center: progress */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                            <BookOpen size={13} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">
                                {currentIndex + 1}/{totalQuestions}
                            </span>
                        </div>
                        <DifficultyBadge difficulty={quiz.difficulty} />
                    </div>

                    {/* Right: Timer */}
                    <QuizTimer
                        durationMinutes={quiz.duration}
                        onExpire={handleTimeExpire}
                        startTime={startRef.current}
                    />
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
                                            <DifficultyBadge difficulty={currentQuestion.difficulty} />
                                            <span className="text-[11px] text-gray-300">{currentQuestion.poin} poin</span>
                                        </div>
                                    </div>
                                    <p className="text-base md:text-lg font-semibold text-[#0d4669] leading-relaxed">
                                        {currentQuestion.question_text}
                                    </p>
                                    {currentQuestion.question_image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={currentQuestion.question_image}
                                            alt="Gambar soal"
                                            className="mt-4 rounded-xl max-h-48 object-contain border border-gray-100"
                                        />
                                    )}
                                </div>

                                {/* Options */}
                                <div className="px-5 md:px-7 py-5 space-y-3">
                                    {currentQuestion.options.map((option, oi) => {
                                        const isSelected = selectedOption === option.idOption;
                                        const optionLabel = String.fromCharCode(65 + oi); // A, B, C, D
                                        return (
                                            <motion.button
                                                key={option.idOption}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAnswer(currentQuestion.idQuestion, option.idOption)}
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
