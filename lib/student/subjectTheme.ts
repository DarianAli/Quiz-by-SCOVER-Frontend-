/**
 * ⚠️ STUB — REPLACE WITH YOUR EXISTING IMPLEMENTATION
 * ----------------------------------------------------
 * Your project already has a dynamic subject theme system. Delete this file
 * and point the import in every component below to your real module, e.g.:
 *
 *   import { getSubjectTheme } from "@/lib/theme/subject";
 *
 * The shape below is inferred from your brief (theme.button, theme.badge,
 * theme.text, theme.iconBg, theme.previewAccent) so the components compile
 * and render correctly until you swap this out. Nothing in /components
 * hardcodes a color — every subject color flows through getSubjectTheme().
 */

import type { SubjectKey } from "@/types/student";

export interface SubjectTheme {
  /** Classes for a solid/tonal button in this subject's color */
  button: string;
  /** Classes for a small pill/badge */
  badge: string;
  /** Text color class */
  text: string;
  /** Background for an icon chip */
  iconBg: string;
  /** Used for chart strokes/fills and progress bars (hex, for inline SVG/Recharts) */
  previewAccent: string;
  /** Human-readable label */
  label: string;
}

const THEME_MAP: Record<SubjectKey, SubjectTheme> = {
  math: {
    button: "bg-[#0D4669] text-white hover:bg-[#0D4669]/90",
    badge: "bg-[#0D4669]/10 text-[#0D4669]",
    text: "text-[#0D4669]",
    iconBg: "bg-[#0D4669]",
    previewAccent: "#0D4669",
    label: "Math",
  },
  biology: {
    button: "bg-emerald-600 text-white hover:bg-emerald-600/90",
    badge: "bg-emerald-50 text-emerald-700",
    text: "text-emerald-700",
    iconBg: "bg-emerald-600",
    previewAccent: "#059669",
    label: "Biology",
  },
  physics: {
    button: "bg-indigo-600 text-white hover:bg-indigo-600/90",
    badge: "bg-indigo-50 text-indigo-700",
    text: "text-indigo-700",
    iconBg: "bg-indigo-600",
    previewAccent: "#4f46e5",
    label: "Physics",
  },
  chemistry: {
    button: "bg-pink-600 text-white hover:bg-pink-600/90",
    badge: "bg-pink-50 text-pink-700",
    text: "text-pink-700",
    iconBg: "bg-pink-600",
    previewAccent: "#db2777",
    label: "Chemistry",
  },
  history: {
    button: "bg-amber-600 text-white hover:bg-amber-600/90",
    badge: "bg-amber-50 text-amber-700",
    text: "text-amber-700",
    iconBg: "bg-amber-600",
    previewAccent: "#d97706",
    label: "History",
  },
};

export function getSubjectTheme(subject: SubjectKey): SubjectTheme {
  return THEME_MAP[subject];
}
