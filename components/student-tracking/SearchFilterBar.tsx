"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import type { QuickFilterKey, SortKey } from "@/types/student"
import { classList } from "@/constants/dummy/students"
import { cn } from "@/lib/student/cn"

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  classId: string;
  onClassChange: (value: string) => void;
  sortKey: SortKey;
  onSortChange: (value: SortKey) => void;
  quickFilter: QuickFilterKey | null;
  onQuickFilterChange: (value: QuickFilterKey | null) => void;
}

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "score", label: "Score" },
  { key: "completion", label: "Completion" },
  { key: "name", label: "Name" },
  { key: "lastActive", label: "Last active" },
];

const QUICK_FILTERS: Array<{ key: QuickFilterKey; label: string }> = [
  { key: "topScore", label: "Top score" },
  { key: "fastestRising", label: "Fastest rising" },
  { key: "longestStreak", label: "Longest streak" },
  { key: "needsAttention", label: "Needs attention" },
  { key: "recentlyActive", label: "Recently active" },
];

export function SearchFilterBar({
  search,
  onSearchChange,
  classId,
  onClassChange,
  sortKey,
  onSortChange,
  quickFilter,
  onQuickFilterChange,
}: SearchFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search students</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus-visible:border-[#0D4669] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#0D4669]/20"
          />
        </label>

        <label className="relative sm:w-40">
          <span className="sr-only">Filter by class</span>
          <select
            value={classId}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition-colors focus-visible:border-[#0D4669] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#0D4669]/20"
          >
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Quick filters"
          className="flex flex-wrap gap-1.5"
        >
          {QUICK_FILTERS.map((filter) => {
            const active = quickFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onQuickFilterChange(active ? null : filter.key)
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D4669]/30",
                  active
                    ? "bg-[#0D4669] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <label className="relative hidden shrink-0 sm:block">
          <span className="sr-only">Sort by</span>
          <SlidersHorizontal
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="appearance-none rounded-full border border-slate-200 bg-white py-1.5 pl-7 pr-6 text-xs font-medium text-slate-600 outline-none transition-colors focus-visible:border-[#0D4669] focus-visible:ring-2 focus-visible:ring-[#0D4669]/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                Sort by {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
