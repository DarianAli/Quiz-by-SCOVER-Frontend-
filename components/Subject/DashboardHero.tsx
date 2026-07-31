"use client"

import StatCard from "./StatCard"
import { getSubjectIcon, pickSubjectTheme } from "@/lib/theme/subject-visuals"
import { getSubjectTheme } from "@/lib/theme/subject-themes"

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

export interface DashboardHeroProps {
  subjectId: string
  subjectName: string
  className: string
  annualGoal: number
  completedModules: number
  curriculumProgress: number
  teachers: { uuid: string; name: string; photo: string | null }[]
  stats: DashboardHeroStats
}

export default function DashboardHero({
  subjectId,
  subjectName,
  className,
  annualGoal,
  completedModules,
  curriculumProgress,
  teachers,
  stats,
}: DashboardHeroProps) {
  const themeKey = pickSubjectTheme(subjectId)
  const theme = getSubjectTheme(themeKey)
  const icon = getSubjectIcon(themeKey, 24)

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
                {teachers.length > 0 ? (
                  <div className="flex -space-x-2">
                    {teachers.map((t, i) => (
                      <div 
                        key={t.uuid} 
                        className={`w-8 h-8 rounded-full border-2 border-transparent ring-2 ring-white/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden ${theme.iconBg}`}
                        title={t.name}
                        style={{ zIndex: teachers.length - i }}
                      >
                        {t.photo ? (
                          <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          t.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-white/80">No teachers assigned</span>
                )}
                <div className="ml-3 text-sm font-medium text-white/90">
                  {teachers.map(t => t.name.split(' ')[0]).join(', ')}
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-white/20 hidden sm:block"></div>

            <div className="space-y-1">
              <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Annual Goal</p>
              <p className="text-base font-semibold text-white">{annualGoal} modules</p>
            </div>
          </div>
          
          <div className="flex-grow"></div>

          {/* Bottom section: Progress Bar */}
          <div className="w-full mt-auto">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Curriculum Goal Progress</p>
                <p className="text-sm text-white/90 font-medium">{completedModules} dari {annualGoal} modul selesai</p>
              </div>
              <span className="text-2xl font-bold text-white leading-none">{curriculumProgress}%</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${curriculumProgress}%` }}
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