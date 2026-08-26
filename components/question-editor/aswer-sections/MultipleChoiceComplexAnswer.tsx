"use client"

import type { AnswerChoice } from "@/types/questions"
import type { QuestionTypeTheme } from "@/lib/theme/question-type-themes"
import MathEditorField from "@/components/shared/MathEditorField"

interface Props {
  choices: AnswerChoice[]
  theme: QuestionTypeTheme
  onAddChoice: () => void
  onUpdateChoice: (id: number, patch: Partial<AnswerChoice>) => void
  onToggleCorrect: (id: number) => void
  onRemoveChoice: (id: number) => void
}

export default function MultipleChoiceComplexAnswer({
  choices,
  theme,
  onAddChoice,
  onUpdateChoice,
  onToggleCorrect,
  onRemoveChoice,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Answer choices
        </p>
        <p className="text-xs text-slate-400">
          Tick all correct answers (checkboxes)
        </p>
      </div>

      {/* Instruction banner */}
      <div className="mb-3 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-medium">
        ☑ Multiple Correct — tick every option that is a correct answer.
        Students must select <strong>exactly</strong> the same set to score.
      </div>

      <div className="space-y-3">
        {choices.map((choice, i) => (
          <div key={choice.id} className="flex items-start gap-2.5">
            {/* Checkbox-style correct marker */}
            <button
              type="button"
              onClick={() => onToggleCorrect(choice.id)}
              aria-label={`Toggle answer ${String.fromCharCode(65 + i)} correct`}
              className={`mt-3 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                choice.isCorrect
                  ? "border-indigo-500 bg-indigo-500"
                  : "border-slate-300 bg-white"
              }`}
            >
              {choice.isCorrect && (
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="2,6 5,9 10,3" />
                </svg>
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
