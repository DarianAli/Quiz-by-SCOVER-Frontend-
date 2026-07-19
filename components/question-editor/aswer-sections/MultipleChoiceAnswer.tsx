"use client"

import type { AnswerChoice } from "@/types/questions"
import type { QuestionTypeTheme } from "@/lib/theme/question-type-themes"

interface Props {
  choices: AnswerChoice[]
  theme: QuestionTypeTheme
  onAddChoice: () => void
  onUpdateChoice: (id: number, patch: Partial<AnswerChoice>) => void
  onSetCorrectChoice: (id: number) => void
  onRemoveChoice: (id: number) => void
}

export default function MultipleChoiceAnswer({
  choices,
  theme,
  onAddChoice,
  onUpdateChoice,
  onSetCorrectChoice,
  onRemoveChoice,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Answer choices</p>
        <p className="text-xs text-slate-400">Tap the circle to mark the correct answer</p>
      </div>
      <div className="space-y-2">
        {choices.map((choice, i) => (
          <div
            key={choice.id}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all duration-200 ${
              choice.isCorrect ? `${theme.selectedBorder} bg-slate-50` : "border-slate-100"
            }`}
          >
            <button
              onClick={() => onSetCorrectChoice(choice.id)}
              aria-label={`Mark answer ${String.fromCharCode(65 + i)} as correct`}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                choice.isCorrect ? theme.selectedBorder : "border-slate-300"
              }`}
            >
              {choice.isCorrect && <span className={`w-2.5 h-2.5 rounded-full ${theme.iconBg} animate-fade-slide-up`} />}
            </button>
            <span className="text-xs font-medium text-slate-400 w-4">{String.fromCharCode(65 + i)}</span>
            <input
              value={choice.text}
              onChange={(e) => onUpdateChoice(choice.id, { text: e.target.value })}
              placeholder={`Choice ${i + 1}`}
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <button
              onClick={() => onRemoveChoice(choice.id)}
              className="text-slate-300 hover:text-red-500 text-sm px-1"
              aria-label="Remove choice"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
      <button onClick={onAddChoice} className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700">
        + Add choice
      </button>
    </div>
  )
}