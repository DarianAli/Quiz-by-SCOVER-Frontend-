"use client"

import { getQuestionTypeTheme, type QuestionTypeKey } from "@/lib/theme/question-type-themes"

interface QuestionTypeCardProps {
  typeKey: QuestionTypeKey
  icon: React.ReactNode
  selected: boolean
  onSelect: () => void
}

export default function QuestionTypeCard({ typeKey, icon, selected, onSelect }: QuestionTypeCardProps) {
  const theme = getQuestionTypeTheme(typeKey)

  return (
    <button
      onClick={onSelect}
      className={`text-left rounded-2xl p-4 border-2 transition-all duration-150 hover:-translate-y-0.5 ${
        selected ? `${theme.selectedBorder} ${theme.selectedRing} bg-white` : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl ${theme.iconBg} text-white flex items-center justify-center mb-3 transition-transform duration-150 ${selected ? "rotate-3" : ""}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-900">{theme.label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{theme.description}</p>
    </button>
  )
}