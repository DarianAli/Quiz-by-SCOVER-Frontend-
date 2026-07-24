"use client"

import { useMemo, useState } from "react"
import type {
    QuickFilterKey,
    Student,
    SortKey,
} from "@/types/student"
import { StudentCard } from "./StudentCard"
import { SearchFilterBar } from "./SearchFilterBar"

interface StudentListProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
}

function applyQuickFilter(students: Student[], filter: QuickFilterKey | null): Student[] {
  switch (filter) {
    case "topScore":
      return [...students].sort((a, b) => b.averageScore - a.averageScore).slice(0, 5);
    case "fastestRising":
      return students.filter((s) => s.trend.direction === "up");
    case "longestStreak":
      return [...students].sort((a, b) => b.streakDays - a.streakDays).slice(0, 5);
    case "needsAttention":
      return students.filter((s) => s.atRisk || s.trend.direction === "down");
    case "recentlyActive":
      return [...students].sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      );
    default:
      return students;
  }
}

function sortStudents(students: Student[], sortKey: SortKey): Student[] {
  const copy = [...students];
  switch (sortKey) {
    case "score":
      return copy.sort((a, b) => b.averageScore - a.averageScore);
    case "completion":
      return copy.sort((a, b) => b.completionRate - a.completionRate);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "lastActive":
      return copy.sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      );
  }
}

export function StudentList({
  students,
  selectedStudentId,
  onSelectStudent,
}: StudentListProps) {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey | null>(null);

  const classList = useMemo(() => {
    const classes = new Map<string, string>();
    students.forEach((s) => {
      // If student doesn't have className, fallback to classId
      classes.set(s.classId, (s as any).className || s.classId);
    });
    const list = Array.from(classes.entries()).map(([id, label]) => ({ id, label }));
    list.unshift({ id: "all", label: "All Classes" });
    return list;
  }, [students]);

  const filtered = useMemo(() => {
    let result = students;

    if (classId !== "all") {
      result = result.filter((s) => s.classId === classId);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    result = applyQuickFilter(result, quickFilter);
    return sortStudents(result, sortKey);
  }, [students, classId, search, quickFilter, sortKey]);

  return (
    <section
      aria-label="Learners"
      className="animate-fade-slide-up flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-slate-900">Learners</h2>
        <span className="text-xs font-medium text-slate-400">
          {filtered.length} of {students.length} students
        </span>
      </div>

      <div className="mb-4">
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          classId={classId}
          onClassChange={setClassId}
          classList={classList}
          sortKey={sortKey}
          onSortChange={setSortKey}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
        />
      </div>

      <ul className="flex flex-col gap-2 overflow-y-auto pr-1" role="list">
        {filtered.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            No students match these filters.
          </li>
        )}
        {filtered.map((student) => (
          <li key={student.id}>
            <StudentCard
              student={student}
              selected={student.id === selectedStudentId}
              onSelect={onSelectStudent}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
