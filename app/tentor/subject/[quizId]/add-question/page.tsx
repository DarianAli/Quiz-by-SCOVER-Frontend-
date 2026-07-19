"use client"

import { useParams } from "next/navigation"
import { LayoutDashboard, BookOpen, Users, Settings, MessageSquare } from "lucide-react"
import SidebarTemplate from "@/components/SidebarTemplate"
import QuizAddQuestionContainer from "@/components/quiz/AddQuestion"

export default function TentorAddQuestionPage() {
  const menuList = [
    { id: "home", icon: <LayoutDashboard />, path: "/tentor/home", label: "Dashboard Home", category: "dashboard" as const },
    { id: "subject", icon: <BookOpen />, path: "/tentor/subject", label: "My Subjects", category: "dashboard" as const },
    { id: "students", icon: <Users />, path: "/tentor/students", label: "Student Tracking", category: "communication" as const },
    { id: "chat", icon: <MessageSquare />, path: "/teacher/messages", label: "Forum Diskusi", category: "communication" as const },
    { id: "settings", icon: <Settings />, path: "/teacher/settings", label: "Settings", category: "settings" as const },
  ]

  const params = useParams<{ quizId: string }>()
  const idQuiz = Number(params.quizId)

  return (
    <SidebarTemplate id="subject" title="Teacher Console" menuList={menuList}>
      <QuizAddQuestionContainer idQuiz={idQuiz} />
    </SidebarTemplate>
  )
}