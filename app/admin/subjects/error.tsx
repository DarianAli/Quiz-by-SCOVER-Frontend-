"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function SubjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-rose-500" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Failed to load subjects</h2>
        <p className="text-sm text-slate-500 max-w-sm">{error.message || "An unexpected error occurred while fetching curriculum subjects."}</p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D61D2] text-white text-sm font-semibold hover:bg-[#174EA6] transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}
