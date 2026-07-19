import type {
  FocusArea,
  LearningInsight,
  PerformanceHistory,
  QuizAttempt,
  StudentDetailBundle,
  SubjectMastery,
} from "@/types/student";
import { students } from "./students";

function performanceFor(base: number): PerformanceHistory["weekly"] {
  return [0, 1, 2, 3, 4, 5].map((i) => ({
    label: `Week ${i + 1}`,
    score: Math.max(40, Math.min(100, base - 10 + i * 2 + (i % 2 === 0 ? 2 : -1))),
  }));
}

function buildBundle(
  studentId: string,
  base: number,
  mastery: SubjectMastery[],
  focusAreas: FocusArea[],
  quizzes: QuizAttempt[],
  insights: LearningInsight[]
): StudentDetailBundle {
  const student = students.find((s) => s.id === studentId);
  if (!student) {
    throw new Error(`Unknown student id: ${studentId}`);
  }
  const weekly = performanceFor(base);
  return {
    student,
    performance: {
      studentId,
      weekly,
      monthly: [
        { label: "Jan", score: base - 12 },
        { label: "Feb", score: base - 8 },
        { label: "Mar", score: base - 4 },
        { label: "Apr", score: base - 2 },
        { label: "May", score: base + 1 },
        { label: "Jun", score: base + 3 },
      ],
      semester: [
        { label: "Sem 1", score: base - 10 },
        { label: "Sem 2", score: base + 2 },
      ],
    },
    subjectMastery: mastery,
    focusAreas,
    recentQuizzes: quizzes,
    insights,
  };
}

export const studentDetails: Record<string, StudentDetailBundle> = {
  s1: buildBundle(
    "s1",
    92,
    [
      { subject: "math", label: "Algebra", mastery: 94 },
      { subject: "math", label: "Geometry", mastery: 71 },
      { subject: "biology", label: "Genetics", mastery: 88 },
      { subject: "physics", label: "Physics", mastery: 82 },
    ],
    [
      { id: "f1", topic: "Circle theorems", subject: "math", subjectLabel: "Geometry", mastery: 48 },
      { id: "f2", topic: "3D coordinate geometry", subject: "math", subjectLabel: "Geometry", mastery: 55 },
      { id: "f3", topic: "Punnett squares", subject: "biology", subjectLabel: "Genetics", mastery: 68 },
    ],
    [
      { id: "q1", quizName: "Quadratic Equations", subject: "math", date: "2026-07-15T09:00:00.000Z", score: 96, status: "completed" },
      { id: "q2", quizName: "Angle Chasing", subject: "math", date: "2026-07-13T09:00:00.000Z", score: 64, status: "completed" },
      { id: "q3", quizName: "Cell Division", subject: "biology", date: "2026-07-10T09:00:00.000Z", score: 88, status: "completed" },
      { id: "q4", quizName: "Newton's Laws", subject: "physics", date: "2026-07-08T09:00:00.000Z", score: 79, status: "completed" },
    ],
    [
      { id: "i1", kind: "improvement", text: "Student has improved {h} during the last month.", highlight: "12%" },
      { id: "i2", kind: "weakness", text: "Geometry remains the weakest topic." },
      { id: "i3", kind: "recommendation", text: "Recommended: assign {h} to reinforce circle theorems.", highlight: "2 Geometry quizzes" },
    ]
  ),
  s4: buildBundle(
    "s4",
    63,
    [
      { subject: "math", label: "Algebra", mastery: 51 },
      { subject: "history", label: "Modern History", mastery: 77 },
      { subject: "physics", label: "Mechanics", mastery: 58 },
    ],
    [
      { id: "f4", topic: "Linear equations", subject: "math", subjectLabel: "Algebra", mastery: 42 },
      { id: "f5", topic: "Force & motion", subject: "physics", subjectLabel: "Mechanics", mastery: 50 },
      { id: "f6", topic: "Fractions", subject: "math", subjectLabel: "Algebra", mastery: 55 },
    ],
    [
      { id: "q5", quizName: "Linear Equations Quiz", subject: "math", date: "2026-07-14T09:00:00.000Z", score: 46, status: "completed" },
      { id: "q6", quizName: "Force & Motion", subject: "physics", date: "2026-07-11T09:00:00.000Z", score: null, status: "missed" },
      { id: "q7", quizName: "World War II Timeline", subject: "history", date: "2026-07-09T09:00:00.000Z", score: 81, status: "completed" },
    ],
    [
      { id: "i4", kind: "weakness", text: "Score has dropped {h} over the last month.", highlight: "8%" },
      { id: "i5", kind: "weakness", text: "Algebra remains the weakest topic, with two missed quizzes." },
      { id: "i6", kind: "recommendation", text: "Recommended: schedule a 1:1 check-in and assign {h}.", highlight: "remedial Algebra practice" },
    ]
  ),
};

export function getStudentDetail(studentId: string): StudentDetailBundle {
  return (
    studentDetails[studentId] ??
    buildBundle(
      studentId,
      students.find((s) => s.id === studentId)?.averageScore ?? 75,
      [
        { subject: "math", label: "Algebra", mastery: 80 },
        { subject: "biology", label: "Biology", mastery: 75 },
        { subject: "physics", label: "Physics", mastery: 70 },
      ],
      [
        { id: `${studentId}-f1`, topic: "Topic review needed", subject: "math", subjectLabel: "Algebra", mastery: 60 },
      ],
      [
        { id: `${studentId}-q1`, quizName: "Recent Quiz", subject: "math", date: "2026-07-14T09:00:00.000Z", score: 75, status: "completed" },
      ],
      [
        { id: `${studentId}-i1`, kind: "recommendation", text: "No detailed insights yet — assign a quiz to generate them." },
      ]
    )
  );
}
