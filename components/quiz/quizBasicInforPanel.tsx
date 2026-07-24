"use client"

import { useMemo, useState, useEffect } from "react"
import { Difficulty } from "@/app/types"
import QuizCreateForm, { type QuizFormValue } from "../Subject/QuizCreateForm"
import { get } from "@/lib/api-bridge"
import { getCookie } from "@/lib/client-cookie"
import { BASE_API_URL } from "@/global"

interface QuizBasicInfoPanelProps {
  open: boolean
  onClose: () => void
  onContinue: (data: {
    quiz_title: string
    classId: number
    subjectId: number
    difficulty: Difficulty
    duration: number
    status: "DRAFT" | "PUBLISHED"
    description: string
  }) => void
}
 
const durationOptions = [30, 45, 60, 90]
const difficultyOptions: Difficulty[] = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD]
 
export default function QuizBasicInfoPanel({ open, onClose, onContinue }: QuizBasicInfoPanelProps) {
  const [quizTitle, setQuizTitle] = useState("")
  const [classId, setClassId] = useState<number | "">("")
  const [subjectId, setSubjectId] = useState<number | "">("")
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM)
  const [duration, setDuration] = useState(45)
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
  const [description, setDescription] = useState("")
  const [formValue, setFormValue] = useState<QuizFormValue>()

  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const token = getCookie("token") as string
          const [resClass, resSub] = await Promise.all([
            get(`${BASE_API_URL}/class/all`, token),
            get(`${BASE_API_URL}/subject/all`, token)
          ])
          if (resClass.data?.status) setClasses(resClass.data.data)
          if (resSub.data?.status) setSubjects(resSub.data.data)
        } catch (error) {
          console.error("Failed to fetch classes/subjects", error)
        }
      }
      fetchData()
    }
  }, [open])

  // Subject difilter berdasarkan class yang dipilih, lewat relasi classes di dalam subject (kalau ada)
  const availableSubjects = useMemo(() => {
    if (!classId) return []
    // Filter subjects that belong to the selected classId. 
    // The subject API may return classes or subjectClass array inside each subject.
    return subjects.filter((s) => {
      // If subject has a classes array, check if any class matches
      if (s.classes && Array.isArray(s.classes)) {
        return s.classes.some((c: any) => c.id === classId)
      }
      // If subject has subjectClass array
      if (s.subjectClass && Array.isArray(s.subjectClass)) {
        return s.subjectClass.some((sc: any) => sc.classId === classId)
      }
      // fallback just return all for now if no relation mapping
      return true
    })
  }, [classId, subjects])
 
  const [retakePolicy, setRetakePolicy] = useState<"ONCE" | "MULTIPLE">("ONCE")
  const [maxAttempts, setMaxAttempts] = useState(1)

  const canContinue = quizTitle.trim().length > 0 && classId !== "" && subjectId !== ""
 
  const handleContinue = () => {
    if (!canContinue) return
    onContinue({
      quiz_title: quizTitle,
      classId: classId as number,
      subjectId: subjectId as number,
      difficulty,
      duration,
      status,
      description,
      retake_policy: retakePolicy,
      max_attempts: maxAttempts
    } as any) // Type assertion because we need to update QuizDashboardProps too
  }
 
  if (!open) return null
 
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
 
      {/* panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Create quiz</h2>
          <p className="text-sm text-slate-500 mt-0.5">Basic info — you can edit this later</p>
        </div>
 
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <Field label="Quiz name">
            <input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Quadratic Equations Practice"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </Field>
 
          <Field label="Class">
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value ? Number(e.target.value) : "")
                setSubjectId("")
              }}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id || c.uuid} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </Field>
 
          <Field label="Subject">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : "")}
              disabled={!classId}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">{classId ? "Select subject" : "Select a class first"}</option>
              {availableSubjects.map((s) => (
                <option key={s.id || s.uuid} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
          </Field>
 
          <Field label="Difficulty">
            <div className="flex gap-2">
              {difficultyOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium border transition-colors ${
                    difficulty === d
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </Field>
 
          <Field label="Duration">
            <div className="flex gap-2 flex-wrap">
              {durationOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-3 h-9 rounded-lg text-sm font-medium border transition-colors ${
                    duration === d
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </Field>
 
          <Field label="Status">
            <div className="flex gap-2">
              {(["DRAFT", "PUBLISHED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium border transition-colors ${
                    status === s
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {s === "DRAFT" ? "Draft" : "Published"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Retake Policy">
            <div className="flex gap-2 mb-2">
              {(["ONCE", "MULTIPLE"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRetakePolicy(p)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium border transition-colors ${
                    retakePolicy === p
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {p === "ONCE" ? "Sekali Coba" : "Berkali-kali"}
                </button>
              ))}
            </div>
            {retakePolicy === "MULTIPLE" && (
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                placeholder="Maksimal Coba (e.g. 3)"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            )}
          </Field>
 
          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short note for yourself or other tentors"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </Field>
        </div>
 
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex-1 h-10 rounded-lg bg-slate-900 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            Continue to editor
          </button>
        </div>
      </div>
    </div>
  )
}
 
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}