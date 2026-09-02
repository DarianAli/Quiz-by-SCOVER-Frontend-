"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ClassStats } from "@/components/admin/classes/class-stats";
import { ClassesTable } from "@/components/admin/tables/classes-table";
import { CreateClassDialog } from "@/components/admin/dialogs/create-class-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/dialogs/confirm-delete-dialog";
import { classService } from "@/services/class.service";
import { ClassEntity } from "@/types/admin";
import { toast } from "react-toastify";

export default function AdminClassesPage() {
  const queryClient = useQueryClient();
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ClassEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // TanStack Query Data Fetching
  const {
    data: classes = [],
    isLoading: isLoadingClasses,
    isRefetching: isRefetchingClasses,
    refetch: refetchClasses,
  } = useQuery({
    queryKey: ["admin", "classes"],
    queryFn: classService.getAllClasses,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "classes"] });
    refetchClasses();
  };

  const handleDeleteClick = (classId: number) => {
    const target = classes.find((c) => c.id === classId) || null;
    setDeleteTarget(target);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await classService.deleteClass(deleteTarget.id);
      toast.success(`Class "${deleteTarget.class_name}" deleted.`);
      setDeleteTarget(null);
      handleRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete class");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportClasses = () => {
    if (classes.length === 0) {
      toast.error("No classes to export");
      return;
    }

    const headers = ["ID,Class Name,Program,Students Count,Subjects Count,Created At"];
    const rows = classes.map((c) =>
      [
        c.id,
        `"${c.class_name}"`,
        `"${c.class_program || "GENERAL"}"`,
        c._count?.users ?? c.users?.length ?? 0,
        c._count?.subjectClass ?? c.subjectClass?.length ?? 0,
        c.created_at,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `classes_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${classes.length} class records to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Class Cohorts Management"
        description="Manage active student learning cohorts, program tracks (UTBK, SKD, GENERAL), and curriculum links."
        onRefresh={handleRefresh}
        onAddNew={() => setIsCreateClassOpen(true)}
        addNewLabel="Create Class"
        onExport={handleExportClasses}
        isRefreshing={isRefetchingClasses}
      />

      {/* KPI Stats */}
      <ClassStats classes={classes} isLoading={isLoadingClasses} />

      {/* Datatable */}
      <ClassesTable
        classes={classes}
        isLoading={isLoadingClasses}
        onEdit={() => setIsCreateClassOpen(true)}
        onDelete={handleDeleteClick}
      />

      {/* Modals */}
      <CreateClassDialog
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        onSubmitSuccess={handleRefresh}
      />

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title={`Delete "${deleteTarget?.class_name}"?`}
        description="This will permanently delete the class cohort and unassign all enrolled students."
        confirmLabel="Delete Class"
      />
    </div>
  );
}
