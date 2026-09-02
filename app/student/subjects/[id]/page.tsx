"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Clock, BookOpen, TrendingUp, Filter, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { QuizCard } from "@/components/student/subject/quiz-card";
import { useParams } from "next/navigation";
import { get } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";
import { Difficulty, QuizStudentStatus } from "@/app/types";

type StatusFilter = "ALL" | QuizStudentStatus;
type DiffFilter   = "ALL" | Difficulty;

export default function SubjectDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    
    const [subject, setSubject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [diffFilter,   setDiffFilter]   = useState<DiffFilter>("ALL");
    const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

    const fetchedIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (!id ||  fetchedIdRef.current === id) return
        fetchedIdRef.current = id

        const fetchSubjectDetail = async () => {
            try {
                const token = getCookie("token") as string;
                const res = await get(`${BASE_API_URL}/student/subjects/${id}`, token);
                if (res.data?.success) {
                    setSubject(res.data.data);
                    if (res.data.data.modules) {
                        const initialOpen: Record<string, boolean> = {};
                        res.data.data.modules.forEach((m: any) => initialOpen[m.uuid] = true);
                        setOpenModules(initialOpen);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch subject detail", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchSubjectDetail();
    }, [id]);

    const filtered = useMemo(() => {
        if (!subject || !subject.quizzes) return [];
        return subject.quizzes.filter((q: any) => {
            const statusOk = statusFilter === "ALL" || q.student_status === statusFilter;
            const diffOk   = diffFilter   === "ALL" || q.difficulty     === diffFilter;
            return statusOk && diffOk;
        });
    }, [subject, statusFilter, diffFilter]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-96">Memuat Detail Mata Pelajaran...</div>;
    }

    if (!subject) {
        return <div className="text-center text-red-500 mt-10">Mata pelajaran tidak ditemukan.</div>;
    }

    return (
        <div className="space-y-8 pb-12">

            {/* Back */}
            <Link href="/student/subjects">
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1D61D2] transition-colors group">
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Kembali ke Subjects
                </button>
            </Link>

            {/* Subject Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
            >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#F4C430]/10 rounded-full blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-end gap-6 justify-between">
                    {/* Left */}
                    <div>
                        <p className="text-blue-200 text-xs font-medium mb-1">Mata Pelajaran</p>
                        <h1 className="text-2xl md:text-3xl font-bold">{subject.subject_name}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <div className="flex items-center gap-1.5 text-blue-100 text-xs">
                                <BookOpen size={13} /> {subject.total_quiz} Kuis
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-100 text-xs">
                                <Clock size={13} /> ~{Math.floor((subject.estimated_time || 0) / 60)}j {(subject.estimated_time || 0) % 60}m
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-100 text-xs">
                                <TrendingUp size={13} /> Avg {subject.average_score || 0} pts
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-4 max-w-xs">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-blue-200 text-xs">Penyelesaian</span>
                                <span className="text-white text-xs font-bold">{subject.completed_quiz}/{subject.total_quiz}</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${subject.completion_percentage || 0}%` }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full bg-[#F4C430] rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right — big score */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                        <p className="text-blue-200 text-xs mb-1">Rata-rata Skor</p>
                        <p className="text-4xl font-black">{subject.average_score || 0}</p>
                        <p className="text-blue-200 text-xs mt-1">{subject.completion_percentage || 0}% selesai</p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2 items-center"
            >
                {/* Status Filter */}
                {(["ALL", "NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as StatusFilter[]).map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={[
                            "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                            statusFilter === s
                                ? "bg-[#1D61D2] text-white shadow-sm"
                                : "bg-white border border-gray-200 text-gray-500 hover:border-[#1D61D2] hover:text-[#1D61D2]",
                        ].join(" ")}
                    >
                        {s === "ALL" ? "Semua" : s === "NOT_STARTED" ? "Belum" : s === "IN_PROGRESS" ? "Sedang" : "Selesai"}
                    </button>
                ))}

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Difficulty Filter */}
                {(["ALL", "EASY", "MEDIUM", "HARD"] as DiffFilter[]).map(d => (
                    <button
                        key={d}
                        onClick={() => setDiffFilter(d)}
                        className={[
                            "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                            diffFilter === d
                                ? d === "ALL"    ? "bg-gray-800 text-white"
                                  : d === "EASY" ? "bg-emerald-500 text-white"
                                  : d === "MEDIUM" ? "bg-amber-500 text-white"
                                  : "bg-red-500 text-white"
                                : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400",
                        ].join(" ")}
                    >
                        {d === "ALL" ? "Semua" : d === "EASY" ? "Mudah" : d === "MEDIUM" ? "Sedang" : "Sulit"}
                    </button>
                ))}

                {filtered.length < (subject.quizzes?.length || 0) && (
                    <span className="text-xs text-gray-400 ml-1">{filtered.length} ditampilkan</span>
                )}
            </motion.div>

            {/* Quiz Grid Grouped by Module */}
            {filtered.length > 0 ? (
                <div className="space-y-6">
                    {subject.modules?.map((mod: any) => {
                        const moduleQuizzes = mod.quizzes.filter((q: any) => filtered.some((fq: any) => fq.uuid === q.uuid));
                        if (moduleQuizzes.length === 0) return null;

                        const isOpen = openModules[mod.uuid];

                        return (
                            <div key={mod.uuid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Accordion Header */}
                                <button
                                    onClick={() => setOpenModules(prev => ({ ...prev, [mod.uuid]: !prev[mod.uuid] }))}
                                    className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-left">
                                        <h3 className="text-lg font-bold text-gray-900">{mod.module_name}</h3>
                                        {mod.description && (
                                            <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
                                        )}
                                        <div className="text-xs font-medium text-gray-400 mt-2">
                                            {moduleQuizzes.length} Kuis
                                        </div>
                                    </div>
                                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400">
                                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </button>

                                {/* Accordion Content */}
                                {isOpen && (
                                    <div className="p-5 border-t border-gray-100 bg-white">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {moduleQuizzes.map((quiz: any, i: number) => (
                                                <QuizCard key={quiz.uuid || quiz.id} quiz={quiz} subjectUuid={subject.uuid} index={i} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Filter size={36} className="text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-400">Tidak ada kuis yang sesuai filter</p>
                </div>
            )}
        </div>
    );
}
