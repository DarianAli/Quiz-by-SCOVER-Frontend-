"use client"

export interface LiveActivityItem {
  id: number
  studentInitials: string
  message: string // contoh: "submitted Quadratic Equations Practice"
  timeAgo: string // contoh: "2 min ago"
  score?: number // 0-100, tampil sebagai badge kalau ada
}

interface LiveActivityCardProps {
  items: LiveActivityItem[]
}

export default function LiveActivityCard({ items }: LiveActivityCardProps) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-900">Live activity</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
          Live
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                {item.studentInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="font-semibold text-slate-900">{item.studentInitials}</span> {item.message}
                </p>
                <p className="text-[11px] text-slate-400">{item.timeAgo}</p>
              </div>
              {item.score !== undefined && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex-shrink-0">
                  {item.score}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}