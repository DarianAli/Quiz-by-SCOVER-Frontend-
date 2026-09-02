"use client"

import StatCard from "./StatCard"
import { getSubjectIcon, pickSubjectTheme } from "@/lib/theme/subject-visuals"
import { getSubjectTheme } from "@/lib/theme/subject-themes"
import { any } from "zod/v4-mini"

export interface DashboardHeroStats {
  activeQuiz: number
  activeQuizDelta?: string
  studentsEngaged: number
  studentsEngagedDelta?: string
  averageScore: number
  averageScoreDelta?: string
  completionRate: number
  completionRateDelta?: string
}

export type TentorAvatar = { 
  uuid: string;
  name: string;
  photo: string | null
}

export interface DashboardHeroProps {
  subjectId: string
  subjectName: string
  className: string
  tentors: TentorAvatar[]
  /** Target kurikulum tahunan (annual_quiz_target) — jumlah quiz yang ditargetkan setahun. Basis perhitungan progress. */
  annualGoal: number
  /** Jumlah quiz berstatus PUBLISHED. Modul tidak punya status "selesai" sendiri, jadi progress selalu dihitung dari quiz. */
  completedQuizzes: number
  curriculumProgress?: number
  stats: DashboardHeroStats
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}

const TentorAvatarStack = ({ tentors, theme }: { tentors: TentorAvatar[]; theme: any }) => {
  const visible = tentors.slice(0, 3);
  const extra = tentors.length - visible.length;

  if (tentors.length === 0) {
    return <span className="text-xs text-slate-400">Belum ada tentor</span>
  }

  return (
    <div className="flex items-center -spacex-2">
      {visible.map((t) => (
        <div
          key={t.uuid}
          title={t.name}
          className="w-6 h-6 rounded-full ring-2 ring-white bg-white overflow-hidden flex items-center justify-center shrink-0"
        >
          {t.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
          ) : (
            <span className={`text-[9px] font-bold ${theme.text}`}>{initials(t.name)}</span>
          )}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-slate-600">+{extra}</span>
        </div>
      )}
    </div>
  )
}


export default function DashboardHero({
  subjectId,
  subjectName,
  className,
  annualGoal,
  completedQuizzes,
  curriculumProgress,
  tentors,
  stats,
}: DashboardHeroProps) {
  const themeKey = pickSubjectTheme(subjectId)
  const theme = getSubjectTheme(themeKey)
  const icon = getSubjectIcon(themeKey, 24)
  

  // annual_quiz_target adalah basis progress — sama seperti admin dashboard.
  // Modul tidak punya status "selesai", jadi progress dihitung dari jumlah quiz
  // PUBLISHED terhadap target quiz tahunan, bukan dari data modul.
  const hasTarget = annualGoal > 0;
  const progress = curriculumProgress ?? (
    hasTarget ? Math.min(100, Math.round((completedQuizzes / annualGoal) * 100)) : 0
  )

  return (
    <div className={`relative overflow-hidden rounded-3xl ${theme.previewBg} p-6 sm:p-8 md:p-10 animate-fade-slide-up shadow-sm`}>
      {/* subtle glow accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-black/10 blur-3xl" />

      <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8">
        <div className="flex flex-col h-full">
          {/* Top section: Icon, Badges */}
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 ring-1 ring-white/20 text-white shrink-0">
              {icon}
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-white/60">
                  {className}
                </p>
                <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-white/90 bg-white/20 px-1.5 py-0.5 rounded">
                  Kelas Saya
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-0.5">{subjectName}</h1>
            </div>
          </div>

          {/* Middle section: Teachers and Goals */}
          <div className="flex flex-wrap items-center gap-6 mt-2 mb-8">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Assigned Teachers</p>
              <div className="flex items-center">
                <TentorAvatarStack tentors={tentors} theme={theme}/>
              </div>
            </div>

            <div className="w-px h-10 bg-white/20 hidden sm:block"></div>

            <div className="space-y-1">
              <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Annual Goal</p>
              <p className="text-base font-semibold text-white">
                {hasTarget ? `${annualGoal} modules` : "Belum diatur"}
              </p>
            </div>
          </div>
          
          <div className="flex-grow"></div>

          {/* Bottom section: Progress Bar */}
          <div className="w-full mt-auto">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Curriculum Goal Progress</p>
                <p className="text-sm text-white/90 font-medium">
                  {hasTarget ? `${completedQuizzes} dari ${annualGoal} kuis selesai` : "Target tahunan belum diatur"}
                </p>
              </div>
              <span className="text-2xl font-bold text-white leading-none">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 content-start">
          <StatCard tone="dark" label="Total Quizzes" value={stats.activeQuiz} delta={stats.activeQuizDelta} />
          <StatCard tone="dark" label="Total Students" value={stats.studentsEngaged} delta={stats.studentsEngagedDelta} />
          <StatCard tone="dark" label="Avg. Score" value={stats.averageScore} suffix="%" delta={stats.averageScoreDelta} />
          <StatCard tone="dark" label="Completion Rate" value={stats.completionRate} suffix="%" delta={stats.completionRateDelta} />
        </div>
      </div>
    </div>
  )
}