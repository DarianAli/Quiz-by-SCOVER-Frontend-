/**
 * Domain types for the Student Tracking page.
 *
 * These shapes are designed to map 1:1 onto the backend response,
 * so API calls can be made without touching any component.
 *
 * ──────────────────────────────────────────────────────────────────
 * IMPORTANT: Module is now the primary learning unit.
 * SubjectMastery is kept for backward compatibility but
 * ModuleMastery is the canonical type going forward.
 * ──────────────────────────────────────────────────────────────────
 */

export type SubjectKey =
  | "math"
  | "biology"
  | "physics"
  | "chemistry"
  | "history";

export interface Trend {
  /** Percentage delta vs. the previous period, e.g. 6 for "+6%" */
  value: number;
  direction: "up" | "down" | "flat";
}

export interface SparklinePoint {
  label: string;
  value: number;
}

export interface Student {
  id: string;
  name: string;
  avatarInitials: string;
  /** Optional avatar image URL. Falls back to avatarInitials when absent. */
  avatarUrl?: string;
  className: string;
  classId: string;
  lastActiveAt: string; // ISO timestamp
  averageScore: number; // 0-100
  completionRate: number; // 0-100
  streakDays: number;
  trend: Trend;
  sparkline: SparklinePoint[];
  strongestSubject: string; // module_name or subject key
  strongestSubjectScore: number;
  weakestSubject: string;   // module_name or subject key
  weakestSubjectScore: number;
  atRisk: boolean;
  email: string;
}

export type PerformancePeriod = "weekly" | "monthly" | "semester";

export interface PerformancePoint {
  label: string; // e.g. "Week 1", "Jan", "Sem 1"
  score: number;
}

export interface PerformanceHistory {
  studentId: string;
  weekly: PerformancePoint[];
  monthly: PerformancePoint[];
  semester: PerformancePoint[];
}

/**
 * Module mastery — primary unit for learning progress tracking.
 * Maps 1:1 to `moduleMasteryRaw` from tentor.service.ts
 */
export interface ModuleMastery {
  /** Unique key — use module_name or uuid */
  subject: string;
  /** Display label: "Subject - Module" format */
  label: string;
  /** Completion percentage 0-100 */
  mastery: number;
  /** Average score across completed quizzes (0 if none) */
  average_score: number;
  /** Number of quizzes completed in this module */
  completed: number;
  /** Total quizzes in this module */
  total: number;
  /** Subject name this module belongs to */
  subject_name: string;
  /** Module name */
  module_name: string;
}

/**
 * @deprecated Use ModuleMastery instead.
 * Kept for backward compatibility with SubjectPerformance component.
 */
export interface SubjectMastery {
  subject: string;
  label: string;
  mastery: number;
  average_score?: number;
  completed?: number;
  total?: number;
  subject_name?: string;
  module_name?: string;
}

export interface FocusArea {
  id: string;
  topic: string;
  subject: string;
  subjectLabel: string;
  mastery: number; // 0-100
}

export type QuizStatus = "completed" | "in_progress" | "missed";

export interface QuizAttempt {
  id: string;
  quizName: string;
  subject: string; // can be subject name or SubjectKey
  date: string; // ISO timestamp
  score: number | null; // null when missed
  status: QuizStatus;
}

export interface LearningInsight {
  id: string;
  kind: "improvement" | "weakness" | "recommendation";
  text: string;
  highlight?: string;
}

export interface StudentDetailBundle {
  student: Student;
  performance: PerformanceHistory;
  /** Module mastery list — primary learning unit */
  subjectMastery: ModuleMastery[];
  focusAreas: FocusArea[];
  recentQuizzes: QuizAttempt[];
  insights: LearningInsight[];
}

export interface ClassOverview {
  /** @alias totalStudents — use this field */
  totalStudents: number;
  className: string;
  averageScore: number;
  risingCount: number;
  topPerformer: { name: string; score: number };
  atRiskCount: number;
  atRiskThreshold: number;
  longestStreak: { name: string; days: number };
  averageCompletion: number;
  needsAttention: number;
  totalQuizzes: number;
  activeQuizzes: number;
}

export type SortKey = "score" | "completion" | "name" | "lastActive";

export type QuickFilterKey =
  | "topScore"
  | "fastestRising"
  | "longestStreak"
  | "needsAttention"
  | "recentlyActive";
