"use client"

import { useParams } from "next/navigation"
import QuizAddQuestionContainer from "@/components/quiz/AddQuestion"

export default function TentorAddQuestionPage() {

  const params = useParams<{ quizId: string }>()
  const idQuiz = Number(params.quizId)

  return (
      <QuizAddQuestionContainer idQuiz={idQuiz} />
  )
}