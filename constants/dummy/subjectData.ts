// Dummy data — struktur mengikuti schema Prisma yang sudah ada,
// dengan tambahan `classId` pada quiz dan `theme` pada subject.
// Ganti isi getQuizzes/getQuizById/addQuiz/updateQuiz dengan fetch ke
// API begitu backend siap — bentuk objeknya sengaja dibuat identik
// dengan payload REST yang akan dikembalikan Prisma.
//
// CHANGELOG (redesign):
// - QuestionItem sekarang punya `question_type` — persisten, bukan lagi
//   di-infer dari isi options. Wajib diisi tiap kali membuat QuestionItem.
// - QuestionItem juga punya `tag`, `explanation`, `pairs` (opsional) supaya
//   data yang diisi lewat QuestionEditorLive tidak hilang saat disimpan.
// - `MatchingPair` dipindah ke sini (dari types/questions.ts) supaya
//   QuestionItem bisa mereferensikannya tanpa circular import. Tetap
//   di-re-export dari types/questions.ts supaya import lama tidak rusak.

import type { SubjectThemeKey } from "@/lib/theme/subject-themes"
import type { QuestionTypeKey } from "@/lib/theme/question-type-themes"

export type Difficulty = "EASY" | "MEDIUM" | "HARD"
export type QuizStatus = "INCOMPLETED" | "COMPLETED" // draft vs published di level UI

export interface ClassItem {
  idClass: number
  class_name: string
}

export interface SubjectItem {
  idSubject: number
  subject_name: string
  theme: SubjectThemeKey // <-- field baru: dipakai theme engine di seluruh UI
}

export interface SubjectClassLink {
  subjectId: number
  classId: number
}

export interface OptionItem {
  idOption: number
  option_text: string
  option_image: string
  is_correct: boolean
}

export interface MatchingPair {
  id: number
  left: string
  right: string
}

export interface QuestionItem {
  idQuestion: number
  question_text: string
  question_image: string
  question_type: QuestionTypeKey
  difficulty: Difficulty
  poin: number
  tag?: string
  explanation?: string
  options: OptionItem[]
  pairs?: MatchingPair[] // hanya relevan saat question_type === "matching"
}

export interface QuizItem {
  idQuiz: number
  quiz_title: string
  duration: number // minutes
  status: QuizStatus
  difficulty: Difficulty
  subjectId: number
  classId: number
  questions: QuestionItem[]
  updated_at: string
}

export const dummyClasses: ClassItem[] = [
  { idClass: 1, class_name: "XII Mathematics" },
  { idClass: 2, class_name: "XII Biology" },
  { idClass: 3, class_name: "XI Mathematics" },
]

export const dummySubjects: SubjectItem[] = [
  { idSubject: 1, subject_name: "Algebra", theme: "math" },
  { idSubject: 2, subject_name: "Geometry", theme: "geometry" },
  { idSubject: 3, subject_name: "Genetics", theme: "genetics" },
]

export const dummySubjectClass: SubjectClassLink[] = [
  { subjectId: 1, classId: 1 },
  { subjectId: 2, classId: 1 },
  { subjectId: 1, classId: 3 },
  { subjectId: 3, classId: 2 },
]

// Dipertahankan untuk kompatibilitas kalau masih ada yang memakainya di tempat lain —
// tapi SubjectCard yang baru sudah mengambil warna dari SUBJECT_THEME, bukan dari sini lagi.
export const subjectCardPalette = [
  { bg: "bg-blue-50", accent: "bg-blue-600", text: "text-blue-900" },
  { bg: "bg-pink-50", accent: "bg-pink-600", text: "text-pink-900" },
  { bg: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  { bg: "bg-amber-50", accent: "bg-amber-600", text: "text-amber-900" },
]

/** Lookup cepat: dapatkan theme key milik sebuah subject dari id-nya. */
export function getSubjectThemeKey(subjectId: number): SubjectThemeKey {
  return dummySubjects.find((s) => s.idSubject === subjectId)?.theme ?? "math"
}

// ─────────────────────────────────────────────────────────
// In-memory store — pengganti sementara untuk API call.
// ─────────────────────────────────────────────────────────

let quizStore: QuizItem[] = [
  {
    idQuiz: 101,
    quiz_title: "Quadratic Equations Practice",
    duration: 45,
    status: "INCOMPLETED",
    difficulty: "MEDIUM",
    subjectId: 1,
    classId: 1,
    updated_at: "2026-07-14T09:20:00Z",
    questions: [
      {
        idQuestion: 1001,
        question_text: "Solve for x: x^2 - 5x + 6 = 0",
        question_image: "",
        question_type: "multiple_choice",
        difficulty: "MEDIUM",
        poin: 10,
        options: [
          { idOption: 1, option_text: "x = 2 or x = 3", option_image: "", is_correct: true },
          { idOption: 2, option_text: "x = -2 or x = -3", option_image: "", is_correct: false },
          { idOption: 3, option_text: "x = 1 or x = 6", option_image: "", is_correct: false },
        ],
      },
      {
        idQuestion: 1002,
        question_text: "What is the discriminant of x^2 + 4x + 4 = 0?",
        question_image: "",
        question_type: "multiple_choice",
        difficulty: "EASY",
        poin: 10,
        options: [
          { idOption: 4, option_text: "0", option_image: "", is_correct: true },
          { idOption: 5, option_text: "4", option_image: "", is_correct: false },
        ],
      },
    ],
  },
  {
    idQuiz: 102,
    quiz_title: "Coordinate Geometry Basics",
    duration: 60,
    status: "COMPLETED",
    difficulty: "EASY",
    subjectId: 2,
    classId: 1,
    updated_at: "2026-07-10T14:00:00Z",
    questions: [],
  },
]

export function getQuizzes(): QuizItem[] {
  return quizStore
}

export function getQuizById(idQuiz: number): QuizItem | undefined {
  return quizStore.find((q) => q.idQuiz === idQuiz)
}

export function addQuiz(quiz: QuizItem) {
  quizStore = [quiz, ...quizStore]
  return quiz
}

export function updateQuiz(updated: QuizItem) {
  quizStore = quizStore.map((q) => (q.idQuiz === updated.idQuiz ? updated : q))
  return updated
}