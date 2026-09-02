"use client"

import { getSubjectTheme, type SubjectThemeKey } from "@/lib/theme/subject-themes"
import QuizPreviewCard from "./QuizPreviewCard"

export interface QuizFormValue {
  title: string
  description: string
  subjectId: number | null
  difficulty: "Easy" | "Medium" | "Hard"
  duration: number
  visibility: "draft" | "published"
  attempts: number
}

export interface QuizFormSubjectOption {
  id: number
  name: string
  theme: SubjectThemeKey
  icon: React.ReactNode
  caption?: string
}

interface QuizCreateFormProps {
  value: QuizFormValue
  onChange: (patch: Partial<QuizFormValue>) => void
  subjects: QuizFormSubjectOption[]
  onCancel: () => void
  onSaveAndAddQuestions: () => void
  onPublish: () => void
}

/**
 * Komponen ini murni UI + controlled state (value/onChange).
 * Validasi, submit ke API, dan navigasi tetap jadi tanggung jawab
 * halaman pemanggil yang sudah punya logic-nya — komponen ini
 * tidak melakukan fetch atau side-effect apa pun.
 */
export default function QuizCreateForm({
  value,
  onChange,
  subjects,
  onCancel,
  onSaveAndAddQuestions,
  onPublish,
}: QuizCreateFormProps) {
  const selectedSubject = subjects.find((s) => s.id === value.subjectId)
  const activeTheme = getSubjectTheme(selectedSubject?.theme ?? "math")

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 md:pb-8">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          ← Console
        </button>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button
            onClick={onSaveAndAddQuestions}
            className="h-9 px-4 rounded-xl text-sm font-medium ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Save &amp; add questions
          </button>
          <button
            onClick={onPublish}
            className={`h-9 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] ${activeTheme.button}`}
          >
            🚀 Publish
          </button>
        </div>
      </div>

      <div className="pt-6 flex items-center gap-3 mb-6">
        <div className={`w-11 h-11 rounded-2xl ${activeTheme.iconBg} text-white flex items-center justify-center`}>
          ✨
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">New assessment</p>
          <h1 className="text-2xl font-bold text-slate-900">Create a quiz</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Left: form */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 space-y-4">
            <FormField label="Quiz title">
              <input
                value={value.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="e.g. Quadratic Equations Practice"
                className={`w-full h-11 px-3 rounded-xl border border-slate-200 text-sm outline-none transition-shadow ${activeTheme.focusRing}`}
              />
            </FormField>
            <FormField label="Description">
              <textarea
                value={value.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="What will students learn or practice?"
                rows={3}
                className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none outline-none transition-shadow ${activeTheme.focusRing}`}
              />
            </FormField>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Subject track</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjects.map((s) => {
                const theme = getSubjectTheme(s.theme)
                const selected = s.id === value.subjectId
                return (
                  <button
                    key={s.id}
                    onClick={() => onChange({ subjectId: s.id })}
                    className={`relative text-left rounded-2xl p-4 border-2 transition-all duration-150 hover:-translate-y-0.5 ${
                      selected ? `${theme.selectedBorder} ${theme.cardBg}` : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    {selected && (
                      <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${theme.iconBg}`} />
                    )}
                    <div className={`w-9 h-9 rounded-xl ${theme.iconBg} text-white flex items-center justify-center mb-2`}>
                      {s.icon}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.caption ?? "Structured curriculum"}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 grid sm:grid-cols-2 gap-4">
            <FormField label="Difficulty">
              <div className="flex gap-2">
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => onChange({ difficulty: d })}
                    className={`flex-1 h-9 rounded-lg text-sm font-medium border transition-colors ${
                      value.difficulty === d
                        ? `text-white border-transparent ${activeTheme.button}`
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Duration">
              <div className="flex gap-2 flex-wrap">
                {[30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => onChange({ duration: d })}
                    className={`px-3 h-9 rounded-lg text-sm font-medium border transition-colors ${
                      value.duration === d
                        ? `text-white border-transparent ${activeTheme.button}`
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        {/* Right: sticky preview + visibility */}
        <div className="space-y-5 lg:sticky lg:top-20 self-start">
          <QuizPreviewCard
            title={value.title}
            description={value.description}
            subjectTheme={selectedSubject?.theme ?? "math"}
            subjectLabel={selectedSubject?.name ?? "Select subject"}
            difficulty={value.difficulty}
            duration={value.duration}
            attempts={value.attempts}
          />

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Visibility</p>
            <div className="space-y-2">
              <VisibilityOption
                selected={value.visibility === "draft"}
                theme={activeTheme}
                title="Save as draft"
                description="Only you can see it."
                onClick={() => onChange({ visibility: "draft" })}
              />
              <VisibilityOption
                selected={value.visibility === "published"}
                theme={activeTheme}
                title="Publish now"
                description="Available to enrolled students."
                onClick={() => onChange({ visibility: "published" })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 flex gap-2 z-30">
        <button onClick={onCancel} className="flex-1 h-11 rounded-xl text-sm font-medium text-slate-600 ring-1 ring-slate-200">
          Cancel
        </button>
        <button
          onClick={onSaveAndAddQuestions}
          className="flex-1 h-11 rounded-xl text-sm font-medium ring-1 ring-slate-200 text-slate-700"
        >
          Save
        </button>
        <button
          onClick={onPublish}
          className={`flex-1 h-11 rounded-xl text-sm font-semibold text-white ${activeTheme.button}`}
        >
          Publish
        </button>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function VisibilityOption({
  selected,
  theme,
  title,
  description,
  onClick,
}: {
  selected: boolean
  theme: ReturnType<typeof getSubjectTheme>
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-3.5 border-2 transition-all duration-150 ${
        selected ? `${theme.selectedBorder} bg-slate-50` : "border-slate-100 hover:border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selected ? theme.selectedBorder : "border-slate-300"
          }`}
        >
          {selected && <span className={`w-2 h-2 rounded-full ${theme.iconBg}`} />}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  )
}