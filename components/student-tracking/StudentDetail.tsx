"use client"

import { AlertTriangle, Award, Mail, MessageSquare } from "lucide-react"
import type { StudentDetailBundle } from "@/types/student"
import { formatRelativeTime } from "@/lib/student/format"
import { getSubjectTheme } from "@/lib/theme/subject-themes"
import { cn } from "@/lib/student/cn"

interface StudentDetailProps {
  detail: StudentDetailBundle;
}

export function StudentDetail({ detail }: StudentDetailProps) {
  const { student } = detail;
  const strongestTheme = getSubjectTheme(student.strongestSubject);
  const weakestTheme = getSubjectTheme(student.weakestSubject);

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

        <dl className="mt-4 flex flex-wrap gap-2">
          <StatChip label="Avg" value={`${student.averageScore}%`} tone="text-blue-600" />
          <StatChip label="Done" value={`${student.completionRate}%`} tone="text-pink-600" />
          <StatChip label="Streak" value={`${student.streakDays}d`} tone="text-amber-600" />
        </dl>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={cn("rounded-xl p-3", strongestTheme.badge)}>
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">
              <Award className="h-3 w-3" aria-hidden="true" />
              Strongest in
            </p>
            <p className={cn("mt-1 text-sm font-bold", strongestTheme.text)}>
              {detail.subjectMastery.find((m) => m.subject === student.strongestSubject)?.label ??
                strongestTheme.label}{" "}
              · {student.strongestSubjectScore}%
            </p>
          </div>
          <div className="rounded-xl bg-rose-50 p-3">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-rose-500">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              Needs work in
            </p>
            <p className="mt-1 text-sm font-bold text-rose-700">
              {detail.subjectMastery.find((m) => m.subject === student.weakestSubject)?.label ??
                weakestTheme.label}{" "}
              · {student.weakestSubjectScore}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-center">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className={cn("text-sm font-bold", tone)}>{value}</dd>
    </div>
  );
}
