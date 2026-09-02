"use client";

import React, { useState } from "react";
import { Search, Bell, Menu, User, Shield, LogOut, CheckCircle2 } from "lucide-react";
import { useDashboardLayout } from "./layout-context";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "New Student Enrolled",
    message: "Ahmad Rizky registered for Class UTBK-1",
    time: "5m ago",
    unread: true,
  },
  {
    id: "2",
    title: "Quiz Completed",
    message: "28 students completed Physics Tryout #2",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Bulk Import Success",
    message: "Successfully imported 45 question items from Word document",
    time: "3h ago",
    unread: false,
  },
];

export function Navbar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const { isCollapsed, toggleMobile } = useDashboardLayout();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}
    >
      {/* Left section: Mobile menu & Quick Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 bg-slate-100/80 hover:bg-slate-100 text-slate-400 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200/60 w-48 sm:w-72 md:w-80 transition-all duration-150 group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="truncate text-slate-500">Search classes, users, quizzes...</span>
          <kbd className="hidden sm:inline-flex ml-auto items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowProfileMenu(false);
            }}
            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#1D61D2] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-slide-up">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="bg-[#1D61D2]/10 text-[#1D61D2] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#1D61D2] hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3.5 hover:bg-slate-50 transition-colors flex gap-3",
                      item.unread && "bg-blue-50/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        item.unread ? "bg-[#1D61D2]" : "bg-transparent"
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#1D61D2] to-[#3B7DDE] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#1D61D2] transition-colors leading-none">
                Admin Officer
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Super Administrator</span>
            </div>
          </button>

          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-slide-up">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Admin Officer</p>
                <p className="text-[11px] text-slate-500 truncate">admin@scover.edu</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" /> Account Settings
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Security Logs
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.href = "/login";
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
