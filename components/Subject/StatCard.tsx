"use client"

import { request } from "http"
import { useEffect, useState } from "react"

export interface StatCardProps {
    label: string
    value: number
    suffix?: string // "%", "days", dst.
    delta?: string //"+18 days", "+4 vs last wk"
    icon?: React.ReactNode
    tone?: "dark" | "light"
}

/**
 * StatCard menerima angka final (`value`) dan menganimasikannya dari 0 —
 * ini murni presentasi, data tetap datang dari props/parent yang sudah
 * terhubung ke backend/dummy data yang ada.
 */

export default function StatCard({ label, value, suffix = "", delta, icon, tone = "light" }: StatCardProps) {
    const [display, setDisplay] = useState(0)

    useEffect(() => {
        let raf: number
        const duration = 600
        const start = performance.now()
        const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            setDisplay(Math.round(value * progress))
            if (progress < 1) raf = requestAnimationFrame(step)
        }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    }, [value])

    const isDark = tone === "dark"

    return (
        <div 
            className={`rounded-2xl p-4 transition-all duration-200 ${
                isDark 
                    ? "bg-white/10 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/[0.14]"
                    : "bg-white ring01 ring-slate-100 hover:shadow-md hover:-translate-y-0.5"
            }`} 
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-medium tracking-wide uppercase ${isDark ? "text-white/60" : "text-slate-400"}`}>
                    {label}
                </span>
                {icon && <span className={isDark ? "text-white/70" : "text-slate-400"}>{icon}</span>}
            </div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {display}
                {suffix}
            </p>
            {delta && (
                <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-slate-400"}`}>
                    {delta}
                </p>
            )}
        </div>
    )
}