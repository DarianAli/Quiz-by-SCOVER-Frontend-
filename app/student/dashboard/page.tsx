"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Target, Zap, Trophy, Flame,
    BookOpen, AlertTriangle, CheckSquare, Clock,
    TrendingUp, Activity,
} from "lucide-react";

import { timeAgo } from "@/lib/student/format";
import { StatCard } from "@/components/student/shared/stat-card";
import { StudentHeroBanner } from "@/components/student/dashboard/hero-banner";
import { WeeklyChart } from "@/components/student/dashboard/weekly-chart";
import { SubjectMastery } from "@/components/student/dashboard/subject-mastery";
import { RecentQuizList, ContinueLearning } from "@/components/student/dashboard/recent-quiz-list";
import { LeaderboardSection } from "@/components/dashboard/Leaderboard";

import { get } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";

// ─── Section Wrapper ─────────────────────────────────────────────────────────
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
const ACTION_LABEL: Record<string, {text: string, cls: string}> = {
    COMPLETED_QUIZ: { text: "Selesai", cls: "bg-emerald-50 text-emerald-700" },
    STARTED_QUIZ:   { text: "Mulai",   cls: "bg-blue-50 text-blue-700"       },
    REVIEWED_QUIZ:  { text: "Review",  cls: "bg-amber-50 text-amber-700"     },
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = getCookie("token") as string;
                const [dashRes, leadRes] = await Promise.all([
                    get(`${BASE_API_URL}/student/dashboard`, token),
                    get(`${BASE_API_URL}/leaderboard`, token),
                ]);

                // ✅ Cek properti `success` dari body response (sesuai format backend)
                if (dashRes.data?.success) {
                    setData(dashRes.data.data);
                } else {
                    setFetchError(dashRes.data?.message || "Gagal memuat data dashboard.");
                }

                // Leaderboard bersifat opsional — tidak perlu crash jika gagal
                if (leadRes.data?.success) {
                    setLeaderboardData(leadRes.data.data ?? []);
                }
            } catch (error) {
                console.error("Failed to fetch student dashboard", error);
                setFetchError("Terjadi kesalahan saat memuat data. Silakan refresh halaman.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-[#1D61D2] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Memuat Dashboard...</p>
                </div>
            </div>
        );
    }

    if (fetchError || !data) {
        return (
            <div className="text-center py-20 space-y-3">
                <p className="text-red-500 font-semibold">
                    {fetchError || "Gagal memuat data dashboard."}
                </p>
                <p className="text-sm text-gray-400">Coba refresh halaman atau periksa koneksi Anda.</p>
            </div>
        );
    }

    const {
        student, stats, strongest_subject, weakest_subject,
        recent_quizzes, in_progress_quizzes, subject_mastery,
        weekly_scores, recent_activities, module_progress,
    } = data;

    return (
        <div className="space-y-8 pb-12 max-w-full">

            {/* 1 — Hero */}
            <StudentHeroBanner
                fullName={student?.full_name ?? ""}
                className={student?.class_name ?? "—"}
                classProgram={student?.class_program ?? null}
                streak={stats?.current_streak ?? 0}
                rank={stats?.current_rank ?? 0}
            />

            {/* 2 — Leaderboard (after hero, before stats) */}
            <Section
                title="Top Student Standings"
                subtitle="Peringkat akumulasi skor berdasarkan kuis yang telah diselesaikan di kelasmu"
            >
                <LeaderboardSection data={leaderboardData} />
            </Section>

            {/* 3 — Quick Stats Row */}
            <Section title="Statistik Cepat" subtitle="Ringkasan performa belajarmu saat ini">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    <StatCard
                        label="Rata-rata Skor"
                        value={stats?.average_score ?? 0}
                        suffix="pts"
                        icon={<Target size={20} className="text-[#1D61D2]" />}
                        iconBg="bg-[#EAF3FF]"
                        trend={stats?.weekly_progress ?? 0}
                        trendLabel="minggu ini"
                        delay={0}
                    />
                    <StatCard
                        label="Weekly Progress"
                        value={(stats?.weekly_progress ?? 0) >= 0 ? `+${stats?.weekly_progress ?? 0}%` : `${stats?.weekly_progress ?? 0}%`}
                        icon={<TrendingUp size={20} className={(stats?.weekly_progress ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"} />}
                        iconBg={(stats?.weekly_progress ?? 0) >= 0 ? "bg-emerald-50" : "bg-red-50"}
                        description="vs minggu lalu"
                        delay={0.05}
                    />
                    <StatCard
                        label="Peringkat"
                        value={`#${stats?.current_rank ?? 0}`}
                        icon={<Trophy size={20} className="text-[#F4C430]" />}
                        iconBg="bg-[#FFF8E1]"
                        description="di kelasmu"
                        delay={0.1}
                    />
                    <StatCard
                        label="Streak Belajar"
                        value={stats?.current_streak ?? 0}
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
                        value={stats?.completed_quiz ?? 0}
                        sub={`dari ${(stats?.completed_quiz ?? 0) + (stats?.remaining_quiz ?? 0)} total kuis`}
                        icon={<CheckSquare size={18} className="text-emerald-600" />}
                        iconBg="bg-emerald-50"
                    />
                    <OverviewCard
                        label="Kuis Tersisa"
                        value={stats?.remaining_quiz ?? 0}
                        sub="kuis belum dikerjakan"
                        icon={<BookOpen size={18} className="text-purple-600" />}
                        iconBg="bg-purple-50"
                    />
                    <OverviewCard
                        label="Akurasi Rata-rata"
                        value={`${stats?.average_accuracy ?? 0}%`}
                        sub="dari semua jawaban"
                        icon={<Target size={18} className="text-pink-600" />}
                        iconBg="bg-pink-50"
                    />
                    <OverviewCard
                        label="Total Waktu Belajar"
                        value={`${Math.floor((stats?.time_spent ?? 0) / 60)}j ${(stats?.time_spent ?? 0) % 60}m`}
                        sub="total durasi pengerjaan"
                        icon={<Clock size={18} className="text-orange-600" />}
                        iconBg="bg-orange-50"
                    />
                </div>
            </Section>

            {/* 5 — Continue Learning */}
            {in_progress_quizzes?.length > 0 && (
                <Section title="Lanjutkan Belajar" subtitle="Kuis yang belum kamu selesaikan">
                    <ContinueLearning data={in_progress_quizzes} />
                </Section>
            )}

            {/* Learning Progress (Module Progress) */}
            {module_progress?.length > 0 && (
                <Section title="Learning Progress" subtitle="Progres modul yang sedang kamu pelajari">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {module_progress.map((mp: any) => (
                            <div key={mp.module_uuid} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-3">
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">{mp.subject_name}</p>
                                    <h4 className="text-sm font-bold text-gray-900">{mp.module_name}</h4>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs text-gray-500 font-medium">Progres</span>
                                        <span className="text-xs font-bold text-gray-700">{mp.progress_percentage}%</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${mp.progress_percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-[#174EA6] to-[#1D61D2] rounded-full"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2 text-right">{mp.completed} dari {mp.total} Kuis Selesai</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* 6 — Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
                <WeeklyChart data={weekly_scores || []} />
                <SubjectMastery data={subject_mastery || []} />
            </div>

            {/* 7 — Recent Quizzes */}
            <Section title="Kuis Terbaru" subtitle="Riwayat pengerjaan quiz dalam waktu dekat">
                <RecentQuizList data={recent_quizzes || []} />
            </Section>

            {/* 8 — Recent Activity */}
            <Section title="Aktivitas Terkini" subtitle="Log aktivitas belajarmu">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {recent_activities?.map((act: any) => {
                            const badge = ACTION_LABEL[act.action] || { text: act.action, cls: "bg-gray-50 text-gray-700" };
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
                        {recent_activities?.length === 0 && (
                            <div className="px-5 py-4 text-center text-sm text-gray-500">Belum ada aktivitas terbaru</div>
                        )}
                    </div>
                </div>
            </Section>

        </div>
    );
}
