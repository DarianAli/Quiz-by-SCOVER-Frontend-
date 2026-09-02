"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileQuestion } from "lucide-react"
import type { SubjectThemeKey } from "@/lib/theme/subject-themes"
import { getSubjectIcon, pickSubjectTheme } from "@/lib/theme/subject-visuals"
import QuizBasicInfoPanel from "./quizBasicInforPanel"
import DashboardHero from "../Subject/DashboardHero"
import RecentQuizzesPanel from "@/components/Subject/RecentQuizzesPanel"
import WeeklyStreakCard from "@/components/Subject/WeeklyStreakCard"
import LiveActivityCard, { type LiveActivityItem } from "@/components/Subject/LiveActivityCard"

import { get, post } from "@/lib/api-bridge"
import { getCookie } from "@/lib/client-cookie"
import { BASE_API_URL } from "@/global"
import { toast } from "react-toastify"

interface QuizDashboardProps {
  onOpenEditor: (idQuiz: string) => void
}

const PLACEHOLDER_WEEKLY_STREAK_DAYS = 0
const PLACEHOLDER_LIVE_ACTIVITY: LiveActivityItem[] = []

export default function QuizDashboard({ onOpenEditor }: QuizDashboardProps) {
  const router = useRouter()
  const [panelOpen, setPanelOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = getCookie("token") as string
      const [resQuiz, resSub] = await Promise.all([
        get(`${BASE_API_URL}/quiz/all`, token),
        get(`${BASE_API_URL}/tentor/subjects`)
      ])
      
      if (resQuiz.data?.success) setQuizzes(resQuiz.data.data)
      if (resSub.data?.success) setSubjects(resSub.data.data)
    } catch (error) {
      console.error("Error fetching quiz dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: {
    quiz_title: string
    classId: string
    subjectId: string
    difficulty: string
    duration: number
    status: "DRAFT" | "PUBLISHED"
    description: string
    retake_policy?: string
    max_attempts?: number
  }) => {
    try {
      const token = getCookie("token") as string
      const payload = {
        ...data,
        status: data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
      }
      
      const res = await post(`${BASE_API_URL}/quiz/add`, payload, token)
      
      if (res.data?.success) {
        toast.success("Kuis berhasil dibuat")
        setPanelOpen(false)
        fetchData() // Refresh list
        onOpenEditor(res.data.data.uuid)
      } else {
        toast.error(res.data?.message || "Gagal membuat kuis")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan")
    }
  }

  const mySubject = subjects.find(s => s.is_my_class) || subjects[0];

  const recentQuizRows = quizzes.map((quiz) => {
    const subject = subjects.find((s) => s.uuid === quiz.subject?.uuid)
    const theme = pickSubjectTheme(quiz.subject?.uuid ?? quiz.uuid)
    return {
      quiz: quiz as any, // Cast as any / IQuiz karena representasi backend mungkin kurang beberapa relasi Prisma tapi sudah sesuai yang dibutuhkan komponen
      subjectName: subject?.subject_name ?? quiz.subject?.subject_name ?? "General",
      subjectTheme: theme,
      icon: <FileQuestion size={18} />,
    }
  })

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading Data...</div>
  }

  return (
    <div className="min-h-dvh bg-slate-50 p-4 sm:p-6">
      <div className="max-w-full mx-auto space-y-8">
        {mySubject ? (
          <DashboardHero
            subjectId={mySubject.uuid}
            subjectName={mySubject.subject_name}
            className={mySubject.assigned_class_name || "General Class"}
            annualGoal={mySubject.annual_quiz_target || 0}
            completedQuizzes={mySubject.completed_quizzes || 0}
            curriculumProgress={mySubject.curriculum_progress ?? 0}
            tentors={mySubject.tentors || []}
            stats={{
              activeQuiz: mySubject.total_quiz || 0,
              studentsEngaged: mySubject.total_student || 0,
              averageScore: mySubject.average_score || 0,
              completionRate: mySubject.completion_rate || 0,
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-48">
             <p className="text-slate-500 font-medium">Tidak ada kelas yang di-assign untuk Anda.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
          <RecentQuizzesPanel
            rows={recentQuizRows}
            onCreateQuiz={() => setPanelOpen(true)}
            onContinueEditing={(idQuiz) => onOpenEditor(idQuiz)}
            onStartAddingQuestions={(idQuiz) => router.push(`/tentor/tasks/${idQuiz}/add-question`)}
          />
          <div className="space-y-5">
            <WeeklyStreakCard days={PLACEHOLDER_WEEKLY_STREAK_DAYS} />
            <LiveActivityCard items={PLACEHOLDER_LIVE_ACTIVITY} />
          </div>
        </div>
      </div>

      <QuizBasicInfoPanel open={panelOpen} onClose={() => setPanelOpen(false)} onContinue={handleCreate} />
    </div>
  )
}