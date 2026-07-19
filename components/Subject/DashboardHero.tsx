"use client"

import StatCard from "./StatCard"

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
  teacherName: string
  pendingReviews: number
  newSubmissions: number
  stats: DashboardHeroStats
  onCreateQuiz: () => void
  onScheduleSession?: () => void
}

/**
 * Presentasi murni — semua angka & handler datang dari parent yang
 * sudah terhubung ke data/API asli. Tidak ada fetch atau logic di sini.
 */
export default function DashboardHero({
  teacherName,
  pendingReviews,
  newSubmissions,
  stats,
  onCreateQuiz,
  onScheduleSession,
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2] p-6 sm:p-8 md:p-10 animate-fade-slide-up">
      {/* subtle glow accents, dekoratif murni */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-royal-400/20 blur-3xl" />

      <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-300 bg-white/10 rounded-full px-3 py-1 mb-4">
            🔥 Time for LOCKED IN
          </span>

          <h1 className="font-bold leading-tight text-white text-[clamp(1.5rem,3vw,2.25rem)]">
            Good morning, {teacherName}.
            <br />
            <span className="text-white/60">Ready to shape brilliant minds?</span>
          </h1>

          <p className="text-sm text-white/70 mt-4 max-w-md">
            You have <span className="font-semibold text-white">{pendingReviews} quizzes</span> waiting for
            review and <span className="font-semibold text-white">{newSubmissions} new submissions</span> since
            yesterday.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={onCreateQuiz}
              className="h-10 px-5 rounded-xl bg-white text-[#112B66] text-sm font-semibold hover:bg-white/90 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              + Create quiz
            </button>
            {onScheduleSession && (
              <button
                onClick={onScheduleSession}
                className="h-10 px-5 rounded-xl bg-white/10 text-white text-sm font-medium ring-1 ring-white/15 hover:bg-white/[0.16] transition-all duration-150"
              >
                📅 Schedule session
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 content-start">
          <StatCard tone="dark" label="Active quizzes" value={stats.activeQuiz} delta={stats.activeQuizDelta} />
          <StatCard tone="dark" label="Students engaged" value={stats.studentsEngaged} delta={stats.studentsEngagedDelta} />
          <StatCard tone="dark" label="Avg. score" value={stats.averageScore} suffix="%" delta={stats.averageScoreDelta} />
          <StatCard tone="dark" label="Completion rate" value={stats.completionRate} suffix="%" delta={stats.completionRateDelta} />
        </div>
      </div>
    </div>
  )
}