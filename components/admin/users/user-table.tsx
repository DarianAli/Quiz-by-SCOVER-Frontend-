"use client";

import React, { useState } from "react";
import { UserEntity, ClassEntity, Role } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  KeyRound,
  Download,
  CheckSquare,
  Square,
  Shield,
  GraduationCap,
  Award,
} from "lucide-react";
import { SearchBar } from "@/components/admin/shared/search-bar";
import { Pagination } from "@/components/admin/shared/pagination";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { ConfirmDeleteDialog } from "@/components/admin/dialogs/confirm-delete-dialog";
import { ResetPasswordDialog } from "@/components/admin/dialogs/reset-password-dialog";
import { userService } from "@/services/user.service";
import { toast } from "react-toastify";

interface UserTableProps {
  users: UserEntity[];
  classes: ClassEntity[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddNewUser?: () => void;
}

export function UserTable({
  users = [],
  classes = [],
  isLoading = false,
  onRefresh,
  onAddNewUser,
}: UserTableProps) {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"full_name" | "created_at">("full_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Dialog States
  const [deleteTarget, setDeleteTarget] = useState<UserEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserEntity | null>(null);

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesClass =
      classFilter === "ALL" ||
      (classFilter === "UNASSIGNED" ? !u.classId : u.classId === parseInt(classFilter, 10));

    return matchesSearch && matchesRole && matchesClass;
  });

  // Sort Logic
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // Pagination Slice
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: "full_name" | "created_at") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedUsers.map((u) => u.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Delete
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(deleteTarget.id);
      toast.success(`User "${deleteTarget.full_name}" deleted.`);
      setDeleteTarget(null);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => userService.deleteUser(id)));
      toast.success(`Successfully deleted ${selectedIds.length} users.`);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      onRefresh?.();
    } catch (err: any) {
      toast.error("Failed to complete bulk delete operation.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk Export CSV
  const handleBulkExport = () => {
    const targets = selectedIds.length > 0
      ? users.filter((u) => selectedIds.includes(u.id))
      : sortedUsers;

    if (targets.length === 0) {
      toast.error("No users to export");
      return;
    }

    const headers = ["ID,Username,Full Name,Email,Role,Class,Phone Number,Created At"];
    const rows = targets.map((u) =>
      [
        u.id,
        `"${u.userName}"`,
        `"${u.full_name}"`,
        `"${u.email}"`,
        u.role,
        `"${u.class?.class_name || "Unassigned"}"`,
        `"${u.phone_number || "-"}"`,
        u.created_at,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targets.length} user records to CSV.`);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100/80 space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search by name, username, or email..."
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students Only</option>
              <option value="TENTOR">Tentors Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
            className="gap-1.5 text-xs"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>

          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="gap-1.5 text-xs animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-3.5 w-10">
                <button
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {selectedIds.length > 0 && selectedIds.length === paginatedUsers.length ? (
                    <CheckSquare className="w-4 h-4 text-[#1D61D2]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-800"
                onClick={() => toggleSort("full_name")}
              >
                <div className="flex items-center gap-1.5">
                  <span>User Details</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3 px-3.5">Role</th>
              <th className="py-3 px-3.5">Assigned Class</th>
              <th className="py-3 px-3.5">Contact</th>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-800"
                onClick={() => toggleSort("created_at")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Joined Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Loading user roster...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6">
                  <EmptyState
                    title="No users match search criteria"
                    description="Try adjusting your role or class filters to see more account records."
                    onAction={onAddNewUser}
                    actionLabel="Add New User"
                  />
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, idx) => {
                const isSelected = selectedIds.includes(user.id);
                const initials = user.full_name
                  ? user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "US";

                const userKey = user.id ?? user.uuid ?? `user-row-${idx}`;

                return (
                  <tr
                    key={userKey}
                    className={`transition-colors group hover:bg-slate-50/80 ${
                      isSelected ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <td className="py-3.5 px-3.5">
                      <button
                        onClick={() => toggleSelectOne(user.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#1D61D2]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-3">
                        {user.photoProfile ? (
                          <img
                            src={user.photoProfile}
                            alt={user.full_name}
                            className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-[#1D61D2]/10 text-[#1D61D2] font-bold text-xs flex items-center justify-center ring-1 ring-[#1D61D2]/20">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{user.full_name}</p>
                          <p className="text-[11px] text-slate-400">
                            @{user.userName} • {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <Badge
                        variant={
                          user.role === "STUDENT"
                            ? "primary"
                            : user.role === "TENTOR"
                            ? "gold"
                            : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3.5">
                      {user.class ? (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {user.class.class_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3.5 text-slate-600 font-medium">
                      {user.phone_number || "-"}
                    </td>

                    <td className="py-3.5 px-3.5 text-slate-500">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="py-3.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => setResetPasswordTarget(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete User"
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

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        isDeleting={isDeleting}
        title={`Delete "${deleteTarget?.full_name}"?`}
        description="This will permanently delete the user account and remove their access. This action cannot be undone."
        confirmLabel="Delete Account"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
        title={`Delete ${selectedIds.length} Selected Users?`}
        description="Are you sure you want to delete all selected accounts? This action cannot be reverted."
        confirmLabel={`Delete (${selectedIds.length}) Accounts`}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        user={resetPasswordTarget}
        isOpen={!!resetPasswordTarget}
        onClose={() => setResetPasswordTarget(null)}
      />
    </div>
  );
}
