"use client"

import { useEffect, useRef, useState } from "react"
import type { Difficulty, OptionItem, QuestionItem, QuizItem } from "@/constants/dummy/subjectData"
import { dummyClasses, dummySubjects, getSubjectThemeKey } from "@/constants/dummy/subjectData"
import { getSubjectTheme } from "@/lib/theme/subject-themes"

interface QuizEditorProps {
  quiz: QuizItem
  onSave: (quiz: QuizItem) => Promise<void> | void
  onBack: () => void
}

type SaveState = "idle" | "saving" | "saved"

export default function QuizEditor({ quiz: initialQuiz, onSave, onBack }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<QuizItem>(initialQuiz)
  const [activeIndex, setActiveIndex] = useState(0)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const theme = getSubjectTheme(getSubjectThemeKey(quiz.subjectId))
  const className = dummyClasses.find((c) => c.idClass === quiz.classId)?.class_name ?? ""
  const subjectName = dummySubjects.find((s) => s.idSubject === quiz.subjectId)?.subject_name ?? ""
  const activeQuestion = quiz.questions[activeIndex]

  useEffect(() => {
    setSaveState("saving")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await onSave(quiz)
      setSaveState("saved")
    }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz])

  const updateQuestion = (updated: QuestionItem) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === activeIndex ? updated : q)),
    }))
  }

  const addQuestion = () => {
    const newQuestion: QuestionItem = {
      idQuestion: Date.now(),
      question_text: "",
      question_image: "",
      difficulty: "EASY",
      poin: 10,
      options: [
        { idOption: Date.now() + 1, option_text: "", option_image: "", is_correct: false },
        { idOption: Date.now() + 2, option_text: "", option_image: "", is_correct: false },
      ],
    }
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, newQuestion] }))
    setActiveIndex(quiz.questions.length)
  }

  const deleteQuestion = (index: number) => {
    setQuiz((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }))
    setActiveIndex((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header — badge class/subject sekarang ikut warna theme subject */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm mr-1" aria-label="Back to dashboard">
              &larr;
            </button>
            <h1 className="text-base font-semibold text-slate-900">{quiz.quiz_title || "Untitled quiz"}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${theme.badge}`}>{className}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${theme.badge}`}>{subjectName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <DifficultyBadge difficulty={quiz.difficulty} />
            <Badge tone={quiz.status === "COMPLETED" ? "green" : "amber"}>
              {quiz.status === "COMPLETED" ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
        <AutosaveIndicator state={saveState} />
      </div>

      {/* Question navigator — soal aktif pakai warna theme subject */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs text-slate-500 whitespace-nowrap">
          Question {quiz.questions.length ? activeIndex + 1 : 0} of {quiz.questions.length}
        </span>
        <div className="flex gap-1.5">
          {quiz.questions.map((q, i) => (
            <button
              key={q.idQuestion}
              onClick={() => setActiveIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center border transition-all duration-150 ${
                i === activeIndex
                  ? `text-white border-transparent ${theme.button}`
                  : q.question_text
                  ? "bg-white text-slate-700 border-slate-200"
                  : "bg-white text-slate-400 border-dashed border-slate-200"
              }`}
              title={q.question_text ? "Answered" : "Not answered yet"}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={addQuestion}
          className="ml-1 px-3 h-8 rounded-lg text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 whitespace-nowrap"
        >
          + Add question
        </button>
      </div>

      {activeQuestion ? (
        <div className="grid md:grid-cols-2 gap-4 p-4 md:p-6 max-w-5xl mx-auto">
          <QuestionEditorPane
            question={activeQuestion}
            theme={theme}
            onChange={updateQuestion}
            onDelete={() => deleteQuestion(activeIndex)}
          />
          <QuestionPreviewPane question={activeQuestion} />
        </div>
      ) : (
        <EmptyState onAdd={addQuestion} theme={theme} />
      )}
    </div>
  )
}

function QuestionEditorPane({
  question,
  theme,
  onChange,
  onDelete,
}: {
  question: QuestionItem
  theme: ReturnType<typeof getSubjectTheme>
  onChange: (q: QuestionItem) => void
  onDelete: () => void
}) {
  const updateOption = (idOption: number, patch: Partial<OptionItem>) => {
    onChange({
      ...question,
      options: question.options.map((o) => (o.idOption === idOption ? { ...o, ...patch } : o)),
    })
  }

  const setCorrect = (idOption: number) => {
    onChange({
      ...question,
      options: question.options.map((o) => ({ ...o, is_correct: o.idOption === idOption })),
    })
  }

  const addOption = () => {
    onChange({
      ...question,
      options: [
        ...question.options,
        { idOption: Date.now(), option_text: "", option_image: "", is_correct: false },
      ],
    })
  }

  const removeOption = (idOption: number) => {
    onChange({ ...question, options: question.options.filter((o) => o.idOption !== idOption) })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={question.difficulty}
          onChange={(e) => onChange({ ...question, difficulty: e.target.value as Difficulty })}
          className="text-xs font-medium border border-slate-200 rounded-md px-2 py-1 bg-white"
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-600">
          Delete question
        </button>
      </div>

      <textarea
        value={question.question_text}
        onChange={(e) => onChange({ ...question, question_text: e.target.value })}
        placeholder="Write the question..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      />

      <ImageUploadSlot
        imageUrl={question.question_image}
        onChange={(url) => onChange({ ...question, question_image: url })}
      />

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Answers</p>
        {question.options.map((opt, i) => (
          <div
            key={opt.idOption}
            className={`flex items-center gap-2 rounded-lg px-1 transition-colors duration-150 ${
              opt.is_correct ? "bg-slate-50" : ""
            }`}
          >
            <input
              type="radio"
              checked={opt.is_correct}
              onChange={() => setCorrect(opt.idOption)}
              className="w-4 h-4 accent-emerald-600"
            />
            <input
              value={opt.option_text}
              onChange={(e) => updateOption(opt.idOption, { option_text: e.target.value })}
              placeholder={`Answer ${String.fromCharCode(65 + i)}`}
              className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            {opt.is_correct && (
              <span className={`text-xs font-medium whitespace-nowrap ${theme.text}`}>Correct</span>
            )}
            <button
              onClick={() => removeOption(opt.idOption)}
              className="text-slate-300 hover:text-red-500 text-sm px-1"
              aria-label="Remove answer"
            >
              ×
            </button>
          </div>
        ))}
        <button onClick={addOption} className="text-xs text-slate-500 hover:text-slate-700">
          + Add answer
        </button>
      </div>
    </div>
  )
}

function ImageUploadSlot({ imageUrl, onChange }: { imageUrl: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    onChange(url)
  }

  if (imageUrl) {
    return (
      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Question illustration" className="w-full h-full object-cover" />
        <button
          onClick={() => onChange("")}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
      }}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 cursor-pointer hover:border-slate-400"
    >
      Drag & drop image, or click to upload
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}

function QuestionPreviewPane({ question }: { question: QuestionItem }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <p className="text-xs font-medium text-slate-400 mb-3">Student preview</p>
      {question.question_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={question.question_image} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />
      )}
      <p className="text-sm text-slate-900 mb-4">{question.question_text || "Question text will appear here"}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <div
            key={opt.idOption}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700"
          >
            <span className="w-5 h-5 rounded-full border border-slate-300 text-xs flex items-center justify-center">
              {String.fromCharCode(65 + i)}
            </span>
            {opt.option_text || <span className="text-slate-300">Empty answer</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ onAdd, theme }: { onAdd: () => void; theme: ReturnType<typeof getSubjectTheme> }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-base font-medium text-slate-900">Start your first question</p>
      <p className="text-sm text-slate-500 mt-1 mb-4">This quiz doesn't have any questions yet.</p>
      <button
        onClick={onAdd}
        className={`px-4 h-10 rounded-lg text-white text-sm font-medium transition-all duration-150 hover:scale-[1.02] ${theme.button}`}
      >
        Add first question
      </button>
    </div>
  )
}

function AutosaveIndicator({ state }: { state: SaveState }) {
  const label = state === "saving" ? "Saving..." : state === "saved" ? "Saved" : ""
  if (!label) return null
  return (
    <span className={`text-xs ${state === "saving" ? "text-slate-400" : "text-emerald-600"}`}>{label}</span>
  )
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "slate" | "green" | "amber" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${tones[tone]}`}>{children}</span>
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const tones: Record<Difficulty, string> = {
    EASY: "bg-emerald-50 text-emerald-700",
    MEDIUM: "bg-amber-50 text-amber-700",
    HARD: "bg-red-50 text-red-700",
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${tones[difficulty]}`}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  )
}