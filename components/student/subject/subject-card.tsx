"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { IStudentSubjectSummary } from "@/app/types";
import { ProgressBar } from "@/components/student/shared/progress-bar";

interface SubjectCardProps {
    subject: IStudentSubjectSummary;
    index: number;
}

const SUBJECT_GRADIENTS = [
    "from-[#1D61D2] to-[#174EA6]",
    "from-emerald-500 to-emerald-700",
    "from-purple-500 to-purple-700",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-rose-600",
    "from-teal-500 to-teal-700",
];

const SUBJECT_ICONS = [
    "🧮", "⚗️", "🧬", "📐", "🌍", "📝",
];

export function SubjectCard({ subject, index }: SubjectCardProps) {
    const gradient = SUBJECT_GRADIENTS[index % SUBJECT_GRADIENTS.length];
    const icon     = SUBJECT_ICONS[index % SUBJECT_ICONS.length];
    const remaining = subject.total_quiz - subject.completed_quiz;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] transition-all duration-300 cursor-pointer"
        >
            <Link href={`/student/subjects/${subject.uuid}`} className="block">
                {/* Card Header Gradient */}
                <div className={`bg-gradient-to-br ${gradient} p-6 relative overflow-hidden`}>
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <span className="text-2xl">{icon}</span>
                            <h3 className="text-lg font-bold text-white mt-2 leading-tight">{subject.subject_name}</h3>
                            <p className="text-white/70 text-sm mt-0.5">{subject.total_quiz} kuis tersedia</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                            <span className="text-2xl font-black text-white">{subject.average_score}</span>
                            <p className="text-xs text-white/70 text-center">avg</p>
                        </div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium text-gray-500">Penyelesaian</span>
                            <span className="text-sm font-bold text-gray-700">{subject.completion_percentage}%</span>
                        </div>
                        <ProgressBar
                            value={subject.completion_percentage}
                            height="sm"
                            colorClass={`bg-gradient-to-r ${gradient}`}
                            animate={false}
                        />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="font-semibold text-gray-700">{subject.completed_quiz}</span> selesai
                        </div>
                        <span className="text-gray-200">·</span>
                        {remaining > 0 ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <BookOpen size={14} className="text-blue-400" />
                                <span className="font-semibold text-gray-700">{remaining}</span> tersisa
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                                ✓ Semua selesai
                            </div>
                        )}
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                            <TrendingUp size={13} />
                            <span>Rata-rata: <strong className={`${subject.average_score >= 80 ? "text-emerald-600" : subject.average_score >= 60 ? "text-amber-600" : "text-red-500"}`}>{subject.average_score}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-[#1D61D2] group-hover:gap-2 transition-all duration-200">
                            Lihat Kuis <ArrowRight size={13} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default SubjectCard;
