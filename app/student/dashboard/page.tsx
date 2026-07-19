"use client";

import { motion } from "framer-motion";
import {
    Target, Zap, Trophy, Flame,
    BookOpen, AlertTriangle, CheckSquare, Clock,
    TrendingUp, Activity,
} from "lucide-react";

import { dummyStudentDashboard as data } from "@/constants/dummy/student-dashboard";
import { dummyLeaderboad } from "@/constants/dummy/leaderboard";
import { timeAgo } from "@/lib/student/format";
import { StatCard } from "@/components/student/shared/stat-card";
import { StudentHeroBanner } from "@/components/student/dashboard/hero-banner";
import { WeeklyChart } from "@/components/student/dashboard/weekly-chart";
import { SubjectMastery } from "@/components/student/dashboard/subject-mastery";
import { RecentQuizList, ContinueLearning } from "@/components/student/dashboard/recent-quiz-list";
import { LeaderboardSection } from "@/components/dashboard/Leaderboard";

// ─── Section Wrapper ─────────────────────────────────────────────────────────
// Matches Tentor's SectionTitle: text-xl font-bold, mb-5, text-[#083E63]
function Section({ title, subtitle, children, action }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                <div>
                    <h3 className="text-xl font-bold text-[#083E63]">{title}</h3>
                    {subtitle && (
                        <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            {children}
        </section>
    );
}

// ─── Overview Card ────────────────────────────────────────────────────────────
function OverviewCard({
    label, value, sub, icon, iconBg,
}: { label: string; value: string | number; sub: string; icon: React.ReactNode; iconBg: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className={`p-3 rounded-xl ${iconBg} shrink-0`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold text-[#083E63] leading-tight truncate">{value}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{sub}</p>
            </div>
        </div>
    );
}

// ─── Activity badge map ───────────────────────────────────────────────────────
const ACTION_LABEL = {
    COMPLETED_QUIZ: { text: "Selesai", cls: "bg-emerald-50 text-emerald-700" },
    STARTED_QUIZ:   { text: "Mulai",   cls: "bg-blue-50 text-blue-700"       },
    REVIEWED_QUIZ:  { text: "Review",  cls: "bg-amber-50 text-amber-700"     },
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
    const {
        student, stats, strongest_subject, weakest_subject,
        recent_quizzes, in_progress_quizzes, subject_mastery,
        weekly_scores, recent_activities,
    } = data;

    return (
        <div className="space-y-8 pb-12 max-w-full">

            {/* 1 — Hero */}
            <StudentHeroBanner
                fullName={student.full_name}
                className={student.class_name}
                classProgram={student.class_program}
                streak={stats.current_streak}
                rank={stats.current_rank}
            />

            {/* 2 — Leaderboard (after hero, before stats) */}
            <Section
                title="Top Student Standings"
                subtitle="Peringkat akumulasi skor berdasarkan kuis yang telah diselesaikan di kelasmu"
            >
                <LeaderboardSection data={dummyLeaderboad} />
            </Section>

            {/* 3 — Quick Stats Row */}
            <Section title="Statistik Cepat" subtitle="Ringkasan performa belajarmu saat ini">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    <StatCard
                        label="Rata-rata Skor"
                        value={stats.average_score}
                        suffix="pts"
                        icon={<Target size={20} className="text-[#1D61D2]" />}
                        iconBg="bg-[#EAF3FF]"
                        trend={stats.weekly_progress}
                        trendLabel="minggu ini"
                        delay={0}
                    />
                    <StatCard
                        label="Weekly Progress"
                        value={`+${stats.weekly_progress}%`}
                        icon={<TrendingUp size={20} className="text-emerald-600" />}
                        iconBg="bg-emerald-50"
                        description="vs minggu lalu"
                        delay={0.05}
                    />
                    <StatCard
                        label="Peringkat"
                        value={`#${stats.current_rank}`}
                        icon={<Trophy size={20} className="text-[#F4C430]" />}
                        iconBg="bg-[#FFF8E1]"
                        description="di kelasmu"
                        delay={0.1}
                    />
                    <StatCard
                        label="Streak Belajar"
                        value={stats.current_streak}
                        suffix="hari"
                        icon={<Flame size={20} className="text-orange-500" />}
                        iconBg="bg-orange-50"
                        description="berturut-turut"
                        delay={0.15}
                    />
                </div>
            </Section>

            {/* 4 — Ringkasan Belajar (6-grid) */}
            <Section title="Ringkasan Belajar" subtitle="Detail performa dan progres keseluruhanmu">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                    <OverviewCard
                        label="Terkuat"
                        value={strongest_subject?.subject_name ?? "—"}
                        sub={strongest_subject ? `Rata-rata ${strongest_subject.average_score} pts` : "Belum ada data"}
                        icon={<Zap size={18} className="text-[#1D61D2]" />}
                        iconBg="bg-[#EAF3FF]"
                    />
                    <OverviewCard
                        label="Perlu Ditingkatkan"
                        value={weakest_subject?.subject_name ?? "—"}
                        sub={weakest_subject ? `Rata-rata ${weakest_subject.average_score} pts` : "Belum ada data"}
                        icon={<AlertTriangle size={18} className="text-amber-600" />}
                        iconBg="bg-amber-50"
                    />
                    <OverviewCard
                        label="Kuis Selesai"
                        value={stats.completed_quiz}
                        sub={`dari ${stats.completed_quiz + stats.remaining_quiz} total kuis`}
                        icon={<CheckSquare size={18} className="text-emerald-600" />}
                        iconBg="bg-emerald-50"
                    />
                    <OverviewCard
                        label="Kuis Tersisa"
                        value={stats.remaining_quiz}
                        sub="kuis belum dikerjakan"
                        icon={<BookOpen size={18} className="text-purple-600" />}
                        iconBg="bg-purple-50"
                    />
                    <OverviewCard
                        label="Akurasi Rata-rata"
                        value={`${stats.average_accuracy}%`}
                        sub="dari semua jawaban"
                        icon={<Target size={18} className="text-pink-600" />}
                        iconBg="bg-pink-50"
                    />
                    <OverviewCard
                        label="Total Waktu Belajar"
                        value={`${Math.floor(stats.time_spent / 60)}j ${stats.time_spent % 60}m`}
                        sub="total durasi pengerjaan"
                        icon={<Clock size={18} className="text-orange-600" />}
                        iconBg="bg-orange-50"
                    />
                </div>
            </Section>

            {/* 5 — Continue Learning */}
            {in_progress_quizzes.length > 0 && (
                <Section title="Lanjutkan Belajar" subtitle="Kuis yang belum kamu selesaikan">
                    <ContinueLearning data={in_progress_quizzes} />
                </Section>
            )}

            {/* 6 — Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
                <WeeklyChart data={weekly_scores} />
                <SubjectMastery data={subject_mastery} />
            </div>

            {/* 7 — Recent Quizzes */}
            <Section title="Kuis Terbaru" subtitle="Riwayat pengerjaan quiz dalam waktu dekat">
                <RecentQuizList data={recent_quizzes} />
            </Section>

            {/* 8 — Recent Activity */}
            <Section title="Aktivitas Terkini" subtitle="Log aktivitas belajarmu">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {recent_activities.map((act) => {
                            const badge = ACTION_LABEL[act.action];
                            return (
                                <div key={act.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                                    <div className={`shrink-0 p-2.5 rounded-xl ${
                                        act.action === "COMPLETED_QUIZ" ? "bg-emerald-50" :
                                        act.action === "STARTED_QUIZ"   ? "bg-blue-50"    : "bg-amber-50"
                                    }`}>
                                        <Activity size={16} className={
                                            act.action === "COMPLETED_QUIZ" ? "text-emerald-600" :
                                            act.action === "STARTED_QUIZ"   ? "text-blue-600"    : "text-amber-600"
                                        } />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{act.quiz_title}</p>
                                        <p className="text-xs text-gray-400 truncate">{act.subject_name}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        {act.score !== undefined && (
                                            <span className={`text-sm font-bold ${
                                                act.score >= 80 ? "text-emerald-600" : act.score >= 60 ? "text-amber-600" : "text-red-500"
                                            }`}>{act.score} pts</span>
                                        )}
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.text}</span>
                                        <span className="text-xs text-gray-300">{timeAgo(act.created_at)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Section>

        </div>
    );
}
