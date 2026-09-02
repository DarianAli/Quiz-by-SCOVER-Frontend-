"use client"

import { AlertTriangle, Flame, Sparkles, Target } from "lucide-react"
import type { ClassOverview } from "@/types/student"
import { cn } from "@/lib/student/cn"

interface StudentSummaryCardsProps {
  overview: ClassOverview;
}

export function StudentSummaryCards({ overview }: StudentSummaryCardsProps) {
  const cards: Array<{
    icon: React.ReactNode;
    iconBg: string;
    accent: string;
    eyebrow: string;
    title: string;
    subtitle: string;
  }> = [
    {
      icon: <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />,
      iconBg: "bg-blue-600",
      accent: "from-blue-500/10 to-transparent",
      eyebrow: "Top performer",
      title: overview.topPerformer.name,
      subtitle: `${overview.topPerformer.score}% avg score`,
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-white" aria-hidden="true" />,
      iconBg: "bg-rose-600",
      accent: "from-rose-500/10 to-transparent",
      eyebrow: "At-risk learners",
      title: String(overview.atRiskCount),
      subtitle: `Score < ${overview.atRiskThreshold}% or trending down`,
    },
    {
      icon: <Flame className="h-5 w-5 text-white" aria-hidden="true" />,
      iconBg: "bg-emerald-600",
      accent: "from-emerald-500/10 to-transparent",
      eyebrow: "Longest streak",
      title: `${overview.longestStreak.days} days`,
      subtitle: overview.longestStreak.name,
    },
    {
      icon: <Target className="h-5 w-5 text-white" aria-hidden="true" />,
      iconBg: "bg-[#0D4669]",
      accent: "from-[#0D4669]/10 to-transparent",
      eyebrow: "Avg completion",
      title: `${overview.averageCompletion}%`,
      subtitle: "Across all assigned quizzes",
    },
  ];

  return (
    <section
      aria-label="Class summary"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.eyebrow}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200",
            "hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5"
          )}
        >
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              card.accent
            )}
          />
          <div className="relative">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg shadow-sm sm:h-10 sm:w-10 sm:rounded-xl",
                card.iconBg
              )}
            >
              {card.icon}
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:mt-4">
              {card.eyebrow}
            </p>
            <p className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl">
              {card.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {card.subtitle}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
