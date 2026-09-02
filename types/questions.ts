import type { QuestionTypeKey } from "@/lib/theme/question-type-themes"
export interface MatchingPair {
  id: number | string;
  left: string;
  right: string;
}

export interface OptionItem {
  idOption: number;
  option_text: string;
  option_image?: string;
  is_correct: boolean;
}

export interface QuestionItem {
  idQuestion: number;
  question_type: QuestionTypeKey;
  question_text: string;
  question_image?: string;
  poin: number;
  difficulty: DifficultyKey;
  tag?: string;
  explanation?: string;
  options: OptionItem[];
  pairs?: MatchingPair[];
  // Story Group
  children?: QuestionItem[];
  parentId?: number | null;
  // Multiple Complex
  allow_multiple_answers?: boolean;
  // Fill Blank
  is_strict?: boolean;
}

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
  choices: AnswerChoice[] // -> options[] (for most types; for fill_blank: each choice = one accepted answer)
  pairs?: MatchingPair[] // -> questions.pairs — for matching
  // Story Group: the child questions
  storyChildren?: QuestionFormValue[]
  // Multiple Complex: allow multi-select
  allowMultipleAnswers?: boolean
  // Fill Blank: strict case-sensitive validation
  isStrict?: boolean
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
    case "multiple_complex":
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
    case "story_group":
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
  storyChildren: type === "story_group" ? [] : undefined,
  allowMultipleAnswers: type === "multiple_complex" ? true : false,
  isStrict: false,
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
    allow_multiple_answers: value.allowMultipleAnswers ?? false,
    is_strict: value.isStrict ?? false,
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
    allowMultipleAnswers: item.allow_multiple_answers ?? false,
    isStrict: item.is_strict ?? false,
    storyChildren: item.children?.map(questionItemToFormValue) ?? [],
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
    allow_multiple_answers: value.allowMultipleAnswers ?? false,
    is_strict: value.isStrict ?? false,
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
