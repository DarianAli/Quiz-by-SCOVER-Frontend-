"use client"

import { useRouter } from "next/navigation"
import QuizDashboard from "@/components/quiz/quizDashboard"



export default function TentorQuizDashboardPage() {

  const router = useRouter()

  return (
        <QuizDashboard
        onOpenEditor={(idQuiz) => router.push(`/tentor/subject/${idQuiz}/editor`)}
        />
  )
}