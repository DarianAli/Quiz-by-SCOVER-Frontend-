"use client"

import { useRef, useState } from "react"
import { AlertTriangle, Sigma, Trash2, Copy, ImageIcon, Sparkles } from "lucide-react"
import MathText from "@/components/shared/MathText"
import EquationEditorModal from "./EquationEditorModal"

export interface ReviewOption {
  id: string
  letter: string
  text: string
  is_correct: boolean
}

export interface ReviewQuestion {
  localId: string
  number: number
  question_text: string
  question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY" | "SHORT_ANSWER" | "FILL_BLANK" | "MATCHING"
  difficulty: "EASY" | "MEDIUM" | "HARD"
  poin: number
  discussion: string
  /** Legacy: first image filename only (for backward compat) */
  image: string | null
  /** Legacy: first image URL only (for backward compat) */
  imageUrl: string | null
  /** All image filenames (multi-image support from Word import) */
  images: string[]
  /** All image preview URLs corresponding to images[] */
  imageUrls: string[]
  options: ReviewOption[]
  warnings: string[]
  aiSuggestedDifficulty?: "EASY" | "MEDIUM" | "HARD"
  aiSuggestedTopic?: string
  aiEquationFlag?: boolean
  selected: boolean
}

interface Props {
  question: ReviewQuestion
  index: number
  total: number
  onChange: (updated: ReviewQuestion) => void
  onDelete: () => void
  onDuplicate: () => void
}

type EquationTarget = { kind: "question" } | { kind: "option"; optionId: string }

/**
 * Editor for exactly ONE question. This component is deliberately unaware of
 * the rest of the question list — ImportQuestionPage only ever mounts one
 * instance of it (for the active question), so its internal height can never
 * push any other question around. See ImportQuestionPage for the pagination
 * that swaps which question is passed in here.
 */
export default function QuestionEditorPanel({ question, index, total, onChange, onDelete, onDuplicate }: Props) {
  const [equationTarget, setEquationTarget] = useState<EquationTarget | null>(null)
  const questionTextareaRef = useRef<HTMLTextAreaElement>(null)
  const optionInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const hasWarnings = question.warnings.length > 0

  const updateField = <K extends keyof ReviewQuestion>(key: K, value: ReviewQuestion[K]) => {
    onChange({ ...question, [key]: value })
  }

  const updateOption = (optionId: string, patch: Partial<ReviewOption>) => {
    onChange({
      ...question,
      options: question.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)),
    })
  }

  const setCorrectOption = (optionId: string) => {
    onChange({
      ...question,
      options: question.options.map((o) => ({ ...o, is_correct: o.id === optionId })),
    })
  }

  const insertEquationSnippet = (latex: string) => {
    const snippet = `$${latex}$`
    if (equationTarget?.kind === "question") {
      const ta = questionTextareaRef.current
      const pos = ta?.selectionStart ?? question.question_text.length
      const next = question.question_text.slice(0, pos) + snippet + question.question_text.slice(pos)
      updateField("question_text", next)
    } else if (equationTarget?.kind === "option") {
      const input = optionInputRefs.current[equationTarget.optionId]
      const opt = question.options.find((o) => o.id === equationTarget.optionId)
      if (!opt) return
      const pos = input?.selectionStart ?? opt.text.length
      const next = opt.text.slice(0, pos) + snippet + opt.text.slice(pos)
      updateOption(equationTarget.optionId, { text: next })
    }
    setEquationTarget(null)
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* Panel header — always makes it obvious which question is active */}
      <div className="flex flex-wrap items-start justify-between gap-3 bg-white rounded-2xl ring-1 ring-slate-100 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="checkbox"
            checked={question.selected}
            onChange={(e) => updateField("selected", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300"
            aria-label={`Select question ${index + 1}`}
          />
          <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            Question {index + 1} <span className="text-slate-400 font-normal">of {total}</span>
          </span>
          {hasWarnings && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              <AlertTriangle size={11} /> Perlu direview
            </span>
          )}
          {question.aiEquationFlag && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
              <Sparkles size={11} /> AI: cek notasi matematika
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Duplicate">
            <Copy size={15} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {hasWarnings && (
        <ul className="text-xs text-amber-700 bg-amber-50/60 rounded-xl px-3 py-2 space-y-0.5">
          {question.warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      )}

      {/*
        Editor (left) and preview (right) are two INDEPENDENT grid tracks.
        Neither track's content height can move the other — that's the fix
        for the old bug where a tall preview/question pushed neighboring
        cards sideways. On small screens this collapses to one column via
        `grid-cols-1 lg:grid-cols-[...]`.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          {/* QUESTION */}
          <section className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Question</h3>
              <button
                onClick={() => setEquationTarget({ kind: "question" })}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
              >
                <Sigma size={12} /> Insert equation
              </button>
            </div>
            <textarea
              ref={questionTextareaRef}
              value={question.question_text}
              onChange={(e) => updateField("question_text", e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 resize-y outline-none focus:ring-2 focus:ring-slate-900/10"
              style={{ overflowWrap: "anywhere" }}
            />
            {/* Image(s) */}
            {(question.imageUrls?.length > 0 || question.imageUrl) && (
              <div className="mt-2 flex flex-col gap-2">
                {(question.imageUrls?.length > 0 ? question.imageUrls : [question.imageUrl!]).map((url, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <ImageIcon size={12} />
                    <img src={url} alt={`Question image ${i + 1}`} className="max-h-32 rounded-lg border border-slate-100" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ANSWER OPTIONS */}
          {question.question_type === "MULTIPLE_CHOICE" && (
            <section className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 min-w-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Answer options — tap circle to mark correct
              </h3>
              <div className="space-y-2.5">
                {question.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`rounded-xl px-3 py-2.5 border transition-colors min-w-0 ${
                      opt.is_correct ? "border-emerald-400 bg-emerald-50/50" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => setCorrectOption(opt.id)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          opt.is_correct ? "border-emerald-500" : "border-slate-300"
                        }`}
                        aria-label={`Mark ${opt.letter} as correct`}
                      >
                        {opt.is_correct && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </button>
                      <span className="text-xs font-semibold text-slate-400 w-4 flex-shrink-0">{opt.letter}</span>
                      <input
                        ref={(el) => {
                          optionInputRefs.current[opt.id] = el
                        }}
                        value={opt.text}
                        onChange={(e) => updateOption(opt.id, { text: e.target.value })}
                        className="flex-1 min-w-0 text-sm outline-none bg-transparent font-mono"
                      />
                      <button
                        onClick={() => setEquationTarget({ kind: "option", optionId: opt.id })}
                        className="text-slate-300 hover:text-slate-600 p-1 flex-shrink-0"
                        title="Insert equation"
                      >
                        <Sigma size={13} />
                      </button>
                    </div>
                    {/* Live rendered preview right under the raw input — immediate feedback
                       while editing, without needing to look at the Student Preview column */}
                    <div className="mt-1.5 pl-[30px] text-sm text-slate-600 min-w-0 break-words" style={{ overflowWrap: "anywhere" }}>
                      <MathText text={opt.text} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* METADATA */}
          <section className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Difficulty</label>
                <select
                  value={question.difficulty}
                  onChange={(e) => updateField("difficulty", e.target.value as ReviewQuestion["difficulty"])}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                {question.aiSuggestedDifficulty && question.aiSuggestedDifficulty !== question.difficulty && (
                  <button
                    onClick={() => updateField("difficulty", question.aiSuggestedDifficulty!)}
                    className="text-[10px] text-violet-600 hover:underline mt-1"
                  >
                    AI suggests: {question.aiSuggestedDifficulty}
                  </button>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Points</label>
                <input
                  type="number"
                  min={1}
                  value={question.poin}
                  onChange={(e) => updateField("poin", Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              {question.aiSuggestedTopic && (
                <div className="min-w-0">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Topic (AI)</label>
                  <div className="h-9 px-2.5 rounded-lg bg-violet-50 text-violet-700 text-sm flex items-center truncate">
                    {question.aiSuggestedTopic}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* STUDENT PREVIEW — its own scroll region, read-only, own visual style */}
        <div className="lg:sticky lg:top-6 min-w-0">
          <section className="bg-slate-50 rounded-2xl ring-1 ring-slate-200 p-5 min-w-0">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Student preview</h3>
            <div className="text-sm text-slate-900 max-h-[70vh] overflow-y-auto pr-1" style={{ overflowWrap: "anywhere" }}>
              <p className="font-semibold mb-2">Question {index + 1}</p>
              <MathText text={question.question_text} className="block mb-4" />
              {/* Multiple images in student preview (when not already embedded inline in question_text) */}
              {!question.question_text?.includes("![") && (question.imageUrls?.length > 0 || question.imageUrl) && (
                <div className="mb-4 flex flex-col gap-2">
                  {(question.imageUrls?.length > 0 ? question.imageUrls : [question.imageUrl!]).map((url, i) => (
                    <img key={i} src={url} alt={`Gambar soal ${i + 1}`} className="max-h-40 rounded-lg border border-slate-100 object-contain" />
                  ))}
                </div>
              )}
              {question.question_type === "MULTIPLE_CHOICE" && (
                <div className="space-y-2">
                  {question.options.map((opt) => (
                    <div key={opt.id} className="flex gap-2 min-w-0">
                      <span className="font-semibold text-slate-500 flex-shrink-0">{opt.letter}.</span>
                      <MathText text={opt.text} className="min-w-0 break-words" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <EquationEditorModal
        isOpen={equationTarget !== null}
        initialLatex=""
        onClose={() => setEquationTarget(null)}
        onSave={insertEquationSnippet}
      />
    </div>
  )
}