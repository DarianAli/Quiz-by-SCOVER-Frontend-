import type { QuestionTypeKey } from "@/lib/theme/question-type-themes"
import type { QuestionItem, OptionItem, MatchingPair } from "@/constants/dummy/subjectData"

// Re-exported for backward compatibility — MatchingPair now lives in
// constants/dummy/subjectData.ts so QuestionItem can reference it directly
// without a circular import. Anything importing MatchingPair from this file
// keeps working unchanged.
export type { MatchingPair }

export type DifficultyKey = "EASY" | "MEDIUM" | "HARD"

export interface AnswerChoice {
  id: number
  text: string // -> options.option_text
  image?: string // -> options.option_image
  isCorrect: boolean // -> options.is_correct
}

export interface QuestionFormValue {
  type: QuestionTypeKey
  prompt: string // -> questions.question_text
  image?: string // -> questions.question_image
  points: number // -> questions.poin
  difficulty: DifficultyKey // -> questions.difficulty
  tag: string // -> questions.tag
  explanation: string // -> questions.explanation
  choices: AnswerChoice[] // -> options[] (dipakai multiple_choice, true_false, short_answer, fill_blank)
  pairs?: MatchingPair[] // -> questions.pairs — dipakai matching
}

let nextChoiceId = 1000
export function newChoiceId() {
  return nextChoiceId++
}

/** Dummy default choices tiap kali user ganti tipe soal */
export function getDefaultChoicesForType(type: QuestionTypeKey): AnswerChoice[] {
  switch (type) {
    case "true_false":
      return [
        { id: 1, text: "True", isCorrect: true },
        { id: 2, text: "False", isCorrect: false },
      ]
    case "multiple_choice":
      return [
        { id: 1, text: "", isCorrect: true },
        { id: 2, text: "", isCorrect: false },
        { id: 3, text: "", isCorrect: false },
        { id: 4, text: "", isCorrect: false },
      ]
    case "short_answer":
    case "fill_blank":
      return [{ id: 1, text: "", isCorrect: true }]
    case "essay":
    case "matching":
      return []
    default:
      return []
  }
}

export function getDefaultPairsForType(type: QuestionTypeKey): MatchingPair[] {
  if (type !== "matching") return []
  return [
    { id: 1, left: "", right: "" },
    { id: 2, left: "", right: "" },
  ]
}

/** Dummy contoh nilai form, gampang dipakai buat testing UI */
export const emptyQuestionForm = (type: QuestionTypeKey = "multiple_choice"): QuestionFormValue => ({
  type,
  prompt: "",
  image: "",
  points: 10,
  difficulty: "EASY",
  tag: "",
  explanation: "",
  choices: getDefaultChoicesForType(type),
  pairs: getDefaultPairsForType(type),
})

/**
 * Mapper -> payload yang siap dikirim ke endpoint create/update `questions`.
 */
export function toBackendPayload(value: QuestionFormValue, quizId: number) {
  return {
    quizId,
    question_text: value.prompt,
    question_image: value.image ?? "",
    question_type: value.type,
    poin: value.points,
    difficulty: value.difficulty,
    tag: value.tag || undefined,
    explanation: value.explanation || undefined,
    options: value.choices.map((c) => ({
      option_text: c.text,
      option_image: c.image ?? "",
      is_correct: c.isCorrect,
    })),
    pairs: value.type === "matching" ? value.pairs : undefined,
  }
}

// ─────────────────────────── NEW ───────────────────────────
// Bridge between the persisted QuestionItem (quiz.questions[]) and the
// QuestionFormValue used by QuestionEditorLive — this is what lets the
// same editor UI power both "Add question" and "Edit question".

/** QuestionItem (persisted, in quiz.questions[]) -> QuestionFormValue (editor state) */
export function questionItemToFormValue(item: QuestionItem): QuestionFormValue {
  return {
    type: item.question_type,
    prompt: item.question_text,
    image: item.question_image,
    points: item.poin,
    difficulty: item.difficulty,
    tag: item.tag ?? "",
    explanation: item.explanation ?? "",
    choices: item.options.map((o) => ({
      id: o.idOption,
      text: o.option_text,
      image: o.option_image || undefined,
      isCorrect: o.is_correct,
    })),
    pairs: item.pairs ?? getDefaultPairsForType(item.question_type),
  }
}

/** QuestionFormValue (editor state) -> QuestionItem (persisted). Pass the
 * existing idQuestion when editing so the id is preserved; omit it to
 * create a brand-new question. */
export function formValueToQuestionItem(value: QuestionFormValue, existingId?: number): QuestionItem {
  return {
    idQuestion: existingId ?? Date.now(),
    question_text: value.prompt,
    question_image: value.image ?? "",
    question_type: value.type,
    difficulty: value.difficulty,
    poin: value.points,
    tag: value.tag || undefined,
    explanation: value.explanation || undefined,
    options: value.choices.map(
      (c): OptionItem => ({
        idOption: c.id,
        option_text: c.text,
        option_image: c.image ?? "",
        is_correct: c.isCorrect,
      })
    ),
    pairs: value.type === "matching" ? value.pairs : undefined,
  }
}