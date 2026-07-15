export type QuestionTypeKey =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay"
  | "matching"
  | "fill_blank";

export interface QuestionTypeTheme {
  label: string;
  description: string;
  text: string;
  iconBg: string;
  badge: string;
  selectedBorder: string;
  selectedRing: string;
  previewAccent: string; // border/accent di student preview
}

export const QUESTION_TYPE_THEME: Record<QuestionTypeKey, QuestionTypeTheme> = {
  multiple_choice: {
    label: "Multiple choice",
    description: "One correct answer out of several.",
    text: "text-blue-700",
    iconBg: "bg-gradient-to-br from-[#1D61D2] to-[#174EA6]",
    badge: "bg-blue-50 text-blue-700",
    selectedBorder: "border-blue-400",
    selectedRing: "ring-2 ring-blue-400/50",
    previewAccent: "border-l-4 border-blue-400",
  },
  true_false: {
    label: "True / False",
    description: "Quick binary check.",
    text: "text-emerald-700",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    badge: "bg-emerald-50 text-emerald-700",
    selectedBorder: "border-emerald-400",
    selectedRing: "ring-2 ring-emerald-400/50",
    previewAccent: "border-l-4 border-emerald-400",
  },
  short_answer: {
    label: "Short answer",
    description: "Open-ended text response.",
    text: "text-purple-700",
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
    badge: "bg-purple-50 text-purple-700",
    selectedBorder: "border-purple-400",
    selectedRing: "ring-2 ring-purple-400/50",
    previewAccent: "border-l-4 border-purple-400",
  },
  essay: {
    label: "Essay",
    description: "Long-form written response.",
    text: "text-orange-700",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    badge: "bg-orange-50 text-orange-700",
    selectedBorder: "border-orange-400",
    selectedRing: "ring-2 ring-orange-400/50",
    previewAccent: "border-l-4 border-orange-400",
  },
  matching: {
    label: "Matching",
    description: "Match items between two columns.",
    text: "text-pink-700",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    badge: "bg-pink-50 text-pink-700",
    selectedBorder: "border-pink-400",
    selectedRing: "ring-2 ring-pink-400/50",
    previewAccent: "border-l-4 border-pink-400",
  },
  fill_blank: {
    label: "Fill in the blank",
    description: "Complete the missing word or phrase.",
    text: "text-teal-700",
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    badge: "bg-teal-50 text-teal-700",
    selectedBorder: "border-teal-400",
    selectedRing: "ring-2 ring-teal-400/50",
    previewAccent: "border-l-4 border-teal-400",
  },
};

export function getQuestionTypeTheme(key: QuestionTypeKey): QuestionTypeTheme {
  return QUESTION_TYPE_THEME[key] ?? QUESTION_TYPE_THEME.multiple_choice;
}
