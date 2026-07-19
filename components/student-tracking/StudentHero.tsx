"use client"

import { GraduationCap, Trophy, TrendingUp } from "lucide-react"
import type { ClassOverview } from "@/types/student"

interface StudentHeroProps {
  overview: ClassOverview;
}

/**
 * Top hero banner: "Your class at a glance" + quick stat pills.
 * Uses a soft brand gradient (Primary navy -> a deep royal purple) rather
 * than a hardcoded arbitrary gradient, so it stays on-brand.
 */
export function StudentHero({ overview }: StudentHeroProps) {
  return (
    <section
      aria-label="Class overview"
      className="animate-fade-slide-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10"
    >
      {/* ambient gradient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2] p-6 sm:p-8 md:p-10 animate-fade-slide-up" 
      />
      <div
        aria-hidden="true"
        className="animate-gradient-fade pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Students
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Your class at a glance
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
            See who&apos;s soaring, who&apos;s slipping, and drill into any
            learner to spot the topics that need your attention next.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-3 sm:gap-4">
          <HeroStat
            icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
            label="Learners"
            value={overview.learnerCount}
          />
          <HeroStat
            icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
            label="Class avg"
            value={`${overview.averageScore}%`}
          />
          <HeroStat
            icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
            label="Rising"
            value={overview.risingCount}
          />
        </dl>
      </div>
    </section>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm ring-1 ring-white/10 transition-transform duration-200 hover:scale-[1.02]">
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/60">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-xl font-bold sm:text-2xl">{value}</dd>
    </div>
  );
}
