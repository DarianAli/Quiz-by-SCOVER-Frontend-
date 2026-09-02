"use client";

import React, { useState } from "react";
import { UserEntity } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { UserPlus, Users, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConfirmDeleteDialog } from "@/components/admin/dialogs/confirm-delete-dialog";
import { userService } from "@/services/user.service";
import { toast } from "react-toastify";

interface RecentUsersRosterProps {
  users?: UserEntity[];
  isLoading?: boolean;
  onAddUserClick?: () => void;
  onDeleteSuccess?: () => void;
}

export function RecentUsersRoster({
  users = [],
  isLoading = false,
  onAddUserClick,
  onDeleteSuccess,
}: RecentUsersRosterProps) {
  const [deleteTarget, setDeleteTarget] = useState<UserEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(deleteTarget.id);
      toast.success(`User "${deleteTarget.full_name}" deleted successfully.`);
      setDeleteTarget(null);
      onDeleteSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to delete user.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100/80 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1D61D2]" /> Recent Registrations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Newly onboarded students &amp; tentors</p>
          </div>

          {onAddUserClick && (
            <Button variant="outline" size="sm" onClick={onAddUserClick} className="gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Add
            </Button>
          )}
        </div>

        {/* User List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No recent users found.
            </div>
          ) : (
            users.slice(0, 5).map((user) => {
              const initials = user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/60 group"
                >
                  <div className="flex items-center gap-3">
                    {user.photoProfile ? (
                      <img
                        src={user.photoProfile}
                        alt={user.full_name}
                        className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-xl bg-[#1D61D2]/10 text-[#1D61D2] font-bold text-xs flex items-center justify-center ring-1 ring-[#1D61D2]/20">
                        {initials || "US"}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {user.full_name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
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
                      <span className="text-[9px] text-slate-400">
                        {formatDate(user.created_at)}
                      </span>
                    </div>

                    {/* Delete button — visible on hover */}
                    <button
                      onClick={() => setDeleteTarget(user)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                      title="Delete user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer View All Link */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        <a
          href="/admin/users"
          className="text-xs font-bold text-[#1D61D2] hover:underline flex items-center justify-center gap-1 group"
        >
          View All Users Roster <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Confirm delete — uses fixed positioning so nesting here is safe */}
      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={`Delete "${deleteTarget?.full_name}"?`}
        description="This will permanently remove the user account. This action cannot be undone."
        confirmLabel="Delete User"
      />
    </div>
  );
}
