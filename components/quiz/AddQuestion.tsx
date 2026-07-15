"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ListChecks, ToggleLeft, Type, FileText, Shuffle, PencilLine } from "lucide-react"
import { getQuizById, updateQuiz, type QuestionItem, type OptionItem } from "@/constants/dummy/subjectData"
import type { QuestionTypeKey } from "@/lib/theme/question-type-themes"
import QuestionEditorLive, { type QuestionFormValue, type AnswerChoice } from "../Subject/QuestionEditorLive"


const TYPE_OPTIONS: { key: QuestionTypeKey; icon: React.ReactNode }[] = [
  { key: "multiple_choice", icon: <ListChecks size={18} /> },
  { key: "true_false", icon: <ToggleLeft size={18} /> },
  { key: "short_answer", icon: <Type size={18} /> },
  { key: "essay", icon: <FileText size={18} /> },
  { key: "matching", icon: <Shuffle size={18} /> },
  { key: "fill_blank", icon: <PencilLine size={18} /> },
]

const emptyChoice = (): AnswerChoice => ({ id: Date.now() + Math.random(), text: "", isCorrect: false })

interface QuizAddQuestionContainerProps {
  idQuiz: number
}

export default function QuizAddQuestionContainer({ idQuiz }: QuizAddQuestionContainerProps) {
  const router = useRouter()
  const quiz = getQuizById(idQuiz)

  const [value, setValue] = useState<QuestionFormValue>({
    type: "multiple_choice",
    prompt: "",
    points: 10,
    tag: "",
    choices: [emptyChoice(), emptyChoice()],
  })

//   if (!quiz) {
//     return (
//       <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-slate-50">
//         <p className="text-sm text-slate-500">Quiz not found.</p>
//         <button
//           onClick={() => router.push("/tentor/subject")}
//           className="px-4 h-9 rounded-lg bg-slate-900 text-white text-sm font-medium"
//         >
//           Back to dashboard
//         </button>
//       </div>
//     )
//   }

  const patch = (p: Partial<QuestionFormValue>) => setValue((prev) => ({ ...prev, ...p }))

  const handleSave = () => {
    if (!value.prompt.trim()) return // guard minimal — bisa diganti validasi lebih lengkap sesuai kebutuhan Anda

    const newQuestion: QuestionItem = {
      idQuestion: Date.now(),
      question_text: value.prompt,
      question_image: "",
      difficulty: quiz.difficulty, // tidak ada selector difficulty per-soal di UI ini; ikut difficulty quiz
      poin: value.points,
      options: value.choices
        .filter((c) => c.text.trim().length > 0)
        .map(
          (c): OptionItem => ({
            idOption: c.id,
            option_text: c.text,
            option_image: "",
            is_correct: c.isCorrect,
          })
        ),
    }

    updateQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] })
    router.push(`/tentor/subject/${idQuiz}/editor`)
  }

  return (
    <QuestionEditorLive
      value={value}
      onChange={patch}
      typeOptions={TYPE_OPTIONS}
      onAddChoice={() => patch({ choices: [...value.choices, emptyChoice()] })}
      onUpdateChoice={(id, p) =>
        patch({ choices: value.choices.map((c) => (c.id === id ? { ...c, ...p } : c)) })
      }
      onSetCorrectChoice={(id) =>
        patch({ choices: value.choices.map((c) => ({ ...c, isCorrect: c.id === id })) })
      }
      onRemoveChoice={(id) => patch({ choices: value.choices.filter((c) => c.id !== id) })}
      onCancel={() => router.push(`/tentor/subject/${idQuiz}/editor`)}
      onSave={handleSave}
    />
  )
}