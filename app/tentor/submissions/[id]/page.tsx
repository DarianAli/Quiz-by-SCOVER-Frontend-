"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, FileText, Save } from "lucide-react";
import { get, patch } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";

interface AnswerReview {
    id: number;
    question: {
        id: number;
        uuid: string;
        text: string;
        type: string;
        difficulty: string;
        points: number;
        options: { id: number; uuid: string; text: string; is_correct: boolean }[];
    };
    student_answer: {
        option_id: number | null;
        option_uuid: string | null;
        text: string | null;
        is_correct: boolean | null;
        score: number | null;
        feedback: string | null;
    };
}

interface SubmissionDetail {
    student: { name: string; class: string };
    quiz: { subject: string; title: string };
    score: { total: number; status: string; submitted_at: string; duration: number };
    answers: AnswerReview[];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        WAITING_REVIEW: { label: "Menunggu Review", cls: "bg-amber-50 text-amber-600 border-amber-100" },
        REVIEWED: { label: "Telah Direview", cls: "bg-blue-50 text-blue-600 border-blue-100" },
        AUTO_GRADED: { label: "Selesai (Auto)", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    };
    const { label, cls } = map[status] || { label: status, cls: "bg-gray-50 text-gray-600 border-gray-100" };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{label}</span>;
}

// ─── Question Type Label ──────────────────────────────────────────────────────
function getTypeLabel(type: string): string {
    const map: Record<string, string> = {
        MULTIPLE_CHOICE:  "Pilihan Ganda",
        MULTIPLE_COMPLEX: "Pilihan Ganda Kompleks",
        TRUE_FALSE:       "Benar / Salah",
        FILL_BLANK:       "Isian Singkat",
        SHORT_ANSWER:     "Jawaban Singkat",
        ESSAY:            "Essay",
        MATCHING:         "Menjodohkan",
        STORY_GROUP:      "Cerita / Bacaan",
    };
    return map[type] ?? type;
}

// ─── MC / TF Answer Card ──────────────────────────────────────────────────────
function MultipleChoiceCard({ answer }: { answer: AnswerReview }) {
    const typeLabel = getTypeLabel(answer.question.type);
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#1D61D2] shrink-0">
                    {typeLabel}
                </span>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed flex-1">{answer.question.text}</p>
                <span className="text-xs text-gray-400 shrink-0">{answer.question.points} pts</span>
            </div>
            <div className="p-5 space-y-2">
                {answer.question.options.map(opt => {
                    const isStudentAnswer = opt.id === answer.student_answer.option_id;
                    const isCorrect = opt.is_correct;
                    let cls = "border-gray-100 bg-gray-50/50 text-gray-600";
                    if (isStudentAnswer && isCorrect) cls = "border-emerald-200 bg-emerald-50 text-emerald-700";
                    else if (isStudentAnswer && !isCorrect) cls = "border-red-200 bg-red-50 text-red-700";
                    else if (!isStudentAnswer && isCorrect) cls = "border-emerald-200 bg-emerald-50/50 text-emerald-600";

                    return (
                        <div key={opt.id} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium ${cls}`}>
                            <div className="shrink-0">
                                {isStudentAnswer && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                {isStudentAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                                {!isStudentAnswer && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                {!isStudentAnswer && !isCorrect && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                            </div>
                            <span>{opt.text}</span>
                            {isStudentAnswer && <span className="ml-auto text-xs opacity-70">Jawaban Siswa</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Multiple Complex Answer Card ─────────────────────────────────────────────
function MultipleComplexCard({ answer }: { answer: AnswerReview }) {
    // student_answer.text stores comma-separated integer option IDs
    const selectedIds = new Set(
        (answer.student_answer.text ?? "")
            .split(",")
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n))
    );
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#1D61D2] shrink-0">
                    {getTypeLabel(answer.question.type)}
                </span>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed flex-1">{answer.question.text}</p>
                <span className="text-xs text-gray-400 shrink-0">{answer.question.points} pts</span>
            </div>
            <div className="p-5 space-y-2">
                {!answer.student_answer.text && (
                    <p className="text-sm text-gray-400 italic">Tidak ada jawaban</p>
                )}
                {answer.question.options.map(opt => {
                    const isStudentSelected = selectedIds.has(opt.id);
                    const isCorrect = opt.is_correct;
                    let cls = "border-gray-100 bg-gray-50/50 text-gray-600";
                    if (isStudentSelected && isCorrect) cls = "border-emerald-200 bg-emerald-50 text-emerald-700";
                    else if (isStudentSelected && !isCorrect) cls = "border-red-200 bg-red-50 text-red-700";
                    else if (!isStudentSelected && isCorrect) cls = "border-emerald-200 bg-emerald-50/50 text-emerald-600";

                    return (
                        <div key={opt.id} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium ${cls}`}>
                            <div className="shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center"
                                style={{ borderColor: isStudentSelected ? (isCorrect ? "#10b981" : "#ef4444") : "#d1d5db" }}>
                                {isStudentSelected && <span className="block w-2 h-2 rounded-sm"
                                    style={{ background: isCorrect ? "#10b981" : "#ef4444" }} />}
                            </div>
                            <span className="flex-1">{opt.text}</span>
                            <div className="ml-auto flex items-center gap-1.5 text-xs">
                                {isStudentSelected && <span className="opacity-70">Siswa memilih</span>}
                                {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Fill Blank Answer Card ────────────────────────────────────────────────────
function FillBlankCard({ answer }: { answer: AnswerReview }) {
    const studentText = answer.student_answer.text;
    const correctOptions = answer.question.options.filter(o => o.is_correct);
    // Re-evaluate correctness client-side for display (is_correct on answer is null for text types)
    const isCorrect = !!studentText && correctOptions.some(opt =>
        studentText.trim().toLowerCase() === opt.text.trim().toLowerCase()
    );

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isCorrect ? "border-emerald-200" : studentText ? "border-red-200" : "border-gray-200"}`}>
            <div className="p-5 border-b border-gray-100 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#1D61D2] shrink-0">
                    {getTypeLabel(answer.question.type)}
                </span>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed flex-1">{answer.question.text}</p>
                <span className="text-xs text-gray-400 shrink-0">{answer.question.points} pts</span>
            </div>
            <div className="p-5 space-y-3">
                {/* Student's typed answer */}
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Jawaban Siswa</p>
                    {studentText ? (
                        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium ${isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                            {isCorrect
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                            <span>{studentText}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Tidak ada jawaban</p>
                    )}
                </div>
                {/* Accepted answers */}
                {correctOptions.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Jawaban yang Diterima</p>
                        <div className="flex flex-wrap gap-1.5">
                            {correctOptions.map((opt, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                                    {opt.text}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Essay / Short Answer Card ────────────────────────────────────────────────
function EssayCard({
    answer,
    essayGrades,
    onChange,
}: {
    answer: AnswerReview;
    essayGrades: Record<number, { score: string; feedback: string }>;
    onChange: (id: number, field: "score" | "feedback", value: string) => void;
}) {
    const grade = essayGrades[answer.id] || { score: "", feedback: "" };

    return (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-amber-100 bg-amber-50/50 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 shrink-0 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {answer.question.type === "ESSAY" ? "Essay" : "Short Answer"}
                </span>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed flex-1">{answer.question.text}</p>
                <span className="text-xs text-gray-400 shrink-0">Max {answer.question.points} pts</span>
            </div>

            {/* Student Answer */}
            <div className="p-5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Jawaban Siswa</p>
                {answer.student_answer.text ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                        {answer.student_answer.text}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Tidak ada jawaban</p>
                )}
            </div>

            {/* Grading Section */}
            <div className="p-5 space-y-4">
                <p className="text-xs font-bold text-[#083E63] uppercase tracking-wider">Penilaian Tentor</p>

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                            Nilai (0 – {answer.question.points})
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={answer.question.points}
                            value={grade.score}
                            onChange={e => onChange(answer.id, "score", e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#1D61D2] focus:ring-1 focus:ring-[#1D61D2] transition-all bg-white"
                        />
                    </div>
                    {answer.student_answer.score !== null && answer.student_answer.score !== undefined && (
                        <div className="text-xs text-gray-500 pt-5">
                            Sebelumnya: <span className="font-bold text-[#1D61D2]">{answer.student_answer.score}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        Feedback / Komentar
                    </label>
                    <textarea
                        rows={3}
                        value={grade.feedback}
                        onChange={e => onChange(answer.id, "feedback", e.target.value)}
                        placeholder="Tulis komentar atau feedback untuk siswa..."
                        className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#1D61D2] focus:ring-1 focus:ring-[#1D61D2] transition-all bg-white resize-none"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TentorSubmissionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [detail, setDetail] = useState<SubmissionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Essay grade state: { [answerId]: { score, feedback } }
    const [essayGrades, setEssayGrades] = useState<Record<number, { score: string; feedback: string }>>({});

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            try {
                const token = getCookie("token") as string;
                const res = await get(`${BASE_API_URL}/tentor/submissions/${id}`, token);
                if (res.data?.success) {
                    const data: SubmissionDetail = res.data.data;
                    setDetail(data);

                    // Pre-fill essay grades from existing scores
                    const prefill: Record<number, { score: string; feedback: string }> = {};
                    for (const ans of data.answers) {
                        if (ans.question.type === "ESSAY" || ans.question.type === "SHORT_ANSWER") {
                            prefill[ans.id] = {
                                score: ans.student_answer.score !== null ? String(ans.student_answer.score) : "",
                                feedback: ans.student_answer.feedback || "",
                            };
                        }
                    }
                    setEssayGrades(prefill);
                }
            } catch (err) {
                console.error("Failed to fetch submission detail:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleGradeChange = (answerId: number, field: "score" | "feedback", value: string) => {
        setEssayGrades(prev => ({
            ...prev,
            [answerId]: { ...prev[answerId], [field]: value },
        }));
    };

    const handleSave = async () => {
        if (!detail) return;
        setSaveSuccess(false);
        setSaveError(null);
        setIsSaving(true);

        const essayAnswers = detail.answers.filter(
            a => a.question.type === "ESSAY" || a.question.type === "SHORT_ANSWER"
        );

        const reviews = essayAnswers.map(ans => ({
            answerId: ans.id,
            score: parseInt(essayGrades[ans.id]?.score || "0", 10),
            feedback: essayGrades[ans.id]?.feedback || "",
        }));

        try {
            const token = getCookie("token") as string;
            const res = await patch(`${BASE_API_URL}/tentor/submissions/${id}/review`, { reviews }, token);
            if (res.data?.success) {
                setSaveSuccess(true);
                // Reload to reflect new score
                const refreshRes = await get(`${BASE_API_URL}/tentor/submissions/${id}`, token);
                if (refreshRes.data?.success) setDetail(refreshRes.data.data);
            } else {
                setSaveError(res.data?.message || "Gagal menyimpan penilaian.");
            }
        } catch (err: any) {
            setSaveError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setIsSaving(false);
        }
    };

    const essayAnswers = detail?.answers.filter(a => a.question.type === "ESSAY" || a.question.type === "SHORT_ANSWER") || [];
    const hasEssay = essayAnswers.length > 0;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-5 h-5 border-2 border-[#1D61D2] border-t-transparent rounded-full animate-spin" />
                    Memuat detail submission...
                </div>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-gray-500">Submission tidak ditemukan atau akses ditolak.</p>
                    <button onClick={() => router.back()} className="mt-4 text-sm text-[#1D61D2] font-semibold hover:underline">
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-16 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-[#083E63]">Detail Submission</h1>
                    <p className="text-sm text-gray-500">{detail.quiz.subject} · {detail.quiz.title}</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Siswa</p>
                    <p className="text-base font-bold text-[#083E63] mt-1">{detail.student.name}</p>
                    <p className="text-xs text-gray-500">{detail.student.class}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Tanggal</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                        {new Date(detail.score.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Skor</p>
                    <p className="text-2xl font-bold text-[#1D61D2] mt-1">{detail.score.total}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
                    <div className="mt-1.5">
                        <StatusBadge status={detail.score.status} />
                    </div>
                </div>
            </div>

            {/* Save Banner */}
            {hasEssay && (
                <div className="bg-white rounded-2xl border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Soal Essay memerlukan penilaian manual</p>
                            <p className="text-xs text-gray-500 mt-0.5">Berikan nilai dan feedback untuk setiap jawaban essay, lalu simpan.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1D61D2] text-white rounded-xl text-sm font-semibold hover:bg-[#174EA6] disabled:opacity-60 disabled:cursor-not-allowed transition-all shrink-0"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? "Menyimpan..." : "Simpan Penilaian"}
                    </button>
                </div>
            )}

            {saveSuccess && (
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-5 py-3.5 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5" />
                    Penilaian berhasil disimpan! Skor siswa telah diperbarui.
                </div>
            )}
            {saveError && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-5 py-3.5 rounded-2xl">
                    <XCircle className="w-5 h-5" />
                    {saveError}
                </div>
            )}

            {/* Answers */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Semua Jawaban ({detail.answers.length})
                </h2>
                {detail.answers.map((ans) => {
                    const qType = ans.question.type;
                    if (qType === "ESSAY" || qType === "SHORT_ANSWER") {
                        return (
                            <EssayCard
                                key={ans.id}
                                answer={ans}
                                essayGrades={essayGrades}
                                onChange={handleGradeChange}
                            />
                        );
                    }
                    if (qType === "FILL_BLANK") {
                        return <FillBlankCard key={ans.id} answer={ans} />;
                    }
                    if (qType === "MULTIPLE_COMPLEX") {
                        return <MultipleComplexCard key={ans.id} answer={ans} />;
                    }
                    // MULTIPLE_CHOICE, TRUE_FALSE (and any other option-based types)
                    return <MultipleChoiceCard key={ans.id} answer={ans} />;
                })}
            </div>

            {/* Bottom Save Button */}
            {hasEssay && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1D61D2] text-white rounded-xl text-sm font-semibold hover:bg-[#174EA6] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? "Menyimpan..." : "Simpan Penilaian"}
                    </button>
                </div>
            )}
        </div>
    );
}
