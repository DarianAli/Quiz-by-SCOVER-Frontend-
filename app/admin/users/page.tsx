"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/shared/page-header";
import { UserStats } from "@/components/admin/users/user-stats";
import { UserTable } from "@/components/admin/users/user-table";
import { CreateUserDialog } from "@/components/admin/dialogs/create-user-dialog";
import { userService } from "@/services/user.service";
import { classService } from "@/services/class.service";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  // TanStack Query Data Fetching
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isRefetching: isRefetchingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: userService.getAllUsers,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["admin", "classes"],
    queryFn: classService.getAllClasses,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    refetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="User Management"
        description="Manage students, tentors, and administrators accounts, role assignments, and credentials."
        onRefresh={handleRefresh}
        onAddNew={() => setIsCreateUserOpen(true)}
        addNewLabel="Add User"
        isRefreshing={isRefetchingUsers}
      />

      {/* KPI Stats */}
      <UserStats users={users} isLoading={isLoadingUsers} />

      {/* Data Table with Filters & Search */}
      <UserTable
        users={users}
        classes={classes}
        isLoading={isLoadingUsers}
        onRefresh={handleRefresh}
        onAddNewUser={() => setIsCreateUserOpen(true)}
      />

      {/* Modal Dialog */}
      <CreateUserDialog
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        classesList={classes}
        onSubmitSuccess={handleRefresh}
      />
    </div>
  );
}
