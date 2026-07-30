"use client"

import type { SubjectMastery } from "@/types/student"
import { getSubjectTheme } from "@/lib/theme/subject-themes";

interface SubjectPerformanceProps {
  mastery: SubjectMastery[];
}

export function SubjectPerformance({ mastery }: SubjectPerformanceProps) {
  return (
    <section
      aria-label="Subject mastery"
      className="animate-fade-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Subject mastery
      </p>
      <h3 className="text-base font-bold text-slate-900">
        Where they stand per track
      </h3>

      <ul className="mt-4 space-y-4" role="list">
        {mastery.map((m) => {
          const theme = getSubjectTheme(m.subject as any);
          return (
            <li key={`${m.subject}-${m.label}`}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${theme.iconBg}`}
                    aria-hidden="true"
                  >
                    {m.label.charAt(0)}
                  </span>
                  {m.label}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {m.mastery}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${m.label} mastery`}
                aria-valuenow={m.mastery}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${theme.progressFill}`}
                  style={{ width: `${m.mastery}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}