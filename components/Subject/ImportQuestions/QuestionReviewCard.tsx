"use client"

import { useRef, useState } from "react"
import { AlertTriangle, Sigma, Trash2, Copy, ImageIcon, Sparkles } from "lucide-react"
import MathText from "./MathText"
import EquationEditorMOdal from "./EquationEditorModal"
import { updateOptions } from "recharts/types/state/rootPropsSlice"

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
    image: string | null
    imageUrl: string | null
    options: ReviewOption[]
    warnings: string[]
    aiSuggestedDifficulty: "EASY" | "MEDIUM" | "HARD" 
    aiSuggestedTopic?: string
    aiEquationFlag?: boolean
    selected: boolean
}

interface Props {
    question: ReviewQuestion
    index: number
    onChange: (update: ReviewQuestion) => void
    onDelete: () => void
    onDuplicate: () => void
}

type EquationTarget = { kind: "question" } | { kind: "option"; optionId: string }

export default function QuestionReviewCard({question, index, onChange, onDelete, onDuplicate}: Props) {
    const [equationTarget, setEquationTarget] = useState<EquationTarget | null>(null)
    const questionTextareaRef = useRef<HTMLTextAreaElement>(null)
    const optionInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
    
    const hasWarnings = question.warnings.length > 0

    const updateField = <K extends keyof ReviewQuestion>(key: K, value: ReviewQuestion[K]) => {
        onChange({...question, [key]: value})
    }

    const updateOption = (optionId: string, patch: Partial<ReviewOption>) => {
        onChange({
            ...question,
            options: question.options.map((o) => ({ ...o, is_correct: o.id === optionId })),
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
        <div
            className={`rounded-2xl bg-white ring-1 shadow-sm p-5 space-y-4 transition-colors ${
                hasWarnings ? "ring-amber-300" : "ring-slate-100"
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={question.selected}
                        onChange={(e) => updateField("selected", e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300"
                        aria-label={`Select question ${index + 1}`}
                    />
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                    </span>
                    {hasWarnings && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            <AlertTriangle size={11}/> Perlu direview
                        </span>
                    )}
                    {question.aiEquationFlag && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                            <Sparkles size={11} /> AI: cek notasi matematika
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onDuplicate}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Duplicate"
                    >
                        <Copy size={15}/>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        title="Delete"
                    >
                        <Trash2 size={15}/>
                    </button>
                </div>
            </div>

            {hasWarnings && (
                <ul className="text-xs text-amber-700 bg-amber-50/60 rounded-lg px-3 py-2 space-y-0.5">
                    {question.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
            )}

            {/* Question text editor + preview */}
            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Question Text</label>
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
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 resize-none outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">Preview</label>
                    <div className="rounded-xl border-dashed border-slate-200 p-3 text-sm text-slate-900 min-h-[128px] overflow-y-auto bg-slate-50/50">
                        <MathText text={question.question_text}/>
                    </div>
                    {question.imageUrl && (
                        <div className="mt-2 items-center gap-2 text-xs text-slate-400">
                            <ImageIcon size={12}/>
                            <img 
                                src={question.imageUrl} 
                                alt="Question diagram"
                                className="max-h-32 rounded-lg border border-slate-100"    
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Options */}
            {question.question_type === "MULTIPLE_CHOICE" && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Answer choices - tap circle to mark correct
                        </label>
                    </div>
                    <div className="space-y-2">
                        {question.options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-colors ${opt.is_correct ? "border-emerald-400 bg-emerald-50/50" : "border-slate-100"}`}
                            >
                                <button
                                    onClick={() => setCorrectOption(opt.id)}
                                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${opt.is_correct ? "border-emerald-500" : "border-slate-300"}`}
                                    aria-label={`Mark ${opt.letter} as correct`}
                                >
                                    {opt.is_correct && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>}
                                </button>
                                <span className="text-xs font0semibold text-slate-400 w-4">{opt.letter}</span>
                                <input 
                                    ref={(el) => { optionInputRefs.current[opt.id] = el }}
                                    value={opt.text}
                                    onChange={(e) => updateOption(opt.id, { text: e.target.value })}
                                    className="flex-1 text-sm outline-none bg-transparent min-w-0"
                                />
                                <button
                                    onClick={() => setEquationTarget({ kind: "option", optionId: opt.id })}
                                    className="text-slate-300 hover:text-slate-600 p-1"
                                    title="Insert equation"
                                >
                                    <Sigma size={13} />
                                </button>
                                <div className="text-sm min-w-[80px] max-w-[160px] truncate text-slate-500">
                                    <MathText text={opt.text} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata: difficulty, poin, AI suggestion */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
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
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Topic (AI)</label>
                        <div className="h-9 px-2.5 rounded-lg bg-violet-50 text-violet-700 text-sm flex items-center truncate">
                            {question.aiSuggestedTopic}
                        </div>
                    </div>
                )}
            </div>

            <EquationEditorMOdal
                isOpen={equationTarget !== null}
                initialLatex=""
                onClose={() => setEquationTarget(null)}
                onSave={insertEquationSnippet}
            />
        </div>
    )

}