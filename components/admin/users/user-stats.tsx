"use client";

import React from "react";
import { Users, GraduationCap, Award, ShieldAlert } from "lucide-react";
import { UserEntity } from "@/types/admin";
import { motion } from "framer-motion";

interface UserStatsProps {
  users: UserEntity[];
  isLoading?: boolean;
}

export function UserStats({ users = [], isLoading = false }: UserStatsProps) {
  const totalUsers = users.length;
  const studentsCount = users.filter((u) => u.role === "STUDENT").length;
  const tentorsCount = users.filter((u) => u.role === "TENTOR").length;
  const adminsCount = users.filter((u) => u.role === "ADMIN").length;

  const cards = [
    {
      title: "Total Accounts",
      value: totalUsers,
      sub: "All registered users",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Students",
      value: studentsCount,
      sub: "Enrolled active learners",
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Tentors / Tutors",
      value: tentorsCount,
      sub: "Instructors & graders",
      icon: Award,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Administrators",
      value: adminsCount,
      sub: "System superusers",
      icon: ShieldAlert,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
