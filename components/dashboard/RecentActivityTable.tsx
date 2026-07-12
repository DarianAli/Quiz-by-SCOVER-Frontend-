"use client";

import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ProfilePicTest from "@/public/images/profile.png";
import { IRecentActivity } from "@/app/types";

interface RecentActivityTableProps {
  data: IRecentActivity[];
}

export const RecentActivityTable = ({ data }: RecentActivityTableProps) => {
  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden flex flex-col w-full animate-fade-in">
      {/* Header Menu */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="font-bold text-sm text-[#083E63] tracking-tight">Live Student Work Activity</h4>
        </div>
        <Link 
          href="/activities" 
          className="text-xs font-semibold text-[#0B5C8C] hover:text-[#083E63] flex items-center gap-1 transition-colors group"
        >
          View All 
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm text-gray-400 font-medium bg-white">
                  No active student records found.
                </td>
              </tr>
            ) : (
              data.map((activity) => (
                <tr 
                  key={activity.id} 
                  className="hover:bg-slate-50/60 transition-colors duration-200 group"
                >
                  {/* Date Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-gray-300" />
                      {activity.completedAt}
                    </div>
                  </td>

                  {/* Student Identity */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={activity.avatar || ProfilePicTest.src} 
                        alt={activity.student} 
                        className="w-7 h-7 rounded-full border border-gray-100 object-cover"
                      />
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B5C8C] transition-colors">
                        {activity.student}
                      </span>
                    </div>
                  </td>

                  {/* Subject Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0B5C8C] transition-colors" />
                      {activity.subject}
                    </div>
                  </td>

                  {/* Room / Class */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200/40">
                      {activity.className}
                    </span>
                  </td>

                  {/* Duration Used */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-semibold text-gray-500">
                      {activity.duration} mins
                    </span>
                  </td>

                  {/* Dynamically Colored Score */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold border ${getScoreBadgeClass(activity.score)}`}>
                      {activity.score}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};