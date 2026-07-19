"use client"

import { ChevronRight, Flame, TrendingDown, TrendingUp } from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import type { Student } from "@/types/student"
import { formatRelativeTime } from "@/lib/student/format"
import { cn } from "@/lib/student/cn"

interface StudentCardProps {
  student: Student;
  selected: boolean;
  onSelect: (studentId: string) => void;
}

export function StudentCard({ student, selected, onSelect }: StudentCardProps) {
  const trendColor =
    student.trend.direction === "up"
      ? "text-emerald-600"
      : student.trend.direction === "down"
        ? "text-rose-600"
        : "text-slate-400";

  return (
    <button
      type="button"
      onClick={() => onSelect(student.id)}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-150",
        "hover:scale-[1.005] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D4669]/30",
        selected
          ? "border-[#0D4669] bg-[#0D4669]/[0.04] shadow-sm ring-1 ring-[#0D4669]/20"
          : "border-transparent bg-white hover:border-slate-200"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
          selected ? "bg-[#0D4669]" : "bg-slate-400"
        )}
        aria-hidden="true"
      >
        {student.avatarInitials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">
            {student.name}
          </p>
          {student.streakDays > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
              <Flame className="h-2.5 w-2.5" aria-hidden="true" />
              {student.streakDays}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate-500">
          {student.className} · {formatRelativeTime(student.lastActiveAt)}
        </p>
      </div>

      <div className="hidden h-8 w-16 shrink-0 sm:block" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={student.sparkline}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={student.trend.direction === "down" ? "#e11d48" : "#10b981"}
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-slate-900">
          {student.averageScore}
        </p>
        <p className={cn("flex items-center justify-end gap-0.5 text-[11px] font-medium", trendColor)}>
          {student.trend.direction === "up" && (
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
          )}
          {student.trend.direction === "down" && (
            <TrendingDown className="h-3 w-3" aria-hidden="true" />
          )}
          {student.trend.direction === "flat" ? "±0%" : `${student.trend.direction === "up" ? "+" : "-"}${student.trend.value}%`}
        </p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}
