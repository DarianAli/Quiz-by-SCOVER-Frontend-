"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Download, Upload } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  onImport?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
}

export function PageHeader({
  title,
  description,
  onRefresh,
  onAddNew,
  addNewLabel = "Add New",
  onImport,
  onExport,
  isRefreshing = false,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-1.5 text-slate-600"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#1D61D2]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        {onImport && (
          <Button variant="outline" size="sm" onClick={onImport} className="gap-1.5 text-slate-600">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5 text-slate-600">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        {onAddNew && (
          <Button variant="primary" size="sm" onClick={onAddNew} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>{addNewLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
