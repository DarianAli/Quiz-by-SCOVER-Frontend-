"use client"

import type { AnswerChoice } from "@/types/questions"
import type { QuestionTypeTheme } from "@/lib/theme/question-type-themes"

interface Props {
  choices: AnswerChoice[] // selalu 2 item: True, False
  theme: QuestionTypeTheme
  onSetCorrectChoice: (id: number) => void
}

export default function TrueFalseAnswer({ choices, theme, onSetCorrectChoice }: Props) {
  const trueChoice = choices.find((c) => c.text === "True") ?? choices[0]
  const falseChoice = choices.find((c) => c.text === "False") ?? choices[1]

  const renderCard = (choice: AnswerChoice | undefined, label: string, hint: string) => {
    if (!choice) return null
    const active = choice.isCorrect
    return (
      <button
        onClick={() => onSetCorrectChoice(choice.id)}
        className={`text-left rounded-2xl p-4 border-2 transition-all duration-150 ${
          active ? `${theme.selectedBorder} bg-pink-50/40` : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <p className="text-base font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
      </button>
    )
  }

  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Correct answer</p>
      <div className="grid grid-cols-2 gap-3">
        {renderCard(trueChoice, "True", "Mark statement as true.")}
        {renderCard(falseChoice, "False", "Mark statement as false.")}
      </div>
    </div>
  )
}