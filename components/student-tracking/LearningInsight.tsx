"use client";

import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import type { LearningInsight as LearningInsightType } from "@/types/student";
import { cn } from "@/lib/student/cn"; 

interface LearningInsightProps {
  insights: LearningInsightType[];
}

function renderText(text: string, highlight?: string) {
  if (!highlight || !text.includes("{h}")) return text;
  const [before, after] = text.split("{h}");
  return (
    <>
      {before}
      <span className="font-bold">{highlight}</span>
      {after}
    </>
  );
}

const KIND_STYLES: Record<
  LearningInsightType["kind"],
  { icon: React.ReactNode; iconBg: string }
> = {
  improvement: {
    icon: <TrendingUp className="h-4 w-4 text-white" aria-hidden="true" />,
    iconBg: "bg-emerald-600",
  },
  weakness: {
    icon: <TrendingDown className="h-4 w-4 text-white" aria-hidden="true" />,
    iconBg: "bg-rose-600",
  },
  recommendation: {
    icon: <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />,
    iconBg: "bg-[#0D4669]",
  },
};

export function LearningInsight({ insights }: LearningInsightProps) {
  return (
    <section
      aria-label="Learning insights"
      className="animate-fade-slide-up rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAD136]">
          <Sparkles className="h-4 w-4 text-[#0D4669]" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Learning insights
          </p>
          <h3 className="text-base font-bold text-slate-900">Generated for this learner</h3>
        </div>
      </div>

      <ul className="space-y-3" role="list">
        {insights.map((insight) => {
          const style = KIND_STYLES[insight.kind];
          return (
            <li key={insight.id} className="flex items-start gap-3">
              <span
                className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", style.iconBg)}
                aria-hidden="true"
              >
                {style.icon}
              </span>
              <p className="text-sm leading-relaxed text-slate-700">
                {renderText(insight.text, insight.highlight)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
