"use client"

export interface WeeklyStreakCardProps {
  days: number
  totalDaysInView?: number // default 14, jumlah dot yang ditampilkan
}

export default function WeeklyStreakCard({ days, totalDaysInView = 14 }: WeeklyStreakCardProps) {
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-[#112B66] to-[#1D61D2] text-white">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-medium tracking-wide uppercase text-white/60">Weekly streak</p>
        <span className="text-lg">🏆</span>
      </div>
      <p className="text-3xl font-bold mb-1">{days} days</p>
      <p className="text-xs text-white/60 mb-4">Keep going — a class average record awaits.</p>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: totalDaysInView }).map((_, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              i < days ? "bg-gold-400" : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  )
}