"use client"

import { BookOpen } from "lucide-react";
import type { QuizAttempt } from "@/types/student";
import { formatQuizDate } from "@/lib/student/format";
import { getSubjectTheme } from "@/lib/theme/subject-themes";
import { cn } from "@/lib/student/cn";

interface RecentQuizListProps {
  quizzes: QuizAttempt[];
}

function scoreTone(score: number | null): string {
  if (score === null) return "bg-slate-100 text-slate-500";
  if (score >= 85) return "bg-emerald-50 text-emerald-700";
  if (score >= 70) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function statusLabel(status: QuizAttempt["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    case "missed":
      return "Missed";
  }
}

export function RecentQuizList({ quizzes }: RecentQuizListProps) {
  return (
    <section
      aria-label="Recent quizzes"
      className="animate-fade-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Recent quizzes
      </p>
      <h3 className="text-base font-bold text-slate-900">Latest attempts</h3>

      <ul className="mt-4 divide-y divide-slate-100" role="list">
        {quizzes.map((quiz) => {
          const theme = getSubjectTheme(quiz.subject as any);
          return (
            <li key={quiz.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", theme.iconBg)}
                aria-hidden="true"
              >
                <BookOpen className="h-4 w-4 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {quiz.quizName}
                </p>
                <p className="text-xs text-slate-500">
                  {formatQuizDate(quiz.date)} · {theme.label}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "inline-block rounded-full px-2.5 py-1 text-xs font-bold",
                    scoreTone(quiz.score)
                  )}
                >
                  {quiz.score !== null ? `${quiz.score}%` : "—"}
                </span>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {statusLabel(quiz.status)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
