"use client"

import { getSubjectTheme, type SubjectThemeKey } from "@/lib/theme/subject-themes"
import type { Difficulty, QuizItem } from "@/constants/dummy/subjectData"

export interface RecentQuizRowData {
  quiz: QuizItem
  subjectName: string
  subjectTheme: SubjectThemeKey
  icon: React.ReactNode
}

interface RecentQuizzesPanelProps {
  rows: RecentQuizRowData[]
  onCreateQuiz: () => void
  onContinueEditing: (idQuiz: number) => void
  onStartAddingQuestions: (idQuiz: number) => void
  onReviewSubmissions?: (idQuiz: number) => void
}

const difficultyTone: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-red-50 text-red-700",
}

export default function RecentQuizzesPanel({
  rows,
  onCreateQuiz,
  onContinueEditing,
  onStartAddingQuestions,
  onReviewSubmissions,
}: RecentQuizzesPanelProps) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium tracking-wide uppercase text-slate-400">Assessment center</p>
          <h3 className="text-lg font-bold text-slate-900">Recent quizzes</h3>
          <p className="text-xs text-slate-500">Draft, publish and monitor progress.</p>
        </div>
        <button
          onClick={onCreateQuiz}
          className="h-9 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 whitespace-nowrap transition-all duration-150 hover:scale-[1.02]"
        >
          + Create quiz
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">No quizzes yet</p>
          <p className="text-xs text-slate-500 mt-1">Create your first quiz to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ quiz, subjectName, subjectTheme, icon }) => {
            const theme = getSubjectTheme(subjectTheme)
            const isPublished = quiz.status === "COMPLETED"
            const hasQuestions = quiz.questions.length > 0
            // progress kasar: proporsi soal yang sudah terisi teksnya
            const filled = quiz.questions.filter((q) => q.question_text.trim().length > 0).length
            const progress = quiz.questions.length ? Math.round((filled / quiz.questions.length) * 100) : 0

            return (
              <div
                key={quiz.idQuiz}
                className="rounded-xl border border-slate-100 p-4 transition-all duration-150 hover:shadow-sm"
              >
                <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                  <div className={`w-10 h-10 rounded-xl ${theme.iconBg} text-white flex items-center justify-center flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{quiz.quiz_title}</p>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isPublished ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded ${theme.badge}`}>{subjectName}</span>
                      <span>📄 {quiz.questions.length} questions</span>
                      <span>⏱ {quiz.duration} min</span>
                      <span className={`px-1.5 py-0.5 rounded-md ${difficultyTone[quiz.difficulty]}`}>
                        {quiz.difficulty.charAt(0) + quiz.difficulty.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {hasQuestions ? (
                    isPublished && onReviewSubmissions ? (
                      <button
                        onClick={() => onReviewSubmissions(quiz.idQuiz)}
                        className="h-9 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap hover:bg-slate-800 transition-all duration-150"
                      >
                        ↗ Review submissions
                      </button>
                    ) : (
                      <button
                        onClick={() => onContinueEditing(quiz.idQuiz)}
                        className={`h-9 px-4 rounded-xl text-white text-xs font-semibold whitespace-nowrap transition-all duration-150 hover:scale-[1.02] ${theme.button}`}
                      >
                        ✎ Continue editing
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onStartAddingQuestions(quiz.idQuiz)}
                      className={`h-9 px-4 rounded-xl text-white text-xs font-semibold whitespace-nowrap transition-all duration-150 hover:scale-[1.02] ${theme.button}`}
                    >
                      + Start adding questions
                    </button>
                  )}
                </div>

                <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${theme.progressFill} transition-all duration-700 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}