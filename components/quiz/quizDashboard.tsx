"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sigma, Compass, Dna, FlaskConical, Landmark, Languages, Atom, FileQuestion } from "lucide-react"
import type { SubjectThemeKey } from "@/lib/theme/subject-themes"
import QuizBasicInfoPanel from "./quizBasicInforPanel"
import DashboardHero from "../Subject/DashboardHero"
import SubjectCard, { type SubjectCardData } from "@/components/Subject/SubjectCard"
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

const SUBJECT_ICON: Record<string, React.ReactNode> = {
  math: <Sigma size={18} />,
  geometry: <Compass size={18} />,
  physics: <Atom size={18} />,
  biology: <Dna size={18} />,
  genetics: <Dna size={18} />,
  chemistry: <FlaskConical size={18} />,
  history: <Landmark size={18} />,
  english: <Languages size={18} />,
}

const PLACEHOLDER_WEEKLY_STREAK_DAYS = 0
const PLACEHOLDER_LIVE_ACTIVITY: LiveActivityItem[] = []

export default function QuizDashboard({ onOpenEditor }: QuizDashboardProps) {
  const router = useRouter()
  const [panelOpen, setPanelOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const teacherName = getCookie("userName") || "Coach"

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = getCookie("token") as string
      const [resQuiz, resSub] = await Promise.all([
        get(`${BASE_API_URL}/quiz/all`, token),
        get(`${BASE_API_URL}/subject/all`, token)
      ])
      
      if (resQuiz.data?.status) setQuizzes(resQuiz.data.data)
      if (resSub.data?.status) setSubjects(resSub.data.data)
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
    classId: number
    subjectId: number
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
      
      if (res.data?.status) {
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

  const heroStats = {
    activeQuiz: quizzes.length,
    activeQuizDelta: undefined,
    studentsEngaged: 0, 
    studentsEngagedDelta: undefined,
    averageScore: 0, 
    averageScoreDelta: undefined,
    completionRate: 0, 
    completionRateDelta: undefined,
  }
  const pendingReviews = quizzes.filter((q) => q.status === "DRAFT").length

  const subjectCards: SubjectCardData[] = subjects.map((s, i) => {
    const relatedQuizzes = quizzes.filter((q) => q.subjectId === s.id)
    const totalQuestions = relatedQuizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)
    const themes = ["math", "physics", "english", "biology", "history"]
    const theme = themes[i % themes.length]
    return {
      id: s.uuid || s.id,
      name: s.subject_name,
      theme: theme as SubjectThemeKey,
      icon: SUBJECT_ICON[theme],
      lessonCount: relatedQuizzes.length,
      studentCount: 0, 
      progress: totalQuestions > 0 ? Math.min(100, totalQuestions * 5) : 0,
    }
  })

  const recentQuizRows = quizzes.map((quiz) => {
    const subject = subjects.find((s) => s.id === quiz.subjectId)
    const themes = ["math", "physics", "english", "biology", "history"]
    return {
      quiz: quiz as any, // Cast as any or IQuiz since the backend representation might lack some Prisma relations but matches what the component expects
      subjectName: subject?.subject_name ?? "General",
      subjectTheme: (themes[quiz.subjectId % themes.length] || "math") as SubjectThemeKey,
      icon: <FileQuestion size={18} />,
    }
  })

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading Data...</div>
  }

  return (
    <div className="min-h-dvh bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <DashboardHero
          teacherName={teacherName}
          pendingReviews={pendingReviews}
          newSubmissions={0} 
          stats={heroStats}
          onCreateQuiz={() => setPanelOpen(true)}
        />

        <div>
          <div className="mb-3">
            <h2 className="text-sm font-medium text-slate-500">Your classroom</h2>
            <h3 className="text-lg font-bold text-slate-900">Subjects</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectCards.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} onManage={() => {}} />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
          <RecentQuizzesPanel
            rows={recentQuizRows}
            onCreateQuiz={() => setPanelOpen(true)}
            onContinueEditing={(idQuiz) => onOpenEditor(idQuiz.toString())}
            onStartAddingQuestions={(idQuiz) => router.push(`/tentor/subject/${idQuiz}/add-question`)}
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