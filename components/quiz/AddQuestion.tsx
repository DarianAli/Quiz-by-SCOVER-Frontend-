"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { emptyQuestionForm, formValueToQuestionItem, type QuestionFormValue } from "@/types/questions"
import QuestionFormEditor from "../Subject/QuestionFormEditor"
import { get, post } from "@/lib/api-bridge"
import { getCookie } from "@/lib/client-cookie"
import { BASE_API_URL } from "@/global"
import { toast } from "react-toastify"

interface QuizAddQuestionContainerProps {
  idQuiz: string
}

export default function QuizAddQuestionContainer({ idQuiz }: QuizAddQuestionContainerProps) {
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = getCookie("token") as string
        const res = await get(`${BASE_API_URL}/quiz/${idQuiz}`, token)
        if (res.data?.status) {
          setQuiz(res.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (idQuiz) fetchQuiz()
  }, [idQuiz])

  if (isLoading) {
    return <div className="min-h-dvh flex items-center justify-center bg-slate-50">Loading Quiz...</div>
  }

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

  const initialValue: QuestionFormValue = emptyQuestionForm("multiple_choice")

  const handleSave = async (value: QuestionFormValue) => {
    if (!value.prompt.trim()) return

    try {
      const token = getCookie("token") as string
      
      // 1. Create Question
      const qPayload = {
        question_text: value.prompt,
        difficulty: quiz.difficulty, // Inherit from quiz
        poin: value.points || 10,
        quizId: quiz.id, // numeric ID required by backend
        discussion: value.explanation
      }
      
      const resQ = await post(`${BASE_API_URL}/question/add`, qPayload, token)
      
      if (!resQ.data?.status) {
        toast.error("Gagal menyimpan pertanyaan")
        return
      }

      const newQuestionId = resQ.data.data.id

      // 2. Create Options
      if (value.choices && value.choices.length > 0) {
        const optionPromises = value.choices.map((opt, idx) => {
          return post(`${BASE_API_URL}/option/add`, {
            option_text: opt.text,
            is_correct: String(opt.isCorrect), // Backend might expect string/boolean
            order_index: idx,
            questionId: newQuestionId
          }, token)
        })

        await Promise.all(optionPromises)
      }

      toast.success("Pertanyaan berhasil ditambahkan")
      router.push(`/tentor/subject/${idQuiz}/editor`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menyimpan")
    }
  }

  return (
    <QuestionFormEditor
      initialValue={initialValue}
      onCancel={() => router.push(`/tentor/subject/${idQuiz}/editor`)}
      onSave={handleSave}
    />
  )
}