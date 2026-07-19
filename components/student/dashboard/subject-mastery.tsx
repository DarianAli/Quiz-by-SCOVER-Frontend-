"use client";

import { motion } from "framer-motion";
import { ISubjectMasteryItem } from "@/app/types";
import { ProgressBar } from "@/components/student/shared/progress-bar";

interface SubjectMasteryProps {
    data: ISubjectMasteryItem[];
}

function getSubjectColor(index: number): { bar: string; bg: string; text: string } {
    const COLORS = [
        { bar: "bg-[#1D61D2]", bg: "bg-[#EAF3FF]", text: "text-[#1D61D2]" },
        { bar: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
        { bar: "bg-[#F4C430]", bg: "bg-[#FFF8E1]", text: "text-amber-700" },
        { bar: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
        { bar: "bg-pink-500", bg: "bg-pink-50", text: "text-pink-700" },
        { bar: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
    ];
    return COLORS[index % COLORS.length];
}

export function SubjectMastery({ data }: SubjectMasteryProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 md:p-6"
        >
            <div className="mb-5">
                <h3 className="text-base font-bold text-[#083E63]">Penguasaan Materi</h3>
                <p className="text-sm text-gray-500 mt-0.5">Persentase penyelesaian kuis per mata pelajaran</p>
            </div>

            <div className="space-y-4">
                {data.map((subject, i) => {
                    const color = getSubjectColor(i);
                    return (
                        <div key={subject.subject_name} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${color.bar}`} />
                                    <span className="text-xs font-semibold text-gray-700">{subject.subject_name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-gray-400">
                                        {subject.completed}/{subject.total} kuis
                                    </span>
                                    <span className={`text-xs font-bold ${color.text}`}>
                                        {subject.mastery_percentage}%
                                    </span>
                                </div>
                            </div>
                            <ProgressBar
                                value={subject.mastery_percentage}
                                height="sm"
                                colorClass={color.bar}
                                delay={i * 0.1 + 0.1}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">Rata-rata skor:</span>
                                <span className={`text-[10px] font-bold ${
                                    subject.average_score >= 80 ? "text-emerald-600" :
                                    subject.average_score >= 60 ? "text-amber-600" : "text-red-500"
                                }`}>{subject.average_score}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default SubjectMastery;
