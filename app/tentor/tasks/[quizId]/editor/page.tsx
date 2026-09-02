"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import QuizEditor from "@/components/quiz/quizEditor"
import { get, put } from "@/lib/api-bridge"
import { getCookie } from "@/lib/client-cookie"
import { BASE_API_URL } from "@/global"
import { toast } from "react-toastify"

export default function TentorQuizEditorPage() {
  const router = useRouter()
  const params = useParams<{ quizId: string }>()
  const idQuiz = params.quizId

  const [quiz, setQuiz] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = getCookie("token") as string
        const res = await get(`${BASE_API_URL}/quiz/${idQuiz}`, token)
        if (res.data?.success) {
          setQuiz(res.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (idQuiz) {
      fetchQuiz()
    }
  }, [idQuiz])

  if (isLoading) {
    return <div className="min-h-dvh flex items-center justify-center bg-slate-50">Loading Quiz...</div>
  }

  if (!quiz) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-slate-50">
        <p className="text-sm text-slate-500">Quiz not found.</p>
        <button
          onClick={() => router.push("/tentor/tasks")}
          className="px-4 h-9 rounded-lg bg-slate-900 text-white text-sm font-medium"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
      <>
        <QuizEditor
          quiz={quiz}
          onBack={() => router.push("/tentor/tasks")}
          onSave={async (updated) => {
              try {
                const token = getCookie("token") as string
                const payload = {
                  quiz_title: updated.quiz_title,
                  duration: updated.duration,
                  difficulty: updated.difficulty,
                  status: updated.status,
                }
                const res = await put(`${BASE_API_URL}/quiz/update/${idQuiz}`, payload, token)
                if (res.data?.success) {
                  toast.success("Kuis berhasil diperbarui")
                } else {
                  toast.error(res.data?.message || "Gagal memperbarui kuis")
                }
              } catch (error: any) {
                toast.error(error.response?.data?.message || "Terjadi kesalahan")
              }
          }}
        />
      </>
  )
}