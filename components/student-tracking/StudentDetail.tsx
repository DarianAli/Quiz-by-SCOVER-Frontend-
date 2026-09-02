"use client"

import { AlertTriangle, Award, Mail, MessageSquare, BookOpen, TrendingUp, CheckCircle2 } from "lucide-react"
import type { StudentDetailBundle, ModuleMastery } from "@/types/student"
import { formatRelativeTime } from "@/lib/student/format"
import { cn } from "@/lib/student/cn"

interface StudentDetailProps {
  detail: StudentDetailBundle;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50"
  if (score >= 60) return "text-amber-600 bg-amber-50"
  return "text-rose-600 bg-rose-50"
}

export function StudentDetail({ detail }: StudentDetailProps) {
  const { student, subjectMastery } = detail

  // Cari module terbaik dan terlemah dari subjectMastery
  const sorted = [...(subjectMastery ?? [])].sort(
    (a, b) => (b.average_score ?? 0) - (a.average_score ?? 0)
  )
  const strongest: ModuleMastery | undefined = sorted[0]
  const weakest: ModuleMastery | undefined = sorted[sorted.length - 1]

  return (
    <section
      aria-label={`${student.name} detail`}
      className="animate-fade-slide-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="relative bg-gradient-to-r from-[#112B66] via-[#174EA6] to-[#1D61D2] px-5 pb-14 pt-5 sm:px-6">
        <div className="flex justify-end gap-2">
          <a
            href={`mailto:${student.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Email
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0D4669] shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            Message
          </button>
        </div>
      </header>

      <div className="-mt-10 px-5 sm:px-6">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-[#0D4669] text-lg font-bold text-white shadow-md">
          {student.avatarInitials}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 sm:px-6">
        <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
        <p className="text-sm text-slate-500">
          {student.className} · {formatRelativeTime(student.lastActiveAt)}
        </p>

        {/* Quick stat chips */}
        <dl className="mt-4 flex flex-wrap gap-2">
          <StatChip label="Avg" value={`${student.averageScore}%`} tone="text-blue-600" />
          <StatChip label="Done" value={`${student.completionRate}%`} tone="text-pink-600" />
          <StatChip label="Streak" value={`${student.streakDays}d`} tone="text-amber-600" />
        </dl>

        {/* Best / Needs Work modules */}
        {(strongest || weakest) && (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {strongest && (
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  <Award className="h-3 w-3" aria-hidden="true" />
                  Modul Terkuat
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-800 truncate">
                  {strongest.module_name || strongest.label}
                </p>
                <p className="text-[11px] text-emerald-600">
                  {strongest.subject_name} · {strongest.average_score ?? 0} pts
                </p>
              </div>
            )}
            {weakest && weakest.subject !== strongest?.subject && (
              <div className="rounded-xl bg-rose-50 p-3">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-rose-500">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  Perlu Ditingkatkan
                </p>
                <p className="mt-1 text-sm font-bold text-rose-700 truncate">
                  {weakest.module_name || weakest.label}
                </p>
                <p className="text-[11px] text-rose-500">
                  {weakest.subject_name} · {weakest.average_score ?? 0} pts
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-center">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className={cn("text-sm font-bold", tone)}>{value}</dd>
    </div>
  )
}
