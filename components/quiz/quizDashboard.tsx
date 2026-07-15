"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sigma, Compass, Dna, FlaskConical, Landmark, Languages, Atom, FileQuestion } from "lucide-react"
import {
  getQuizzes,
  addQuiz,
  dummySubjects,
  type QuizItem,
  type Difficulty,
} from "@/constants/dummy/subjectData"
import type { SubjectThemeKey } from "@/lib/theme/subject-themes"
import QuizBasicInfoPanel from "./quizBasicInforPanel"
import DashboardHero from "../Subject/DashboardHero"
import SubjectCard, { type SubjectCardData } from "@/components/Subject/SubjectCard"
import RecentQuizzesPanel from "@/components/Subject/RecentQuizzesPanel"
import WeeklyStreakCard from "@/components/Subject/WeeklyStreakCard"
import LiveActivityCard, { type LiveActivityItem } from "@/components/Subject/LiveActivityCard"

interface QuizDashboardProps {
  onOpenEditor: (idQuiz: number) => void
}

const SUBJECT_ICON: Record<SubjectThemeKey, React.ReactNode> = {
  math: <Sigma size={18} />,
  geometry: <Compass size={18} />,
  physics: <Atom size={18} />,
  biology: <Dna size={18} />,
  genetics: <Dna size={18} />,
  chemistry: <FlaskConical size={18} />,
  history: <Landmark size={18} />,
  english: <Languages size={18} />,
}

// TODO Placeholder murni untuk tampilan — ganti dengan data asli begitu
// endpoint TeacherDashboardOverview / live attempt feed tersedia.
const PLACEHOLDER_WEEKLY_STREAK_DAYS = 0
const PLACEHOLDER_LIVE_ACTIVITY: LiveActivityItem[] = []

export default function QuizDashboard({ onOpenEditor }: QuizDashboardProps) {
  const router = useRouter()
  const [panelOpen, setPanelOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<QuizItem[]>(getQuizzes())

  const handleCreate = (data: {
    quiz_title: string
    classId: number
    subjectId: number
    difficulty: Difficulty
    duration: number
    status: "DRAFT" | "PUBLISHED"
    description: string
  }) => {
    const newQuiz: QuizItem = {
      idQuiz: Date.now(),
      quiz_title: data.quiz_title,
      duration: data.duration,
      status: data.status === "PUBLISHED" ? "COMPLETED" : "INCOMPLETED",
      difficulty: data.difficulty,
      subjectId: data.subjectId,
      classId: data.classId,
      questions: [],
      updated_at: new Date().toISOString(),
    }
    addQuiz(newQuiz)
    setQuizzes(getQuizzes())
    setPanelOpen(false)
    onOpenEditor(newQuiz.idQuiz)
  }

  const heroStats = {
    activeQuiz: quizzes.length,
    activeQuizDelta: undefined,
    studentsEngaged: 0, // TODO: sambungkan ke data attempt/scores asli
    studentsEngagedDelta: undefined,
    averageScore: 0, // TODO: sambungkan ke data scores asli
    averageScoreDelta: undefined,
    completionRate: 0, // TODO: sambungkan ke data scores asli
    completionRateDelta: undefined,
  }
  const pendingReviews = quizzes.filter((q) => q.status === "INCOMPLETED").length

  const subjectCards: SubjectCardData[] = dummySubjects.map((s) => {
    const relatedQuizzes = quizzes.filter((q) => q.subjectId === s.idSubject)
    const totalQuestions = relatedQuizzes.reduce((sum, q) => sum + q.questions.length, 0)
    return {
      id: s.idSubject,
      name: s.subject_name,
      theme: s.theme,
      icon: SUBJECT_ICON[s.theme],
      lessonCount: relatedQuizzes.length,
      studentCount: 0, // TODO: belum ada relasi student per subject di dummy ini
      progress: totalQuestions > 0 ? Math.min(100, totalQuestions * 5) : 0,
    }
  })

  const recentQuizRows = quizzes.map((quiz) => {
    const subject = dummySubjects.find((s) => s.idSubject === quiz.subjectId)
    return {
      quiz,
      subjectName: subject?.subject_name ?? "",
      subjectTheme: subject?.theme ?? ("math" as SubjectThemeKey),
      icon: <FileQuestion size={18} />,
    }
  })

  return (
    <div className="min-h-dvh bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <DashboardHero
          teacherName="Novara" // TODO: ganti dengan nama tentor yang sedang login
          pendingReviews={pendingReviews}
          newSubmissions={0} // TODO: ganti dengan data submission asli
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
            onContinueEditing={onOpenEditor}
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