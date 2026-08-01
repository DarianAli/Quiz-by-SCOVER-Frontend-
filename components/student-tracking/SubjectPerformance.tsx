"use client"

import { CheckCircle2, BookOpen, TrendingUp } from "lucide-react"
import type { ModuleMastery } from "@/types/student"

interface ModulePerformanceProps {
  /** Array module mastery — menerima data dari backend tentor student detail */
  mastery: ModuleMastery[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600"
  if (score >= 60) return "text-amber-600"
  return "text-rose-500"
}

function getMasteryBarColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500"
  if (pct >= 50) return "bg-blue-500"
  return "bg-amber-400"
}

/**
 * ModulePerformance — menampilkan progress belajar siswa per-modul.
 *
 * Menggantikan SubjectPerformance agar konsisten dengan struktur
 * Subject → Module → Quiz.
 *
 * Props: mastery[] dari `detail.subjectMastery` (tentor student detail API)
 */
export function SubjectPerformance({ mastery }: ModulePerformanceProps) {
  if (!mastery || mastery.length === 0) {
    return (
      <section
        aria-label="Module mastery"
        className="animate-fade-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Module mastery
        </p>
        <h3 className="text-base font-bold text-slate-900">
          Progress per Modul
        </h3>
        <p className="mt-4 text-sm text-slate-400">Belum ada data modul.</p>
      </section>
    )
  }

  return (
    <section
      aria-label="Module mastery"
      className="animate-fade-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Module mastery
      </p>
      <h3 className="text-base font-bold text-slate-900">
        Progress per Modul
      </h3>

      <ul className="mt-4 space-y-4" role="list">
        {mastery.map((m, idx) => {
          const barColor = getMasteryBarColor(m.mastery)
          const scoreColor = getScoreColor(m.average_score ?? 0)
          const hasScore = (m.average_score ?? 0) > 0

          return (
            <li key={`${m.subject}-${idx}`}>
              {/* Module name + subject badge */}
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {m.module_name || m.label}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {m.subject_name}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">
                  {m.mastery}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                role="progressbar"
                aria-label={`${m.module_name || m.label} progress`}
                aria-valuenow={m.mastery}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${barColor}`}
                  style={{ width: `${m.mastery}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                  <span>
                    {m.completed ?? 0}/{m.total ?? 0} quiz
                  </span>
                </div>
                {hasScore && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <TrendingUp className="h-3 w-3 text-slate-400" aria-hidden="true" />
                    <span className={`font-semibold ${scoreColor}`}>
                      {m.average_score} pts
                    </span>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}