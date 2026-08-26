"use client"

import { AlertTriangle, Check, ChevronLeft, ChevronRight } from "lucide-react"
import type { ReviewQuestion } from "./QuestionReviewCard"

interface Props {
    question: ReviewQuestion[]
    currentIndex: number
    onSelect: (index: number) => void
}

function getPageWindow(current: number, total: number): (number | "ellipsis")[] {
    const siblings = 1
    const boundary = 1
    const totalNumbers = siblings * 2 + boundary * 2 + 3

    if (total <= totalNumbers) {
        return Array.from({ length: total }, (_, i) => i)
    }

    const left = Math.max(current - siblings, boundary) 
    const right = Math.min(current + siblings, total - 1 - boundary)

    const pages: (number | "ellipsis")[] = []
    for (let i = 0; i < boundary; i++) pages.push(i)
    if (left > boundary) pages.push("ellipsis")
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < total - 1 - boundary) pages.push("ellipsis")
    for (let i = total - boundary; i < total; i++) pages.push(i)

    return pages
}

function questionStatus(q: ReviewQuestion): "valid" | "warning" | "empty" {
    const isEmpty = !q.question_text.trim() && q.options.every((o) => !o.text.trim())
    if (isEmpty) return "empty"
    if (q.warnings.length > 0 || (q.question_type === "MULTIPLE_CHOICE" && !q.options.some((o) => o.is_correct))) {
        return "warning"
    }
    return "valid"
}

export default function QuesitonNavigation({ question, currentIndex, onSelect }: Props) {
    const total = question.length
    if (total === 0) return null
    const pages = getPageWindow(currentIndex, total)

    return (
        <div className="flex items-center gap-2 bg-white rounded-2xl ring 1 ring-gray-100 px-3 py-2.5 overflow-x-auto">
            <button
                onClick={() => onSelect(Math.max(0, currentIndex -  1))}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0"
                arial-label="Previous question"
            >
                <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
                {pages.map((p, i) =>
                    p === "ellipsis" ? (
                        <span key={`e-${i}`} className="text-gray-300 text-xs px-1 select-none">
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onSelect(p)}
                            className={`relative w-8 h-8 rounded-lg text-xs font-semibold flex-shrink-0 flex items-center justify-center transition-colors ${
                                p === currentIndex ? "bg-[#1D61D2] text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                            title={`Question ${p + 1}`}
                        >
                            {p + 1}
                            {p !== currentIndex && questionStatus(question[p]) === "warning" && (
                                <AlertTriangle size={9} className="absolute -top-1 -right-1 text-amber-500 bg-white rounded-full" />
                            )}
                            {p !== currentIndex && questionStatus(question[p]) === "valid" && (
                                <Check size={9} className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full" />
                            )}
                        </button>
                    )
                )}
            </div>

            <button
                onClick={() => onSelect(Math.min(total - 1, currentIndex + 1))}
                disabled={currentIndex === total - 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gary-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent flex-shrink-0"
                aria-label="Next question"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    )
}