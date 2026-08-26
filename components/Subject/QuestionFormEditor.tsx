"use client"

// Reusable wrapper that hosts QuestionEditorLive + handles:
//   - Add Question  (components/quiz/AddQuestion.tsx)
//   - Edit Question  (components/quiz/quizEditor.tsx, inside QuizEditor)

import { useState } from "react"
import { ListChecks, ToggleLeft, Type, FileText, Shuffle, PencilLine, CheckSquare, BookOpen } from "lucide-react"
import type { QuestionTypeKey } from "@/lib/theme/question-type-themes"
import type { AnswerChoice, QuestionFormValue } from "@/types/questions"
import { newChoiceId } from "@/types/questions"
import QuestionEditorLive from "../Subject/QuestionEditorLive"

const TYPE_OPTIONS: { key: QuestionTypeKey; icon: React.ReactNode }[] = [
  { key: "multiple_choice",  icon: <ListChecks size={18} /> },
  { key: "multiple_complex", icon: <CheckSquare size={18} /> },
  { key: "true_false",       icon: <ToggleLeft size={18} /> },
  { key: "short_answer",     icon: <Type size={18} /> },
  { key: "essay",            icon: <FileText size={18} /> },
  { key: "matching",         icon: <Shuffle size={18} /> },
  { key: "fill_blank",       icon: <PencilLine size={18} /> },
  { key: "story_group",      icon: <BookOpen size={18} /> },
]

const emptyChoice = (): AnswerChoice => ({ id: newChoiceId(), text: "", isCorrect: false })

interface QuestionFormEditorProps {
  initialValue: QuestionFormValue
  onCancel: () => void
  onSave: (value: QuestionFormValue) => void
  onDelete?: () => void
  saveLabel?: string
}

export default function QuestionFormEditor({
  initialValue,
  onCancel,
  onSave,
  onDelete,
  saveLabel,
}: QuestionFormEditorProps) {
  const [value, setValue] = useState<QuestionFormValue>(initialValue)

  const patch = (p: Partial<QuestionFormValue>) => setValue((prev) => ({ ...prev, ...p }))

  return (
    <QuestionEditorLive
      value={value}
      onChange={patch}
      typeOptions={TYPE_OPTIONS}
      onAddChoice={() => patch({ choices: [...value.choices, emptyChoice()] })}
      onUpdateChoice={(id, p) => patch({ choices: value.choices.map((c) => (c.id === id ? { ...c, ...p } : c)) })}
      onSetCorrectChoice={(id) => patch({ choices: value.choices.map((c) => ({ ...c, isCorrect: c.id === id })) })}
      onRemoveChoice={(id) => patch({ choices: value.choices.filter((c) => c.id !== id) })}
      onCancel={onCancel}
      onSave={() => onSave(value)}
      onDelete={onDelete}
      saveLabel={saveLabel}
    />
  )
}
