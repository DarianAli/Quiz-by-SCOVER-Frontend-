"use client"

import { useRouter } from "next/navigation"
import QuizDashboard from "@/components/quiz/quizDashboard"



export default function TentorQuizDashboardPage() {

  const router = useRouter()

  return (
        <QuizDashboard
        onOpenEditor={(id) => router.push(`/tentor/tasks/${id}/editor`)}
        />
  )
}