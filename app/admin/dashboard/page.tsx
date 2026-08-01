"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { StatCards } from "@/components/admin/dashboard/stat-cards";
import { SubjectCard } from "@/components/admin/dashboard/subject-card";
import { ClassesTable } from "@/components/admin/tables/classes-table";
import { RecentUsersRoster } from "@/components/admin/dashboard/recent-users-roster";
import { CreateClassDialog } from "@/components/admin/dialogs/create-class-dialog";
import { CreateUserDialog } from "@/components/admin/dialogs/create-user-dialog";
import { CreateSubjectDialog } from "@/components/admin/dialogs/create-subject-dialog";
import { BulkImportDialog } from "@/components/admin/dialogs/bulk-import-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/dialogs/confirm-delete-dialog";
import { dashboardService } from "@/services/dashboard.service";
import { classService } from "@/services/class.service";
import { userService } from "@/services/user.service";
import { ClassEntity } from "@/types/admin";
import { Target } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  // Dialog State Management
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Delete Class state
  const [deleteClassTarget, setDeleteClassTarget] = useState<ClassEntity | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);

  // TanStack Query Data Fetching
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: dashboardService.getOverviewStats,
  });

  const { data: subjectsProgress = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["admin", "subject-progress"],
    queryFn: dashboardService.getSubjectProgressTracks,
  });

  const { data: classesList = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["admin", "classes"],
    queryFn: classService.getAllClasses,
  });

  const { data: usersList = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: userService.getAllUsers,
  });

  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  // Handle class delete confirmation
  const handleDeleteClassClick = (classId: number) => {
    const target = classesList.find((c) => c.id === classId) ?? null;
    setDeleteClassTarget(target);
  };

  const handleDeleteClassConfirm = async () => {
    if (!deleteClassTarget) return;
    setIsDeletingClass(true);
    try {
      await classService.deleteClass(deleteClassTarget.id);
      toast.success(`Class "${deleteClassTarget.class_name}" deleted successfully.`);
      setDeleteClassTarget(null);
      refreshAllData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to delete class.";
      toast.error(msg);
    } finally {
      setIsDeletingClass(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header with Welcome & Quick Actions */}
      <DashboardHeader
        adminName="Super Admin"
        onOpenCreateClass={() => setIsCreateClassOpen(true)}
        onOpenCreateUser={() => setIsCreateUserOpen(true)}
        onOpenCreateSubject={() => setIsCreateSubjectOpen(true)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
      />

      {/* High-level KPI Stat Cards */}
      <StatCards stats={stats} isLoading={isLoadingStats} />

      {/* Annual Subject Progress Grid */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-[#1D61D2]" /> Annual Subject Quiz Progress
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of completed quizzes vs annual target quota per subject
            </p>
          </div>
        </div>

        {isLoadingProgress ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : subjectsProgress.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            No subjects configured yet. Click &quot;Create Subject&quot; to set targets.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {subjectsProgress.map((sub, idx) => (
              <SubjectCard
                key={sub.id ?? sub.uuid ?? `sub-${idx}`}
                subject={sub}
                onEdit={() => setIsCreateSubjectOpen(true)}
                onDeleteSuccess={refreshAllData}
              />
            ))}
          </div>
        )}
      </section>

      {/* Main 2-Column Section: Classes Datatable & Recent Users Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Classes Table (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <ClassesTable
            classes={classesList}
            isLoading={isLoadingClasses}
            onEdit={() => setIsCreateClassOpen(true)}
            onDelete={handleDeleteClassClick}
            onView={(id) => console.log("View class", id)}
          />
        </div>

        {/* Recent Users Roster (Right column) */}
        <div className="lg:col-span-1 h-full">
          <RecentUsersRoster
            users={usersList}
            isLoading={isLoadingUsers}
            onAddUserClick={() => setIsCreateUserOpen(true)}
            onDeleteSuccess={refreshAllData}
          />
        </div>
      </div>

      {/* Interactive Modals */}
      <CreateClassDialog
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        onSubmitSuccess={refreshAllData}
      />

      <CreateUserDialog
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        classesList={classesList}
        onSubmitSuccess={refreshAllData}
      />

      <CreateSubjectDialog
        isOpen={isCreateSubjectOpen}
        onClose={() => setIsCreateSubjectOpen(false)}
        classesList={classesList}
        onSubmitSuccess={refreshAllData}
      />

      <BulkImportDialog
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />

      {/* Delete Class Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteClassTarget}
        onClose={() => setDeleteClassTarget(null)}
        onConfirm={handleDeleteClassConfirm}
        isDeleting={isDeletingClass}
        title={`Delete "${deleteClassTarget?.class_name}"?`}
        description="This will permanently remove the class and detach all enrolled students and assigned subjects. This action cannot be undone."
        confirmLabel="Delete Class"
      />
    </div>
  );
}
