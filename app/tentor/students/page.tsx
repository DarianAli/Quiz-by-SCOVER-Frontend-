"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { classOverview, students } from "@/constants/dummy/students"
import { getStudentDetail } from "@/constants/dummy/studentDetails"
import { StudentHero } from "@/components/student-tracking/StudentHero"
import { StudentSummaryCards } from "@/components/student-tracking/StudentSummaryCard"
import { StudentList } from "@/components/student-tracking/StudentList"
import { StudentDetail } from "@/components/student-tracking/StudentDetail"
import { PerformanceChart } from "@/components/student-tracking/PerformanceChart"
import { SubjectPerformance } from "@/components/student-tracking/SubjectPerformance"
import { FocusAreaCard } from "@/components/student-tracking/FocusAreaCard"
import { RecentQuizList } from "@/components/student-tracking/RecentQuizList"
import { LearningInsight } from "@/components/student-tracking/LearningInsight"
import { LayoutDashboard, BookOpen, Users, Settings, MessageSquare, ArrowRight } from "lucide-react";
import SidebarTemplate from "@/components/SidebarTemplate";


interface StudentsPageProps {
    onCancel: () => void
}

/**
 * Student Tracking page (Tentor / Teacher role).
 *
 * This is a page-level composition only — every visual piece lives in
 * /components/student-tracking so it stays reusable and easy to test.
 * Swap `students` / `getStudentDetail` for real API calls (e.g. React Query
 * or a server component fetch) without touching any child component; the
 * prop shapes already match the future backend response (see /types/student.ts).
 */
export default function StudentTrackingPage({ onCancel }: StudentsPageProps) {
    const menuList = [
        { id: "home", icon: <LayoutDashboard />, path: "/tentor/home", label: "Dashboard Home", category: "dashboard" as const },
        { id: "subject", icon: <BookOpen />, path: "/tentor/subject", label: "My Subjects", category: "dashboard" as const },
        { id: "students", icon: <Users />, path: "/tentor/students", label: "Student Tracking", category: "communication" as const },
        { id: "chat", icon: <MessageSquare />, path: "/tentor/messages", label: "Forum Diskusi", category: "communication" as const },
        { id: "settings", icon: <Settings />, path: "/tentor/settings", label: "Settings", category: "settings" as const },
    ]

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id ?? ""
  );

  const detail = useMemo(
    () => (selectedStudentId ? getStudentDetail(selectedStudentId) : null),
    [selectedStudentId]
  );

  return (
    <SidebarTemplate id="students" title="Teacher Console" menuList={menuList}>
    <div className="min-h-screen bg-slate-50 pb-16">
      <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 pt-6 sm:px-8">
        <StudentHero overview={classOverview} />
        <StudentSummaryCards overview={classOverview} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="lg:h-[640px]">
            <StudentList
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
            />
          </div>

          {detail && (
            <div className="flex flex-col gap-6">
              <StudentDetail detail={detail} />
              <PerformanceChart history={detail.performance} />
            </div>
          )}
        </div>

        {detail && (
          <section aria-label="Class analytics" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SubjectPerformance mastery={detail.subjectMastery} />
            <FocusAreaCard focusAreas={detail.focusAreas} />
            <RecentQuizList quizzes={detail.recentQuizzes} />
            <LearningInsight insights={detail.insights} />
          </section>
        )}
      </main>
    </div>
    </SidebarTemplate>
  );
}
