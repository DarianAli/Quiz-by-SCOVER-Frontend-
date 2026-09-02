"use client";

import React, { useState } from "react";
import { ClassEntity } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Search, ChevronDown, ChevronUp, Eye, Edit2, Trash2, GraduationCap, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

interface ClassesTableProps {
  classes: ClassEntity[];
  isLoading?: boolean;
  onEdit?: (classData: ClassEntity) => void;
  onDelete?: (classId: number) => void;
  onView?: (classId: number) => void;
}

export function ClassesTable({
  classes = [],
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}: ClassesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"class_name" | "created_at">("class_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter
  const filteredClasses = classes.filter((c) =>
    c.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.class_program || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort
  const sortedClasses = [...filteredClasses].sort((a, b) => {
    let aVal = a[sortField] || "";
    let bVal = b[sortField] || "";
    if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.ceil(sortedClasses.length / itemsPerPage) || 1;
  const paginatedClasses = sortedClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: "class_name" | "created_at") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100/80">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1D61D2]" /> Active Classes Cohort
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage class rosters, assigned subjects, and student enrolment
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search class or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-[#1D61D2] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Datatable */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 cursor-pointer hover:text-slate-600" onClick={() => toggleSort("class_name")}>
                <div className="flex items-center gap-1">
                  <span>Class Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Program</th>
              <th className="py-3 px-3">Enrolled Students</th>
              <th className="py-3 px-3">Subjects Assigned</th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-600" onClick={() => toggleSort("created_at")}>
                <div className="flex items-center gap-1">
                  <span>Created Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Loading class records...
                </td>
              </tr>
            ) : paginatedClasses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No classes match your search query.
                </td>
              </tr>
            ) : (
              paginatedClasses.map((item, idx) => (
                <tr key={item.id ?? item.uuid ?? `class-row-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {item.class_name}
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge variant={item.class_program === "UTBK" ? "primary" : item.class_program === "SKD" ? "gold" : "outline"}>
                      {item.class_program || "GENERAL"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">
                    {item._count?.users ?? item.users?.length ?? 0} Students
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">
                    {item._count?.subjectClass ?? item.subjectClass?.length ?? 0} Subjects
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                      {onView && (
                        <button onClick={() => onView(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#1D61D2]" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit Class">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete Class">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
        <span>
          Showing {paginatedClasses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, sortedClasses.length)} of {sortedClasses.length} entries
        </span>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
