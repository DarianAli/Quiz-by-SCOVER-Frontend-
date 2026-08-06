"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserEntity } from "@/types/admin";
import { toast } from "react-toastify";
import { put } from "@/lib/api-bridge";
import { KeyRound } from "lucide-react";

interface ResetPasswordDialogProps {
  user: UserEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordDialog({ user, isOpen, onClose }: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await put(`/user/password/${user.id}`, { password: newPassword });
      toast.success(`Password for ${user.full_name} updated successfully!`);
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Reset User Password"
      description={`Update security credentials for ${user?.full_name || "User"}`}
      maxWidth="md"
    >
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
          <KeyRound className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Setting a new password will instantly revoke existing sessions for this account.</span>
        </div>

        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Reset Password"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
