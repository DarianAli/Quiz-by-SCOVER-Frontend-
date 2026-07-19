"use client"

import type { AnswerChoice } from "@/types/questions"

interface Props {
  choices: AnswerChoice[] // 1 item: kata/frasa pengisi blank
  onUpdateChoice: (id: number, patch: Partial<AnswerChoice>) => void
}

export default function FillBlankAnswer({ choices, onUpdateChoice }: Props) {
  const answer = choices[0]
  if (!answer) return null

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
        Correct word / phrase
      </label>
      <input
        value={answer.text}
        onChange={(e) => onUpdateChoice(answer.id, { text: e.target.value })}
        placeholder="e.g. mitochondria"
        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
      />
      <p className="text-xs text-slate-400 mt-1.5">
        Gunakan tanda <code className="px-1 bg-slate-100 rounded">___</code> di prompt untuk menandai bagian yang kosong.
      </p>
    </div>
  )
}