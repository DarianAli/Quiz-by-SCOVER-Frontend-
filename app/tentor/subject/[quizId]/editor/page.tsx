"use client"

import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import QuizEditor from "@/components/quiz/quizEditor"
import { getQuizById, updateQuiz } from "@/constants/dummy/subjectData"
import SidebarTemplate from "@/components/SidebarTemplate";
import { LayoutDashboard, BookOpen, Users, Settings, MessageSquare, ArrowRight } from "lucide-react";



export default function TentorQuizEditorPage() {
    const menuList = [
        { id: "home", icon: <LayoutDashboard />, path: "/tentor/home", label: "Dashboard Home", category: "dashboard" as const },
        { id: "subject", icon: <BookOpen />, path: "/tentor/subject", label: "My Subjects", category: "dashboard" as const },
        { id: "students", icon: <Users />, path: "/tentor/students", label: "Student Tracking", category: "communication" as const },
        { id: "chat", icon: <MessageSquare />, path: "/teacher/messages", label: "Forum Diskusi", category: "communication" as const },
        { id: "settings", icon: <Settings />, path: "/teacher/settings", label: "Settings", category: "settings" as const },
    ]
  const router = useRouter()
  const params = useParams<{ quizId: string }>()
  const idQuiz = Number(params.quizId)

  // useState di sini hanya supaya "not found" ikut re-render kalau quiz baru
  // saja dibuat di halaman sebelumnya (store di-mutate secara sinkron sebelum push)
  const [quiz] = useState(() => getQuizById(idQuiz))

  if (!quiz) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-slate-50">
        <p className="text-sm text-slate-500">Quiz not found.</p>
        <button
          onClick={() => router.push("/tentor/subject")}
          className="px-4 h-9 rounded-lg bg-slate-900 text-white text-sm font-medium"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <SidebarTemplate id="subject" title="Teacher Console" menuList={menuList}>
        <QuizEditor
        quiz={quiz}
        onBack={() => router.push("/tentor/subject")}
        onSave={async (updated) => {
            // TODO: ganti dengan PATCH /quizzes/:id/questions/:qId per soal saat backend siap
            updateQuiz(updated)
        }}
        />
    </SidebarTemplate>
  )
}