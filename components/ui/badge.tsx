import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "gold" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const variants = {
    primary: "bg-[#1D61D2]/10 text-[#1D61D2] border border-[#1D61D2]/20",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    gold: "bg-[#F4C430]/20 text-amber-900 border border-[#F4C430]/40 font-semibold",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 font-medium",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 font-medium",
    outline: "bg-transparent text-slate-700 border border-slate-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
