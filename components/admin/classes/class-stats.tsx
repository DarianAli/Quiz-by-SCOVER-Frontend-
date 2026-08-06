"use client";

import React from "react";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { ClassEntity } from "@/types/admin";
import { motion } from "framer-motion";

interface ClassStatsProps {
  classes: ClassEntity[];
  isLoading?: boolean;
}

export function ClassStats({ classes = [], isLoading = false }: ClassStatsProps) {
  const totalClasses = classes.length;
  const totalStudentsEnrolled = classes.reduce(
    (acc, c) => acc + (c._count?.users ?? c.users?.length ?? 0),
    0
  );
  const totalSubjectsAssigned = classes.reduce(
    (acc, c) => acc + (c._count?.subjectClass ?? c.subjectClass?.length ?? 0),
    0
  );

  const cards = [
    {
      title: "Total Class Cohorts",
      value: totalClasses,
      sub: "Active learning groups",
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Total Enrolled Students",
      value: totalStudentsEnrolled,
      sub: "Across all active classes",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Assigned Subject Tracks",
      value: totalSubjectsAssigned,
      sub: "Active curriculum links",
      icon: BookOpen,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
            className="p-4 rounded-2xl bg-white border border-slate-100/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
            <div className={`p-3 rounded-xl border ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
