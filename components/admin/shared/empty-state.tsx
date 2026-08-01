"use client";

import React from "react";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  icon?: React.ElementType;
}

export function EmptyState({
  title = "No data found",
  description = "No items match your criteria or no records exist yet.",
  onAction,
  actionLabel = "Add Item",
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100/80 shadow-xs my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-400">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="gap-1.5">
          <Plus className="w-4 h-4" /> {actionLabel}
        </Button>
      )}
    </div>
  );
}
