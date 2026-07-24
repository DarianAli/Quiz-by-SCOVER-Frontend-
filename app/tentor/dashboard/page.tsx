"use client"

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroBanner from "@/components/dashboard/HeroBanner";
import SectionTitle from "@/components/dashboard/SectionTitle";
import SubjectCard from "@/components/dashboard/SubjectCard";
import { LeaderboardSection } from "@/components/dashboard/Leaderboard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";



import { useEffect, useState } from "react";
import { get } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";

export default function TeacherDashboard() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = getCookie("token") as string;
                
                // Fetch Dashboard Stats & Recent Submissions
                const resDash = await get(`${BASE_API_URL}/tentor/dashboard`, token);
                if (resDash.data?.status) {
                    setDashboardData(resDash.data.data);
                }

                // Fetch Students for Leaderboard
                const resStudents = await get(`${BASE_API_URL}/tentor/students`, token);
                if (resStudents.data?.status) {
                    setStudentList(resStudents.data.data.students || []);
                }

                // Fetch Subjects
                const resSubjects = await get(`${BASE_API_URL}/subject/all`, token);
                if (resSubjects.data?.status) {
                    setSubjects(resSubjects.data.data || []);
                }

                // Fetch Leaderboard
                const resLeaderboard = await get(`${BASE_API_URL}/leaderboard`, token);
                if (resLeaderboard.data?.status) {
                    setLeaderboardList(resLeaderboard.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching tentor dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Format Data for Components
    const leaderboardData = studentList
        .sort((a, b) => b.average_score - a.average_score)
        .slice(0, 8)
        .map((s, idx) => ({
            id: s.id,
            name: s.name,
            point: s.average_score,
            rank: idx + 1,
            isCurrentUser: false,
        }));

    const subjectCards = subjects.map((sub, idx) => {
        const colors = ["blue", "mint", "yellow", "purple", "pink"];
        return {
            id: sub.uuid || sub.id,
            name: sub.subject_name,
            description: "Modul pembelajaran",
            teacher: "Tentor",
            totalQuiz: 0, // Fallback if backend doesn't provide quiz count in subject list
            progress: 0,
            color: colors[idx % colors.length],
        };
    });

    const recentActivities = dashboardData?.recent_submissions?.map((s: any, idx: number) => ({
        id: `act-${idx}`,
        student: s.student_name,
        subject: s.quiz_title, // Mapping quiz title as subject for now
        className: dashboardData.tentor?.class_name || "Kelas",
        duration: 0,
        score: s.score,
        completedAt: new Date(s.submitted_at).toLocaleString(),
    })) || [];

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>;
    }

    return (
        <>
            {/* Dashboard Global Wrapper Container */}
            <div className="space-y-8 pb-12 max-w-full overflow-hidden">

                {/* SECTION 1: Welcome Header Hero Banner */}
                <section className="w-full">
                    <HeroBanner
                        title={`Selamat Datang Kembali, ${dashboardData?.tentor?.full_name || "Coach"}!`}
                        subtitle="Pantau perfoma kelas, kelola tugas siswa, dan tinjau kemajuan kurikulum akademik hari ini secara langsung."
                        buttonText="Manage All Subject"
                        buttonLink = "/tentor/subject"
                    />
                </section>

                {/* SECTION 2: Performance Evaluation Leaderboard */}
                <section className="space-y-4">
                    <SectionTitle
                        title="Top Student Standings"
                        subtitle="Peringkat akumulasi skor keaktifan siswa berdasarkan kuis serta modul latihan teratas."
                    />
                    <LeaderboardSection data={leaderboardList} />
                </section>

                {/* SECTION 3: Horizontal Carousel List Subject */}
                <section className="space-y-4">
                    <SectionTitle 
                        title="Active Curriculums"
                        subtitle="Daftar kelas pengajar aktif Anda. Geser untuk melihat cakupan modul pengerjaan."
                        action={
                            <Link
                                href="/tentor/subject"
                                className="text-xs font-bold text-[#0B5C8C] hover:text-[#083E63] flex items-center gap-1 transition-colors group bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadows-sm"
                            >
                                See All Subjects
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        }
                    />

                    {/* Smooth Horizontl Scrolling Wrapper with Snap Controls */}
                    <div className="w-full overflow-x-auto flex flex-row gap-5 pb-4 pt-1 snap-x snap-mandatory scroll-smooth custom-scroll-horizontal">
                        {subjectCards.length > 0 ? subjectCards.map((sub: any) => (
                            <div key={sub.id} className="snap-start shrink-0 w-[290px] sm:w-[310px]">
                                <SubjectCard
                                    subject={sub.name}
                                    description={sub.description}
                                    teacher={sub.teacher}
                                    totalQuiz={sub.totalQuiz}
                                    progress={sub.progress}
                                    color={sub.color}
                                />
                            </div>
                        )) : (
                            <div className="text-gray-500 text-sm">Belum ada subject tersedia.</div>
                        )}
                    </div>
                </section>

                {/* SECTION 4: Recent Live Work Activity Table Matrix */}
                <section className="space-y-4">
                    <SectionTitle
                        title="Recent Submissions"
                        subtitle="Log aktivitas real-time pengerjaan evaluasi kuis mandiri siswa dari kelas Anda."
                    />
                    <RecentActivityTable data={recentActivities}/>
                </section>

            </div>

            {/* Global CSS Injector Utilities untuk UI Polish (Notion/Linear Thin Scrollbars & Micro Animation) */}
            <style jsx global>{`
                /* Custom horizontal scrolling optimization for modern look */
                .custom-scrollbar-horizontal::-webkit-scrollbar {
                height: 5px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-track {
                background: transparent;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 9999px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
                background: #cbd5e1;
                }
                
                /* Subtle Fade In Animation Entry for Sections */
                @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                animation: fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    )
}