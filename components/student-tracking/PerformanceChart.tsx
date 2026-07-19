"use client"

import { useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { PerformanceHistory, PerformancePeriod } from "@/types/student"
import { cn } from "@/lib/student/cn"

interface PerformanceChartProps {
  history: PerformanceHistory;
}

const PERIODS: Array<{ key: PerformancePeriod; label: string }> = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "semester", label: "Semester" },
];

export function PerformanceChart({ history }: PerformanceChartProps) {
  const [period, setPeriod] = useState<PerformancePeriod>("weekly");
  const data = history[period];

  return (
    <section
      aria-label="Performance trend"
      className="animate-fade-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Performance trend
          </p>
          <h3 className="text-base font-bold text-slate-900">
            Score over time
          </h3>
        </div>
        <div
          role="group"
          aria-label="Select time period"
          className="flex rounded-full bg-slate-100 p-0.5"
        >
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D4669]/30",
                period === p.key
                  ? "bg-white text-[#0D4669] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full" role="img" aria-label={`Line chart of score trend, ${period}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#eef2f7" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0D4669"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#0D4669" }}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
