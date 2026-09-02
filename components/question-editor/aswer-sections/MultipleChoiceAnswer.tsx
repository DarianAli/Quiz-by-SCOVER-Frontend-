"use client"

import { useRef, useState } from "react"
import type { AnswerChoice } from "@/types/questions"
import type { QuestionTypeTheme } from "@/lib/theme/question-type-themes"
import MathEditorField from "@/components/shared/MathEditorField"

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
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Answer choices
        </p>
        <p className="text-xs text-slate-400">
          Tap the circle to mark the correct answer
        </p>
      </div>

      <div className="space-y-3">
        {choices.map((choice, i) => (
          <div key={choice.id} className="flex items-start gap-2.5">
            {/* Correct marker button */}
            <button
              type="button"
              onClick={() => onSetCorrectChoice(choice.id)}
              aria-label={`Mark answer ${String.fromCharCode(65 + i)} as correct`}
              className={`mt-3 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                choice.isCorrect ? theme.selectedBorder : "border-slate-300"
              }`}
            >
              {choice.isCorrect && (
                <span
                  className={`w-2.5 h-2.5 rounded-full ${theme.iconBg} animate-fade-slide-up`}
                />
              )}
            </button>

            {/* Choice label */}
            <span className="text-xs font-medium text-slate-400 w-4 mt-3 flex-shrink-0">
              {String.fromCharCode(65 + i)}
            </span>

            {/* Math-aware field */}
            <div className="flex-1 min-w-0">
              <MathEditorField
                value={choice.text}
                onChange={(newVal) => onUpdateChoice(choice.id, { text: newVal })}
                placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                rows={1}
                ariaLabel={`Answer choice ${String.fromCharCode(65 + i)}`}
              />
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemoveChoice(choice.id)}
              className="mt-3 text-slate-300 hover:text-red-500 text-sm px-1 flex-shrink-0 transition-colors"
              aria-label="Remove choice"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddChoice}
        className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        + Add choice
      </button>
    </div>
  )
}