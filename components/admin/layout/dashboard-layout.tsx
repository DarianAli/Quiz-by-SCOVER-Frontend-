"use client";

import React, { useState } from "react";
import { LayoutProvider, useDashboardLayout } from "./layout-context";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useDashboardLayout();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col font-sans">
      <Sidebar />
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300 max-w-[1600px] w-full mx-auto",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {children}
      </main>

      {/* Global Command Search Dialog */}
      <Dialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Quick Command Search"
        description="Search across classes, subjects, users, and quizzes"
        maxWidth="xl"
      >
        <div className="space-y-4 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:border-[#1D61D2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D61D2]/20"
              autoFocus
            />
          </div>

          <div className="text-xs text-slate-400 px-1 py-4 text-center">
            {searchQuery ? (
              <p>Searching for &quot;<span className="text-slate-700 font-semibold">{searchQuery}</span>&quot;...</p>
            ) : (
              <p>Type keywords to quickly navigate to classes, users, or subjects.</p>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
}
