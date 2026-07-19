"use client"

import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import QuizEditor from "@/components/quiz/quizEditor"
import { getQuizById, updateQuiz } from "@/constants/dummy/subjectData"



export default function TentorQuizEditorPage() {
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
      <>
        <QuizEditor
        quiz={quiz}
        onBack={() => router.push("/tentor/subject")}
        onSave={async (updated) => {
            // TODO: ganti dengan PATCH /quizzes/:id/questions/:qId per soal saat backend siap
            updateQuiz(updated)
        }}
        />
      </>
  )
}