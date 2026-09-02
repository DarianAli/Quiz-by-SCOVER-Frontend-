"use client"

import type { AnswerChoice } from "@/types/questions"
import MathEditorField from "@/components/shared/MathEditorField"

interface Props {
  choices: AnswerChoice[]           // Multiple accepted answers (each choice = one accepted answer)
  isStrict?: boolean                // If true: case-sensitive match
  onUpdateChoice: (id: number, patch: Partial<AnswerChoice>) => void
  onAddChoice: () => void
  onRemoveChoice: (id: number) => void
  onToggleStrict?: (value: boolean) => void
}

export default function FillBlankAnswer({
  choices,
  isStrict = false,
  onUpdateChoice,
  onAddChoice,
  onRemoveChoice,
  onToggleStrict,
}: Props) {
  return (
    <div className="space-y-4">

      {/* Primary answer field */}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
          Accepted answers
        </label>
        <p className="text-[11px] text-slate-400 mb-3">
          Add one or more accepted answers. If a student's response matches
          <strong className="text-slate-600"> any </strong>of these, they score.
        </p>

        <div className="space-y-2">
          {choices.map((choice, i) => (
            <div key={choice.id} className="flex items-start gap-2">
              {/* Index badge */}
              <span className="mt-3 flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <MathEditorField
                  value={choice.text}
                  onChange={(val) => onUpdateChoice(choice.id, { text: val })}
                  placeholder={i === 0 ? "Primary correct answer" : "Alternative accepted answer"}
                  rows={1}
                  ariaLabel={`Accepted answer ${i + 1}`}
                />
              </div>

              {/* Remove — keep at least 1 */}
              {choices.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveChoice(choice.id)}
                  className="mt-3 text-slate-300 hover:text-red-500 text-sm px-1 flex-shrink-0 transition-colors"
                  aria-label="Remove alternative"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddChoice}
          className="mt-2 text-xs font-medium text-slate-500 hover:text-teal-600 transition-colors"
        >
          + Add alternative answer
        </button>
      </div>

      {/* Strict mode toggle */}
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-600">Strict matching</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isStrict
              ? 'Case-sensitive exact match required (e.g. “H₂O” ≠ “h₂o”).'
              : "Case-insensitive — flexible matching (default)."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isStrict}
          onClick={() => onToggleStrict?.(!isStrict)}
          className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-300 flex-shrink-0 ${
            isStrict ? "bg-teal-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
              isStrict ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Use <code className="px-1 bg-slate-100 rounded">___</code> in the question prompt to mark the blank.
      </p>
    </div>
  )
}
