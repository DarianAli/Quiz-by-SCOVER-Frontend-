"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
    TrendingUp, TrendingDown, Minus, Trophy, Flame,
    CheckSquare, Target, Clock, BookOpen, Zap,
} from "lucide-react";
import { CircularProgressRing } from "@/components/student/shared/circular-progress";
import { ProgressBar } from "@/components/student/shared/progress-bar";
import { TrendBadge } from "@/components/student/shared/badge";
import { get } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: {
    title: string; subtitle?: string; children: React.ReactNode;
}) {
    return (
        <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
                <div>
                    <h3 className="text-xl font-bold text-[#083E63]">{title}</h3>
                    {subtitle && (
                        <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
            {children}
        </section>
    );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-gray-600">
                    {p.name === "average_score" ? "Skor" : p.name === "accuracy" ? "Akurasi" : p.name}:{" "}
                    <span className="font-bold text-[#1D61D2]">{p.value}%</span>
                </p>
            ))}
        </div>
    );
};

const SUBJECT_COLORS = ["#1D61D2","#10b981","#F4C430","#8b5cf6","#ec4899","#f97316"];

// ─── Progress Page ────────────────────────────────────────────────────────────

interface MonthlyPerformance {
    month: string;
    average_score: number;
}

interface SubjectProgress {
    subject_name: string;
    trend: "UP" | "DOWN" | "STABLE";
    completed_quiz: number;
    total_quiz: number;
    mastery_percentage: number;
    average_score: number;
}

interface TopicPerformance {
    topic: string;
    subject: string;
    attempts: number;
    accuracy: number;
}

interface ProgressData {
    overall: {
        average_score: number;
        learning_streak: number;
        completed_quiz: number;
        total_time_spent: number;
        completion_rate: number;
        total_quiz: number;
        average_accuracy: number;
    };
    accuracy_trend: { quiz_title: string; accuracy: number; date: string }[];
    monthly_performance: MonthlyPerformance[];
    subject_progress: SubjectProgress[];
    weak_topics: TopicPerformance[];
    strong_topics: TopicPerformance[];
}

export default function ProgressPage() {
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const token = getCookie("token") as string;
                const res = await get(`${BASE_API_URL}/student/progress`, token);
                if (res.data?.success) {
                    setProgress(res.data.data);
                } else {
                    console.error("Failed to load progress");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProgress();
    }, []);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Memuat Progress...</div>;
    }

    if (!progress) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Progress tidak ditemukan.</div>;
    }

    const { overall, subject_progress, monthly_performance, accuracy_trend, weak_topics, strong_topics } = progress;

    return (
        <div className="space-y-8 pb-12 max-w-full">

            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-[#083E63]">Progress Belajar</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">Pantau perkembangan belajarmu secara menyeluruh</p>
            </motion.div>

            {/* ── 1. Overall Performance ────────────────────────────── */}
            <Section title="Performa Keseluruhan" subtitle="Ringkasan semua aktivitas belajarmu">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                    {[
                        { label: "Rata-rata Skor",   value: overall.average_score,    suffix: "pts", icon: <Target size={18}/>,     bg: "bg-[#EAF3FF]",    color: "text-[#1D61D2]" },
                        { label: "Streak Belajar",   value: overall.learning_streak,  suffix: "hari",icon: <Flame size={18}/>,      bg: "bg-orange-50",    color: "text-orange-500" },
                        { label: "Kuis Selesai",     value: overall.completed_quiz,   suffix: "",    icon: <CheckSquare size={18}/>, bg: "bg-emerald-50",   color: "text-emerald-600" },
                        { label: "Total Belajar",    value: `${Math.floor(overall.total_time_spent/60)}j`, suffix: "",icon: <Clock size={16}/>, bg: "bg-purple-50", color: "text-purple-600" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.35 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className={`p-3 rounded-xl ${item.bg} shrink-0`}>
                                <span className={item.color}>{item.icon}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.label}</p>
                                <p className={`text-xl font-black ${item.color} leading-tight tabular-nums`}>
                                    {item.value}<span className="text-sm font-normal text-gray-400 ml-0.5">{item.suffix}</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Completion Ring */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 md:p-6 flex flex-col sm:flex-row items-center gap-6">
                    <CircularProgressRing value={overall.completion_rate} size={120} strokeWidth={11} color="#1D61D2" trackColor="#EAF3FF">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-[#0d4669]">{overall.completion_rate}%</span>
                            <span className="text-[10px] text-gray-400">selesai</span>
                        </div>
                    </CircularProgressRing>
                    <div className="flex-1 space-y-2 w-full">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Penyelesaian Kuis</span>
                            <span className="text-sm font-bold text-[#1D61D2]">{overall.completed_quiz}/{overall.total_quiz}</span>
                        </div>
                        <ProgressBar value={overall.completion_rate} height="md" colorClass="bg-[#1D61D2]" />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Akurasi rata-rata: <strong className="text-gray-700">{overall.average_accuracy}%</strong></span>
                            <span>Waktu total: <strong className="text-gray-700">{Math.floor(overall.total_time_spent/60)}j {overall.total_time_spent % 60}m</strong></span>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── 2. Charts ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* Accuracy Trend Line Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 md:p-6"
                >
                    <div className="mb-5">
                        <h3 className="text-base font-bold text-[#083E63]">Tren Akurasi</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Perkembangan akurasi jawabanmu per minggu</p>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={accuracy_trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone" dataKey="accuracy" stroke="#1D61D2" strokeWidth={2.5}
                                    dot={{ fill: "#1D61D2", r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: "#1D61D2" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Monthly Performance Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 md:p-6"
                >
                    <div className="mb-5">
                        <h3 className="text-base font-bold text-[#083E63]">Performa Bulanan</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Rata-rata skor per bulan dalam 6 bulan terakhir</p>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly_performance} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="average_score" radius={[6, 6, 0, 0]}>
                                    {monthly_performance.map((_, i) => (
                                        <Cell key={i} fill={i === monthly_performance.length - 1 ? "#1D61D2" : "#93C5FD"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* ── 3. Subject Mastery Grid ────────────────────────────── */}
            <Section title="Penguasaan per Mata Pelajaran" subtitle="Detail progress dan rata-rata skor setiap subject">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {subject_progress.map((subj, i) => {
                        const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                        return (
                            <motion.div
                                key={subj.subject_name}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                        <h4 className="text-sm font-bold text-gray-800 truncate max-w-[140px]">{subj.subject_name}</h4>
                                    </div>
                                    <TrendBadge trend={subj.trend} />
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-400">{subj.completed_quiz}/{subj.total_quiz} kuis</span>
                                    <span className="text-xs font-bold" style={{ color }}>{subj.mastery_percentage}%</span>
                                </div>
                                <ProgressBar
                                    value={subj.mastery_percentage}
                                    height="sm"
                                    colorClass=""
                                    animate={false}
                                />
                                {/* Override color inline since TW dynamic classes won't work */}
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden -mt-1.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${subj.mastery_percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                </div>

                                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-50">
                                    <span className="text-xs text-gray-400">Rata-rata Skor</span>
                                    <span className={`text-xs font-black ${
                                        subj.average_score >= 80 ? "text-emerald-600" :
                                        subj.average_score >= 60 ? "text-amber-600" : "text-red-500"
                                    }`}>{subj.average_score} pts</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </Section>

            {/* ── 4. Weak & Strong Topics ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* Strong Topics */}
                <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                        <Zap size={16} className="text-emerald-500" />
                        <h3 className="text-base font-bold text-[#083E63]">Topik Terkuat</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {strong_topics.map((topic, i) => (
                            <div key={topic.topic} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                                <span className="text-xs font-black text-emerald-500 w-5">#{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{topic.topic}</p>
                                    <p className="text-xs text-gray-400">{topic.subject} · {topic.attempts}x dikerjakan</p>
                                </div>
                                <div className="shrink-0">
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{topic.accuracy}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Weak Topics */}
                <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                        <TrendingDown size={16} className="text-red-400" />
                        <h3 className="text-base font-bold text-[#083E63]">Perlu Ditingkatkan</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {weak_topics.map((topic, i) => (
                            <div key={topic.topic} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                                <span className="text-xs font-black text-red-400 w-5">#{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{topic.topic}</p>
                                    <p className="text-xs text-gray-400">{topic.subject} · {topic.attempts}x dikerjakan</p>
                                </div>
                                <div className="shrink-0">
                                    <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">{topic.accuracy}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
