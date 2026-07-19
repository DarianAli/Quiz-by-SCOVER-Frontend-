"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Flame, Compass } from "lucide-react";
import { getGreeting } from "@/lib/student/format";

interface StudentHeroBannerProps {
    fullName: string;
    className: string;
    classProgram: string | null;
    streak: number;
    rank: number;
}

function getMotivation(rank: number) {
    if (rank <= 3)  return "Luar biasa! Pertahankan posisimu di puncak! 🏆";
    if (rank <= 10) return "Kamu sangat dekat dengan top 3. Terus semangat! 💪";
    return "Setiap soal yang kamu kerjakan adalah langkah maju. Jangan menyerah! ✨";
}

const TODAY = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
});

export function StudentHeroBanner({ fullName, className, classProgram, streak, rank }: StudentHeroBannerProps) {
    const firstName = fullName.split(" ")[0];

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm">
            {/* Gradient BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2]" />
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#F4C430] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

            {/* Dot pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />

            <div className="relative px-8 md:px-12 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Left */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-white space-y-2"
                >
                    <p className="text-blue-200 text-xs font-medium">{TODAY}</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {getGreeting()}, <span className="text-[#F4C430]">{firstName}!</span> 👋
                    </h1>
                    <p className="text-blue-100 text-sm max-w-md">{getMotivation(rank)}</p>

                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-blue-100 border border-white/10">
                            <BookOpen size={12} className="text-[#F4C430]" />
                            {className}
                            {classProgram && ` · ${classProgram}`}
                        </span>
                        {streak > 0 && (
                            <span className="flex items-center gap-1.5 bg-[#F4C430]/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#F4C430] border border-[#F4C430]/30">
                                <Flame size={12} className="fill-[#F4C430]" />
                                {streak} hari streak
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Right — CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="shrink-0"
                >
                    <Link href="/student/subjects">
                        <button className="flex items-center gap-2.5 px-6 py-3 bg-[#F4C430] text-[#083E63] font-bold rounded-full shadow-lg hover:bg-[#FFD95A] hover:-translate-y-1 transition-all duration-300 active:scale-95 text-sm">
                            <Compass size={18} />
                            Mulai Belajar
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

export default StudentHeroBanner;
