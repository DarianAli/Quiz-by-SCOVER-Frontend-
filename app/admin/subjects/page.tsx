"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SubjectStats } from "@/components/admin/subjects/subject-stats";
import { SubjectTable } from "@/components/admin/subjects/subject-table";
import { CreateSubjectDialog } from "@/components/admin/dialogs/create-subject-dialog";
import { subjectService } from "@/services/subject.service";
import { classService } from "@/services/class.service";
import { SubjectEntity } from "@/types/admin";
import { toast } from "react-toastify";

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);

  // TanStack Query Fetching
  const {
    data: subjects = [],
    isLoading: isLoadingSubjects,
    isRefetching: isRefetchingSubjects,
    refetch: refetchSubjects,
  } = useQuery({
    queryKey: ["admin", "subjects"],
    queryFn: subjectService.getAllSubjects,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["admin", "classes"],
    queryFn: classService.getAllClasses,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "subjects"] });
    refetchSubjects();
  };

  const handleExportSubjects = () => {
    if (subjects.length === 0) {
      toast.error("No subjects to export");
      return;
    }

    const headers = ["ID,Subject Name,Annual Target Quota,Created At"];
    const rows = subjects.map((s) =>
      [s.id, `"${s.subject_name}"`, s.annual_quiz_target || 40, s.created_at].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subjects_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${subjects.length} subject records to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Subject Curriculum Management"
        description="Configure academic subjects, annual quiz targets, and class cohort assignments."
        onRefresh={handleRefresh}
        onAddNew={() => setIsCreateSubjectOpen(true)}
        addNewLabel="Create Subject"
        onExport={handleExportSubjects}
        isRefreshing={isRefetchingSubjects}
      />

      {/* KPI Stats */}
      <SubjectStats subjects={subjects} isLoading={isLoadingSubjects} />

      {/* Datatable */}
      <SubjectTable
        subjects={subjects}
        isLoading={isLoadingSubjects}
        onRefresh={handleRefresh}
        onEdit={() => setIsCreateSubjectOpen(true)}
        onAddNew={() => setIsCreateSubjectOpen(true)}
      />

      {/* Dialog */}
      <CreateSubjectDialog
        isOpen={isCreateSubjectOpen}
        onClose={() => setIsCreateSubjectOpen(false)}
        classesList={classes}
        onSubmitSuccess={handleRefresh}
      />
    </div>
  );
}
