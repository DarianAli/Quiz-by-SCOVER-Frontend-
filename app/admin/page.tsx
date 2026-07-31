"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { StatCards } from "@/components/admin/dashboard/stat-cards";
import { SubjectCard } from "@/components/admin/dashboard/subject-card";
import { ClassesTable } from "@/components/admin/tables/classes-table";
import { RecentUsersRoster } from "@/components/admin/dashboard/recent-users-roster";
import { CreateClassDialog } from "@/components/admin/dialogs/create-class-dialog";
import { CreateUserDialog } from "@/components/admin/dialogs/create-user-dialog";
import { CreateSubjectDialog } from "@/components/admin/dialogs/create-subject-dialog";
import { BulkImportDialog } from "@/components/admin/dialogs/bulk-import-dialog";
import { dashboardService } from "@/services/dashboard.service";
import { classService } from "@/services/class.service";
import { userService } from "@/services/user.service";
import { Target, Layers } from "lucide-react";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  // Dialog State Management
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

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

  return (
    <DashboardLayout>
      {/* Step 5: Dashboard Header with Welcome & Quick Actions */}
      <DashboardHeader
        adminName="Super Admin"
        onOpenCreateClass={() => setIsCreateClassOpen(true)}
        onOpenCreateUser={() => setIsCreateUserOpen(true)}
        onOpenCreateSubject={() => setIsCreateSubjectOpen(true)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
      />

      {/* Step 5: High-level KPI Stat Cards */}
      <StatCards stats={stats} isLoading={isLoadingStats} />

      {/* Feature 4: Annual Subject Progress Grid */}
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
            {subjectsProgress.map((sub) => (
              <SubjectCard
                key={sub.id}
                subject={sub}
                onEdit={() => setIsCreateSubjectOpen(true)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Main 2-Column Section: Classes Datatable & Recent Users Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Feature 6: Classes Table (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <ClassesTable
            classes={classesList}
            isLoading={isLoadingClasses}
            onEdit={() => setIsCreateClassOpen(true)}
            onDelete={(id) => console.log("Delete class", id)}
            onView={(id) => console.log("View class", id)}
          />
        </div>

        {/* Feature 7: Recent Users Roster (Right column) */}
        <div className="lg:col-span-1 h-full">
          <RecentUsersRoster
            users={usersList}
            isLoading={isLoadingUsers}
            onAddUserClick={() => setIsCreateUserOpen(true)}
          />
        </div>
      </div>

      {/* Step 7: Interactive Modals */}
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
    </DashboardLayout>
  );
}
