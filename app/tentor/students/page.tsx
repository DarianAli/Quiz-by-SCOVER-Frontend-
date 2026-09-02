"use client"

import { useState, useEffect } from "react"
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

/**
 * Petakan `class_overview` (snake_case dari backend) ke ClassOverview (camelCase).
 * Backend returns: { total_student, class_average, top_score, completion_rate }
 */
function mapClassOverview(raw: Record<string, unknown>, students: any[]): ClassOverview {
    const sorted = [...students].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
    const topStudent = sorted[0]

    return {
        totalStudents:     Number(raw.total_student ?? students.length),
        className:         students[0]?.className ?? "",
        averageScore:      Number(raw.class_average ?? 0),
        risingCount:       students.filter((s) => s.trend?.direction === "up").length,
        topPerformer: {
            name:  topStudent?.name ?? "N/A",
            score: topStudent?.averageScore ?? 0,
        },
        atRiskCount:       students.filter((s) => s.atRisk).length,
        atRiskThreshold:   60,
        longestStreak:     { name: "N/A", days: 0 },
        averageCompletion: Number(raw.completion_rate ?? 0),
        needsAttention:    students.filter((s) => s.atRisk).length,
        totalQuizzes:      0,
        activeQuizzes:     0,
    }
}

export default function StudentTrackingPage({ onCancel }: StudentsPageProps) {

  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [detail, setDetail] = useState<any>(null)
  const [classOverview, setClassOverview] = useState<ClassOverview>(DEFAULT_OVERVIEW)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  // ── Fetch student list ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = getCookie("token") as string
        const res = await get(`${BASE_API_URL}/tentor/students`, token)
        if (res.data?.success) {
          const payload = res.data.data
          const list: any[] = payload.students ?? payload ?? []
          setStudents(list)

          // Map backend snake_case → ClassOverview camelCase
          if (payload.class_overview) {
            setClassOverview(mapClassOverview(payload.class_overview, list))
          } else {
            // fallback: compute from list
            setClassOverview(mapClassOverview({}, list))
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

  // ── Fetch student detail ───────────────────────────────────────────────────
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1D61D2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Memuat data siswa...</p>
        </div>
      </div>
    )
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
               <div className="flex-1 flex items-center justify-center min-h-[200px]">
                 <div className="text-center space-y-2">
                   <div className="w-6 h-6 border-2 border-[#1D61D2] border-t-transparent rounded-full animate-spin mx-auto" />
                   <p className="text-sm text-gray-400">Memuat detail siswa...</p>
                 </div>
               </div>
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
            {/* SubjectPerformance sekarang menampilkan Module mastery */}
            <SubjectPerformance mastery={detail.subjectMastery ?? []} />
            <FocusAreaCard focusAreas={detail.focusAreas ?? []} />
            <RecentQuizList quizzes={detail.recentQuizzes ?? []} />
            <LearningInsight insights={detail.insights ?? []} />
          </section>
        )}
      </main>
    </div>
    </>
  );
}
