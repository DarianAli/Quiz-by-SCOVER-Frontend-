"use client";

import React from "react";
import { Users, GraduationCap, BookOpen, FileQuestion, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { AdminDashboardOverviewStats } from "@/types/admin";

interface StatCardsProps {
  stats?: AdminDashboardOverviewStats;
  isLoading?: boolean;
}

export function StatCards({ stats, isLoading }: StatCardsProps) {
  const cards = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 428,
      trend: "+12% this month",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Classes",
      value: stats?.totalClasses ?? 16,
      trend: "UTBK & SKD Programs",
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Active Subjects",
      value: stats?.totalSubjects ?? 12,
      trend: "Target quota set",
      icon: BookOpen,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50 text-amber-600",
    },
    {
      title: "Published Quizzes",
      value: stats?.totalQuizzes ?? 84,
      trend: "24 pending drafts",
      icon: FileQuestion,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200/60 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100/80 hover:shadow-md hover:border-slate-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.bgColor} transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value.toLocaleString("id-ID")}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs font-medium text-slate-500">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>{card.trend}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
