"use client"

import { useRouter } from "next/navigation"
import { getQuizById, updateQuiz } from "@/constants/dummy/subjectData"
import { emptyQuestionForm, formValueToQuestionItem, type QuestionFormValue } from "@/types/questions"
import QuestionFormEditor from "../Subject/QuestionFormEditor"


interface QuizAddQuestionContainerProps {
  idQuiz: number
}

export default function QuizAddQuestionContainer({ idQuiz }: QuizAddQuestionContainerProps) {
  const router = useRouter()
  const quiz = getQuizById(idQuiz)

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

  // NOTE: previously this used a hand-built object literal that was missing
  // `difficulty` and `explanation` (both required by QuestionFormValue) —
  // using emptyQuestionForm() here fixes that gap and keeps the same
  // multiple_choice / 10-point defaults.
  const initialValue: QuestionFormValue = emptyQuestionForm("multiple_choice")

  const handleSave = (value: QuestionFormValue) => {
    if (!value.prompt.trim()) return // guard minimal — bisa diganti validasi lebih lengkap sesuai kebutuhan Anda

    const newQuestion = formValueToQuestionItem(value)
    updateQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] })
    router.push(`/tentor/subject/${idQuiz}/editor`)
  }

  return (
    <QuestionFormEditor
      initialValue={initialValue}
      onCancel={() => router.push(`/tentor/subject/${idQuiz}/editor`)}
      onSave={handleSave}
    />
  )
}