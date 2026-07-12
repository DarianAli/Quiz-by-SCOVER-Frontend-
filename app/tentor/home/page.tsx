"use client"

import { LayoutDashboard, BookOpen, Users, Settings, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

import SidebarTemplate from "@/components/SidebarTemplate";
import HeroBanner from "@/components/dashboard/HeroBanner";
import SectionTitle from "@/components/dashboard/SectionTitle";
import SubjectCard from "@/components/dashboard/SubjectCard";
import { LeaderboardSection } from "@/components/dashboard/Leaderboard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";

import { dummyLeaderboad } from "@/constants/dummy/leaderboard";
import { dummySubjects } from "@/constants/dummy/subjects";
import { dummyRecentActivities } from "@/constants/dummy/recentActivity";

export default function TeacherDashboard() {
    const menuList = [
        { id: "home", icon: <LayoutDashboard />, path: "/teacher/dashboard", label: "Dashboard Home", category: "dashboard" as const },
        { id: "subjects", icon: <BookOpen />, path: "/teacher/subjects", label: "My Subjects", category: "dashboard" as const },
        { id: "students", icon: <Users />, path: "/teacher/students", label: "Student Tracking", category: "communication" as const },
        { id: "chat", icon: <MessageSquare />, path: "/teacher/messages", label: "Forum Diskusi", category: "communication" as const },
        { id: "settings", icon: <Settings />, path: "/teacher/settings", label: "Settings", category: "settings" as const },
    ]

    return (
        <SidebarTemplate id="home" title="Teacher Console" menuList={menuList}>
            {/* Dashboard Global Wrapper Container */}
            <div className="space-y-8 pb-12 max-w-full overflow-hidden">

                {/* SECTION 1: Welcome Header Hero Banner */}
                <section className="w-full">
                    <HeroBanner
                        title="Selamat Datang Kembali, Coach!"
                        subtitle="Pantau perfoma kelas, kelola tugas siswa, dan tinjau kemajuan kurikulum akademik hari ini secara langsung."
                        buttonText="Manage All Subject"
                    />
                </section>

                {/* SECTION 2: Performance Evaluation Leaderboard */}
                <section className="space-y-4">
                    <SectionTitle
                        title="Top Student Standings"
                        subtitle="Peringkat akumulasi skor keaktifan siswa berdasarkan kuis serta modul latihan teratas."
                    />
                    <LeaderboardSection data={dummyLeaderboad} />
                </section>

                {/* SECTION 3: Horizontal Carousel List Subject */}
                <section className="space-y-4">
                    <SectionTitle 
                        title="Active Curriculums"
                        subtitle="Daftar kelas pengajar aktif Anda. Geser untuk melihat cakupan modul pengerjaan."
                        action={
                            <Link
                                href="/subjects"
                                className="text-xs font-bold text-[#0B5C8C] hover:text-[#083E63] flex items-center gap-1 transition-colors group bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadows-sm"
                            >
                                See All Classes
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        }
                    />

                    {/* Smooth Horizontl Scrolling Wrapper with Snap Controls */}
                    <div className="w-full overflow-x-auto flex flex-row gap-5 pb-4 pt-1 snap-x snap-mandatory scroll-smooth custom-scroll-horizontal">
                        {dummySubjects.map((sub) => (
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
                        ))}
                    </div>
                </section>

                {/* SECTION 4: Recent Live Work Activity Table Matrix */}
                <section className="space-y-4">
                    <SectionTitle
                        title="Recent Submissions"
                        subtitle="Log aktivitas real-time pengerjaan evaluasi kuis mandiri siswa dari berbagai ruang kelas bimbingan."
                    />
                    <RecentActivityTable data={dummyRecentActivities}/>
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
        </SidebarTemplate>
    )
}