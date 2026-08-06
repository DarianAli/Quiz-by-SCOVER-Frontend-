"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, UserPlus, BookOpen, FileSpreadsheet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  adminName?: string;
  onOpenCreateClass: () => void;
  onOpenCreateUser: () => void;
  onOpenCreateSubject: () => void;
  onOpenBulkImport: () => void;
}

export function DashboardHeader({
  adminName = "Super Admin",
  onOpenCreateClass,
  onOpenCreateUser,
  onOpenCreateSubject,
  onOpenBulkImport,
}: DashboardHeaderProps) {
  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200/80 mb-8">
      {/* Welcome Message & Date */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1D61D2] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{currentDateFormatted}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {adminName}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is what is happening across your LMS platform today.
        </p>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap items-center gap-2.5 sm:gap-3"
      >
        <Button onClick={onOpenCreateClass} variant="primary" size="md">
          <GraduationCap className="w-4 h-4" /> Create Class
        </Button>

        <Button onClick={onOpenCreateUser} variant="primary" size="md">
          <UserPlus className="w-4 h-4" /> Create User
        </Button>

        <Button onClick={onOpenCreateSubject} variant="primary" size="md">
          <BookOpen className="w-4 h-4" /> Create Subject
        </Button>

        {/* Feature 5: Large outlined gold button */}
        <Button
          onClick={onOpenBulkImport}
          variant="gold"
          size="md"
          className="border-2 border-[#F4C430] bg-[#FFF8E1] hover:bg-[#F4C430] text-amber-950 font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-900" /> Bulk Import Preview
        </Button>
      </motion.div>
    </div>
  );
}
