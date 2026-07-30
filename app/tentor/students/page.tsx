"use client"

import { useMemo, useState, useEffect } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { StudentHero } from "@/components/student-tracking/StudentHero"
import { StudentSummaryCards } from "@/components/student-tracking/StudentSummaryCard"
import { StudentList } from "@/components/student-tracking/StudentList"
import { StudentDetail } from "@/components/student-tracking/StudentDetail"
import { PerformanceChart } from "@/components/student-tracking/PerformanceChart"
import { SubjectPerformance } from "@/components/student-tracking/SubjectPerformance"
import { FocusAreaCard } from "@/components/student-tracking/FocusAreaCard"
import { RecentQuizList } from "@/components/student-tracking/RecentQuizList"
import { LearningInsight } from "@/components/student-tracking/LearningInsight"
import { get } from "@/lib/api-bridge"
import { getCookie } from "@/lib/client-cookie"
import { BASE_API_URL } from "@/global"
import type { ClassOverview } from "@/types/student"


interface StudentsPageProps {
    onCancel?: () => void
}

export default function StudentTrackingPage({ onCancel }: StudentsPageProps) {

  const [students, setStudents] = useState<any[]>([])
  const DEFAULT_OVERVIEW: ClassOverview = {
      totalStudents: 0,
      className: "",
      averageScore: 0,
      risingCount: 0,
      topPerformer: { name: "N/A", score: 0 },
      atRiskCount: 0,
      atRiskThreshold: 60,
      longestStreak: { name: "N/A", days: 0 },
      averageCompletion: 0,
      needsAttention: 0,
      totalQuizzes: 0,
      activeQuizzes: 0,
  }

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [detail, setDetail] = useState<any>(null)
  const [classOverview, setClassOverview] = useState<ClassOverview>(DEFAULT_OVERVIEW)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = getCookie("token") as string
        const res = await get(`${BASE_API_URL}/tentor/students`, token)
        if (res.data?.success) {
          const list = res.data.data.students || res.data.data
          setStudents(list)
          if (res.data.data.overview) {
            setClassOverview(res.data.data.overview)
          } else {
             // Basic fallback calc
             const sorted = [...list].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
              setClassOverview({
                  totalStudents: list.length,
                  className: list[0]?.className ?? "",
                  averageScore: list.length
                      ? Math.round(list.reduce((acc: number, s: any) => acc + (s.averageScore || 0), 0) / list.length)
                      : 0,
                  risingCount: 0,
                  topPerformer: {
                      name: sorted[0]?.name ?? "N/A",
                      score: sorted[0]?.averageScore ?? 0,
                  },
                  atRiskCount: list.filter((s: any) => s.needsAttention).length,
                  atRiskThreshold: 60,
                  longestStreak: { name: "N/A", days: 0 },
                  averageCompletion: 0,
                  needsAttention: list.filter((s: any) => s.needsAttention).length,
                  totalQuizzes: 0,
        activeQuizzes: 0,
             })
          }
          if (list.length > 0) {
            setSelectedStudentId(list[0].id || list[0].uuid)
          }
        }
      } catch (error) {
        console.error("Failed to fetch students", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  useEffect(() => {
    if (!selectedStudentId) return
    const fetchDetail = async () => {
      setIsDetailLoading(true)
      try {
        const token = getCookie("token") as string
        const res = await get(`${BASE_API_URL}/tentor/students/${selectedStudentId}`, token)
        if (res.data?.success) {
          setDetail(res.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch student detail", error)
        setDetail(null)
      } finally {
        setIsDetailLoading(false)
      }
    }
    fetchDetail()
  }, [selectedStudentId])


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat data siswa...</div>
  }

  return (
    <>
    <div className="min-h-screen bg-slate-50 pb-16">
      <main className="mx-auto flex max-w-full flex-col gap-6 px-4 pt-6 sm:px-8">
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

          <div className="flex flex-col gap-6">
            {isDetailLoading ? (
               <div className="flex-1 flex items-center justify-center">Memuat detail siswa...</div>
            ) : detail ? (
              <>
                <StudentDetail detail={detail} />
                <PerformanceChart history={detail.performance} />
              </>
            ) : (
               <div className="flex-1 flex items-center justify-center text-gray-500">Pilih siswa untuk melihat detail</div>
            )}
          </div>
        </div>

        {detail && !isDetailLoading && (
          <section aria-label="Class analytics" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SubjectPerformance mastery={detail.subjectMastery} />
            <FocusAreaCard focusAreas={detail.focusAreas} />
            <RecentQuizList quizzes={detail.recentQuizzes} />
            <LearningInsight insights={detail.insights} />
          </section>
        )}
      </main>
    </div>
    </>
  );
}
