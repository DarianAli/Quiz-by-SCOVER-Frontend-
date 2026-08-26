"use client"

import type { AnswerChoice } from "@/types/questions"
import MathEditorField from "@/components/shared/MathEditorField"

interface Props {
  choices: AnswerChoice[] // 1 item: jawaban yang diharapkan
  onUpdateChoice: (id: number, patch: Partial<AnswerChoice>) => void
}

export default function ShortAnswerAnswer({ choices, onUpdateChoice }: Props) {
  const answer = choices[0]
  if (!answer) return null

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
        Expected answer
      </label>
      <MathEditorField
        value={answer.text}
        onChange={(newVal) => onUpdateChoice(answer.id, { text: newVal })}
        placeholder="e.g. Photosynthesis atau \\frac{3}{4}"
        rows={1}
        ariaLabel="Expected answer"
      />
      <p className="text-xs text-slate-400 mt-1.5">Dicocokkan case-insensitive dengan jawaban siswa.</p>
    </div>
  )
}