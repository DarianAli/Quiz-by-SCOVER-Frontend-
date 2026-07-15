"use client"

import { getSubjectTheme, type SubjectThemeKey } from "@/lib/theme/subject-themes"

export interface QuizPreviewCardProps {
  title: string
  description: string
  subjectTheme: SubjectThemeKey
  subjectLabel: string
  difficulty: string
  duration: number
  attempts?: number
}

export default function QuizPreviewCard({
  title,
  description,
  subjectTheme,
  subjectLabel,
  difficulty,
  duration,
  attempts,
}: QuizPreviewCardProps) {
  const theme = getSubjectTheme(subjectTheme)

  return (
    <div
      className={`rounded-3xl p-6 text-white shadow-lg transition-colors duration-300 ${theme.previewBg} animate-gradient-fade`}
      key={subjectTheme} // key berubah -> retrigger fade transition tiap ganti subject
    >
      <p className="text-[11px] font-medium tracking-wide uppercase text-white/70 mb-1">Preview</p>
      <h3 className="text-xl font-bold mb-1">{title || "Untitled quiz"}</h3>
      <p className="text-sm text-white/80 mb-4">{description || "Your description will show up here as students see it."}</p>

      <div className="flex flex-wrap gap-2">
        <PreviewPill>{subjectLabel}</PreviewPill>
        <PreviewPill>{difficulty}</PreviewPill>
        <PreviewPill>{duration} min</PreviewPill>
        {attempts !== undefined && <PreviewPill>{attempts} attempts</PreviewPill>}
      </div>
    </div>
  )
}

function PreviewPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
      {children}
    </span>
  )
}