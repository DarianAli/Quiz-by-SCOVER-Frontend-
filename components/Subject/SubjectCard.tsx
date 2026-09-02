"use client"

import { useEffect, useState } from "react"
import { getSubjectTheme, type SubjectThemeKey } from "@/lib/theme/subject-themes"

export interface SubjectCardData {
  id: string
  name: string
  description?: string
  icon: React.ReactNode
  theme: SubjectThemeKey
  lessonCount: number
  studentCount: number
  annual_quiz_target: number // 0-100
  isMyClass?: boolean
}

interface SubjectCardProps {
  subject: SubjectCardData
  onManage: (id: string) => void
}

export default function SubjectCard({ subject, onManage }: SubjectCardProps) {
  const theme = getSubjectTheme(subject.theme)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnimatedProgress(subject.annual_quiz_target), 80)
    return () => clearTimeout(t)
  }, [subject.annual_quiz_target])

  return (
    <div
      className={`group relative rounded-3xl p-5 ${theme.cardBg} ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
    >
      {subject.isMyClass && (
        <span className={`absolute top-4 right-4 inline-flex items-center gap-1 ${theme.badge} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
          ✓ Kelas Saya
        </span>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-2xl ${theme.iconBg} text-white flex items-center justify-center shadow-md transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-3`}
        >
          {subject.icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{subject.name}</h3>
          <p className="text-xs text-slate-500">
            {subject.lessonCount} lessons · {subject.studentCount} students
          </p>
        </div>
      </div>

      {subject.description && <p className="text-sm text-slate-600 mb-4">{subject.description}</p>}

      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
        <span>Curriculum progress</span>
        <span className={`font-semibold ${theme.text}`}>{subject.annual_quiz_target}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/5 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full ${theme.progressFill} transition-all duration-700 ease-out`}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      <button
        onClick={() => onManage(subject.id)}
        className={`w-full h-10 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${theme.button}`}
      >
        Manage →
      </button>
    </div>
  )
}