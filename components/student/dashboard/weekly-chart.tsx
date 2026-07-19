"use client";

import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from "recharts";
import { IWeeklyScoreItem } from "@/app/types";

interface WeeklyChartProps {
    data: IWeeklyScoreItem[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700">{label}</p>
            <p className="text-sm font-bold text-[#1D61D2]">{payload[0].value > 0 ? `${payload[0].value} pts` : "—"}</p>
        </div>
    );
};

export function WeeklyChart({ data }: WeeklyChartProps) {
    const today = new Date().getDay(); // 0=Sun,1=Mon,...
    const dayMap: Record<string, number> = { Sen: 1, Sel: 2, Rab: 3, Kam: 4, Jum: 5, Sab: 6, Min: 0 };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 md:p-6"
        >
            <div className="mb-5">
                <h3 className="text-base font-bold text-[#083E63]">Skor Mingguan</h3>
                <p className="text-sm text-gray-500 mt-0.5">Rata-rata skor per hari dalam 7 hari terakhir</p>
            </div>
            <div className="h-[200px] md:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "var(--font-poppins)" }}
                            axisLine={false} tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            axisLine={false} tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(29,97,210,0.04)", radius: 8 }} />
                        <Bar dataKey="average_score" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => {
                                const isToday = dayMap[entry.day] === today;
                                const hasData = entry.average_score > 0;
                                return (
                                    <Cell
                                        key={index}
                                        fill={isToday ? "#1D61D2" : hasData ? "#93C5FD" : "#E2E8F0"}
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#1D61D2]" />
                    <span className="text-[11px] text-gray-400">Hari ini</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#93C5FD]" />
                    <span className="text-[11px] text-gray-400">Ada kuis</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gray-200" />
                    <span className="text-[11px] text-gray-400">Tidak ada kuis</span>
                </div>
            </div>
        </motion.div>
    );
}

export default WeeklyChart;
