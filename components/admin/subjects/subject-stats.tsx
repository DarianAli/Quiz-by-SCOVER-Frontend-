"use client";

import React from "react";
import { BookOpen, Target, FileQuestion } from "lucide-react";
import { SubjectEntity } from "@/types/admin";
import { motion } from "framer-motion";

interface SubjectStatsProps {
  subjects: SubjectEntity[];
  isLoading?: boolean;
}

export function SubjectStats({ subjects = [], isLoading = false }: SubjectStatsProps) {
  const totalSubjects = subjects.length;

  const totalTargetQuizzes = subjects.reduce(
    (acc, s) => acc + (s.annual_quiz_target || 40),
    0
  );

  const totalQuizzesCreated = subjects.reduce(
    (acc, s) => acc + (s._count?.quizzes ?? s.quizzes?.length ?? 0),
    0
  );

  const cards = [
    {
      title: "Total Subjects",
      value: totalSubjects,
      sub: "Active curriculum subjects",
      icon: BookOpen,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Annual Quiz Quotas",
      value: totalTargetQuizzes,
      sub: "Combined target target",
      icon: Target,
      color: "bg-[#1D61D2]/10 text-[#1D61D2] border-[#1D61D2]/20",
    },
    {
      title: "Quizzes Published",
      value: totalQuizzesCreated,
      sub: "Active published quizzes",
      icon: FileQuestion,
      color: "bg-purple-50 text-purple-600 border-purple-100",
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
