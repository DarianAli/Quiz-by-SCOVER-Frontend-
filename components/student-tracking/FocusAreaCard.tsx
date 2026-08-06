"use client";

import type { FocusArea } from "@/types/student";
import { getSubjectTheme } from "@/lib/theme/subject-themes";
import { cn } from "@/lib/student/cn";

interface FocusAreaCardProps {
  focusAreas: FocusArea[];
  onAssignPractice?: (focusArea: FocusArea) => void;
}

export function FocusAreaCard({ focusAreas, onAssignPractice }: FocusAreaCardProps) {
  return (
    <section
      aria-label="Focus areas"
      className="animate-fade-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Focus areas
          </p>
          <h3 className="text-base font-bold text-slate-900">
            Topics with lowest mastery
          </h3>
        </div>
        <button
          type="button"
          onClick={() => focusAreas[0] && onAssignPractice?.(focusAreas[0])}
          className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Assign practice
        </button>
      </div>

      <ul className="space-y-3" role="list">
        {focusAreas.map((area) => {
          const theme = getSubjectTheme(area.subject as any);
          return (
            <li
              key={area.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white",
                  theme.iconBg
                )}
                aria-hidden="true"
              >
                {area.subjectLabel.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {area.topic}
                </p>
                <p className="text-xs text-slate-500">
                  {area.subjectLabel} · mastery {area.mastery}%
                </p>
              </div>
              <div
                role="progressbar"
                aria-label={`${area.topic} mastery`}
                aria-valuenow={area.mastery}
                aria-valuemin={0}
                aria-valuemax={100}
                className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:block"
              >
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700 ease-out", theme.progressFill)}
                  style={{ width: `${area.mastery}%` }}
                />
              </div>
            </li>
          );
        })}
        {focusAreas.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
            No focus areas flagged — nice work.
          </li>
        )}
      </ul>
    </section>
  );
}