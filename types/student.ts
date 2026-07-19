/**
 * Domain types for the Student Tracking page.
 *
 * These shapes are designed to map 1:1 onto a future backend response, so the
 * dummy data in /data can be swapped for real API calls without touching any
 * component in /components/student-tracking.
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
  strongestSubject: SubjectKey;
  strongestSubjectScore: number;
  weakestSubject: SubjectKey;
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

export interface SubjectMastery {
  subject: SubjectKey;
  label: string;
  mastery: number; // 0-100
}

export interface FocusArea {
  id: string;
  topic: string;
  subject: SubjectKey;
  subjectLabel: string;
  mastery: number; // 0-100
}

export type QuizStatus = "completed" | "in_progress" | "missed";

export interface QuizAttempt {
  id: string;
  quizName: string;
  subject: SubjectKey;
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
  subjectMastery: SubjectMastery[];
  focusAreas: FocusArea[];
  recentQuizzes: QuizAttempt[];
  insights: LearningInsight[];
}

export interface ClassOverview {
  className: string;
  learnerCount: number;
  averageScore: number;
  risingCount: number;
  topPerformer: { name: string; score: number };
  atRiskCount: number;
  atRiskThreshold: number;
  longestStreak: { name: string; days: number };
  averageCompletion: number;
}

export type SortKey = "score" | "completion" | "name" | "lastActive";

export type QuickFilterKey =
  | "topScore"
  | "fastestRising"
  | "longestStreak"
  | "needsAttention"
  | "recentlyActive";
