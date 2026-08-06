"use client";

import React, { useState } from "react";
import { SubjectEntity } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SearchBar } from "@/components/admin/shared/search-bar";
import { Pagination } from "@/components/admin/shared/pagination";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { ConfirmDeleteDialog } from "@/components/admin/dialogs/confirm-delete-dialog";
import { subjectService } from "@/services/subject.service";
import { ArrowUpDown, Edit2, Trash2, BookOpen, Target, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface SubjectTableProps {
  subjects: SubjectEntity[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onEdit?: (subject: SubjectEntity) => void;
  onAddNew?: () => void;
}

export function SubjectTable({
  subjects = [],
  isLoading = false,
  onRefresh,
  onEdit,
  onAddNew,
}: SubjectTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"subject_name" | "annual_quiz_target">("subject_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [deleteTarget, setDeleteTarget] = useState<SubjectEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter
  const filtered = subjects.filter((s) =>
    s.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: "subject_name" | "annual_quiz_target") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await subjectService.deleteSubject(deleteTarget.id);
      toast.success(`Subject "${deleteTarget.subject_name}" deleted.`);
      setDeleteTarget(null);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete subject");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (subjects.length === 0) {
      toast.error("No subjects to export");
      return;
    }

    const headers = ["ID,Subject Name,Annual Target,Assigned Classes,Published Quizzes,Created At"];
    const rows = subjects.map((s) =>
      [
        s.id,
        `"${s.subject_name}"`,
        s.annual_quiz_target || 40,
        s._count?.subjectClass ?? s.subjectClass?.length ?? 0,
        s._count?.quizzes ?? s.quizzes?.length ?? 0,
        s.created_at,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subjects_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${subjects.length} subject records.`);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/80 space-y-4">
      {/* Search & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search subject title..."
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-1.5 text-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Datatable */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800"
                onClick={() => toggleSort("subject_name")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Subject Title</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-800"
                onClick={() => toggleSort("annual_quiz_target")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Annual Target Quota</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3 px-4">Assigned Classes</th>
              <th className="py-3 px-4">Published Quizzes</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Loading subject curriculum...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6">
                  <EmptyState
                    title="No subjects found"
                    description="No subjects match your search. Create a new subject to set targets."
                    onAction={onAddNew}
                    actionLabel="Create Subject"
                  />
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => {
                const assignedClassesCount =
                  item._count?.subjectClass ?? item.subjectClass?.length ?? 0;
                const quizzesCount =
                  item._count?.quizzes ?? item.quizzes?.length ?? 0;

                const rowKey = item.id ?? item.uuid ?? `subject-row-${idx}`;

                return (
                  <tr key={rowKey} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">{item.subject_name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-extrabold text-slate-900">
                          {item.annual_quiz_target || 40}
                        </span>
                        <span className="text-slate-400">quizzes/yr</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="primary">{assignedClassesCount} Classes</Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="secondary">{quizzesCount} Quizzes</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sorted.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title={`Delete "${deleteTarget?.subject_name}"?`}
        description="This will permanently delete the subject and detach it from all assigned class cohorts."
        confirmLabel="Delete Subject"
      />
    </div>
  );
}
