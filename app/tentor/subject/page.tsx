"use client"

import { useRouter } from "next/navigation"
import QuizDashboard from "@/components/quiz/quizDashboard"
import SidebarTemplate from "@/components/SidebarTemplate";
import { LayoutDashboard, BookOpen, Users, Settings, MessageSquare, ArrowRight } from "lucide-react";



export default function TentorQuizDashboardPage() {
    const menuList = [
        { id: "home", icon: <LayoutDashboard />, path: "/tentor/home", label: "Dashboard Home", category: "dashboard" as const },
        { id: "subject", icon: <BookOpen />, path: "/tentor/subject", label: "My Subjects", category: "dashboard" as const },
        { id: "students", icon: <Users />, path: "/teacher/students", label: "Student Tracking", category: "communication" as const },
        { id: "chat", icon: <MessageSquare />, path: "/teacher/messages", label: "Forum Diskusi", category: "communication" as const },
        { id: "settings", icon: <Settings />, path: "/teacher/settings", label: "Settings", category: "settings" as const },
    ]
  const router = useRouter()

  return (
    <SidebarTemplate id="subject" title="Teacher Console" menuList={menuList}>
        <QuizDashboard
        onOpenEditor={(idQuiz) => router.push(`/tentor/subject/${idQuiz}/editor`)}
        />
    </SidebarTemplate>
  )
}