"use client";

import { motion } from "framer-motion";
import { BookOpen, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { dummyStudentSubjects } from "@/constants/dummy/student-subjects";
import { SubjectCard } from "@/components/student/subject/subject-card";

export default function SubjectsPage() {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() =>
        dummyStudentSubjects.filter(s =>
            s.subject_name.toLowerCase().includes(search.toLowerCase())
        ), [search]);

    const totalQuiz     = dummyStudentSubjects.reduce((a, s) => a + s.total_quiz, 0);
    const completedQuiz = dummyStudentSubjects.reduce((a, s) => a + s.completed_quiz, 0);
    const overallAvg    = Math.round(dummyStudentSubjects.reduce((a, s) => a + s.average_score, 0) / dummyStudentSubjects.length);
    const overallPct    = Math.round((completedQuiz / totalQuiz) * 100);

    return (
        <div className="space-y-8 pb-12">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#083E63]">Mata Pelajaran</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Semua subject yang tersedia di kelasmu</p>
                </div>
                {/* Summary pills */}
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-gray-600">
                        <BookOpen size={12} className="text-[#1D61D2]" />
                        {completedQuiz}/{totalQuiz} Kuis Selesai
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-gray-600">
                        <Filter size={12} className="text-emerald-500" />
                        Rata-rata {overallAvg} pts · {overallPct}% Selesai
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative max-w-sm"
            >
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Cari mata pelajaran..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D61D2]/20 focus:border-[#1D61D2] transition-all"
                />
            </motion.div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {filtered.map((subject, i) => (
                        <SubjectCard key={subject.uuid} subject={subject} index={i} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BookOpen size={40} className="text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-400">Tidak ada mata pelajaran ditemukan</p>
                    <p className="text-xs text-gray-300 mt-1">Coba kata kunci lain</p>
                </div>
            )}
        </div>
    );
}
