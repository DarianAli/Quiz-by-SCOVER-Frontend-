"use client"

import type { MatchingPair, QuestionFormValue } from "@/types/questions"

interface Props {
  pairs: MatchingPair[]
  onChange: (patch: Partial<QuestionFormValue>) => void
}

export default function MatchingAnswer({ pairs, onChange }: Props) {
  const update = (id: number, patch: Partial<MatchingPair>) =>
    onChange({ pairs: pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)) })

  const add = () =>
    onChange({ pairs: [...pairs, { id: Date.now(), left: "", right: "" }] })

  const remove = (id: number) =>
    onChange({ pairs: pairs.filter((p) => p.id !== id) })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Matching pairs</p>
        <p className="text-xs text-amber-600">Perlu kolom tambahan di backend (belum ada di schema)</p>
      </div>
      <div className="space-y-2">
        {pairs.map((pair) => (
          <div key={pair.id} className="flex items-center gap-2">
            <input
              value={pair.left}
              onChange={(e) => update(pair.id, { left: e.target.value })}
              placeholder="Item kiri"
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
            />
            <span className="text-slate-300">↔</span>
            <input
              value={pair.right}
              onChange={(e) => update(pair.id, { right: e.target.value })}
              placeholder="Pasangannya"
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
            />
            <button onClick={() => remove(pair.id)} className="text-slate-300 hover:text-red-500 px-1">
              🗑
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700">
        + Add pair
      </button>
    </div>
  )
}