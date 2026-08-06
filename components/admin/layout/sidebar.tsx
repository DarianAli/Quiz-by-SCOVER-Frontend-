"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  FileQuestion,
  Trophy,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardLayout } from "./layout-context";
import { AnimatePresence, motion } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Classes", href: "/admin/classes", icon: GraduationCap },
  { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Quiz", href: "/admin/quizzes", icon: FileQuestion },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Import", href: "/admin/import", icon: FileSpreadsheet },
];

const secondaryNavItems: NavItem[] = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen } = useDashboardLayout();

  const handleLogout = () => {
    // Clear cookies/localStorage and redirect to login
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#174EA6] via-[#1D61D2] to-[#3B7DDE] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#1D61D2]/25 shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
                SCOVER
              </span>
              <span className="text-[10px] font-semibold text-[#1D61D2] uppercase tracking-wider mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline" /> Admin Portal
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Main Menu
            </p>
          )}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                    isActive
                      ? "bg-[#1D61D2] text-white shadow-md shadow-[#1D61D2]/25 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              System
            </p>
          )}
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-[#1D61D2] text-white shadow-md shadow-[#1D61D2]/25"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-150 group"
              )}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0 text-rose-500 group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={cn(
          "hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-72 h-full z-10"
            >
              {navContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
