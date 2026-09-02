"use client"

import type { MatchingPair, QuestionFormValue } from "@/types/questions"
import MathEditorField from "@/components/shared/MathEditorField"

interface Props {
  pairs: MatchingPair[]
  onChange: (patch: Partial<QuestionFormValue>) => void
}

export default function MatchingAnswer({ pairs, onChange }: Props) {
  const update = (id: number | string, patch: Partial<MatchingPair>) =>
    onChange({ pairs: pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)) })

  const add = () =>
    onChange({ pairs: [...pairs, { id: Date.now(), left: "", right: "" }] })

  const remove = (id: number | string) =>
    onChange({ pairs: pairs.filter((p) => p.id !== id) })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Matching pairs</p>
        <p className="text-xs text-amber-600">Perlu kolom tambahan di backend (belum ada di schema)</p>
      </div>
      <div className="space-y-4">
        {pairs.map((pair) => (
          <div key={pair.id} className="flex items-start gap-2">
            <div className="flex-1">
              <MathEditorField
                value={pair.left}
                onChange={(newVal) => update(pair.id, { left: newVal })}
                placeholder="Item kiri"
                rows={1}
              />
            </div>
            <span className="text-slate-300 mt-2">↔</span>
            <div className="flex-1">
              <MathEditorField
                value={pair.right}
                onChange={(newVal) => update(pair.id, { right: newVal })}
                placeholder="Pasangannya"
                rows={1}
              />
            </div>
            <button
              onClick={() => remove(pair.id)}
              className="mt-2 text-slate-300 hover:text-red-500 px-1"
              aria-label="Remove pair"
            >
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