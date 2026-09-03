"use client"

import { getQuestionTypeTheme, type QuestionTypeKey } from "@/lib/theme/question-type-themes"
import { getDefaultChoicesForType, getDefaultPairsForType, newChoiceId, type QuestionFormValue, type AnswerChoice } from "@/types/questions"
import QuestionTypeCard from "./QuestionTypeCard"
import MultipleChoiceAnswer from "../question-editor/aswer-sections/MultipleChoiceAnswer"
import MultipleChoiceComplexAnswer from "../question-editor/aswer-sections/MultipleChoiceComplexAnswer"
import TrueFalseAnswer from "../question-editor/aswer-sections/TrueFalseAnswer"
import ShortAnswerAnswer from "../question-editor/aswer-sections/ShortAnswerAnswer"
import FillBlankAnswer from "../question-editor/aswer-sections/FillBlankAnswer"
import EssayAnswer from "../question-editor/aswer-sections/EssayAnswer"
import MatchingAnswer from "../question-editor/aswer-sections/MatchingAnswer"
import MathText from "@/components/shared/MathText"
import MathEditorField from "@/components/shared/MathEditorField"
import { BookOpen } from "lucide-react"

interface QuestionEditorLiveProps {
  value: QuestionFormValue
  onChange: (patch: Partial<QuestionFormValue>) => void
  typeOptions: { key: QuestionTypeKey; icon: React.ReactNode }[]
  onAddChoice: () => void
  onUpdateChoice: (id: number, patch: Partial<AnswerChoice>) => void
  onSetCorrectChoice: (id: number) => void
  onRemoveChoice: (id: number) => void
  onCancel: () => void
  onSave: () => void
  /** Optional — shows "Delete question" when editing an existing question. */
  onDelete?: () => void
  /** Overrides the default "Save question" label. */
  saveLabel?: string
}

export default function QuestionEditorLive({
  value,
  onChange,
  typeOptions,
  onAddChoice,
  onUpdateChoice,
  onSetCorrectChoice,
  onRemoveChoice,
  onCancel,
  onSave,
  onDelete,
  saveLabel = "Save question",
}: QuestionEditorLiveProps) {
  const theme = getQuestionTypeTheme(value.type)

  // Switch question type — reset choices/pairs/children to defaults
  const handleSelectType = (type: QuestionTypeKey) => {
    onChange({
      type,
      choices: getDefaultChoicesForType(type),
      pairs: getDefaultPairsForType(type),
      allowMultipleAnswers: type === "multiple_complex",
      isStrict: type === "fill_blank" ? (value.isStrict ?? false) : false,
      storyChildren: type === "story_group" ? (value.storyChildren ?? []) : undefined,
    })
  }

  // ── Story Group: add/remove child questions ───────────────────────────────
  const handleAddStoryChild = () => {
    const newChild: QuestionFormValue = {
      type: "multiple_choice",
      prompt: "",
      points: 10,
      difficulty: value.difficulty,
      tag: "",
      explanation: "",
      choices: getDefaultChoicesForType("multiple_choice"),
      pairs: [],
      allowMultipleAnswers: false,
      isStrict: false,
    }
    onChange({ storyChildren: [...(value.storyChildren ?? []), newChild] })
  }

  const handleUpdateStoryChild = (index: number, patch: Partial<QuestionFormValue>) => {
    const updated = [...(value.storyChildren ?? [])]
    updated[index] = { ...updated[index], ...patch }
    onChange({ storyChildren: updated })
  }

  const handleRemoveStoryChild = (index: number) => {
    const updated = [...(value.storyChildren ?? [])]
    updated.splice(index, 1)
    onChange({ storyChildren: updated })
  }

  // ── Multiple Complex: toggle any choice ──────────────────────────────────
  const handleToggleCorrectComplex = (id: number) => {
    const updated = value.choices.map((c) =>
      c.id === id ? { ...c, isCorrect: !c.isCorrect } : c
    )
    onChange({ choices: updated })
  }

  // ── Fill Blank: add/remove alternatives ──────────────────────────────────
  const handleAddFillBlankAlternative = () => {
    onChange({
      choices: [...value.choices, { id: newChoiceId(), text: "", isCorrect: true }],
    })
  }

  const handleRemoveFillBlankAlternative = (id: number) => {
    if (value.choices.length <= 1) return
    onChange({ choices: value.choices.filter((c) => c.id !== id) })
  }

  // ── Answer section renderer ───────────────────────────────────────────────
  const renderAnswerSection = () => {
    switch (value.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceAnswer
            choices={value.choices}
            theme={theme}
            onAddChoice={onAddChoice}
            onUpdateChoice={onUpdateChoice}
            onSetCorrectChoice={onSetCorrectChoice}
            onRemoveChoice={onRemoveChoice}
          />
        )
      case "multiple_complex":
        return (
          <MultipleChoiceComplexAnswer
            choices={value.choices}
            theme={theme}
            onAddChoice={onAddChoice}
            onUpdateChoice={onUpdateChoice}
            onToggleCorrect={handleToggleCorrectComplex}
            onRemoveChoice={onRemoveChoice}
          />
        )
      case "true_false":
        return <TrueFalseAnswer choices={value.choices} theme={theme} onSetCorrectChoice={onSetCorrectChoice} />
      case "short_answer":
        return <ShortAnswerAnswer choices={value.choices} onUpdateChoice={onUpdateChoice} />
      case "fill_blank":
        return (
          <FillBlankAnswer
            choices={value.choices}
            isStrict={value.isStrict ?? false}
            onUpdateChoice={onUpdateChoice}
            onAddChoice={handleAddFillBlankAlternative}
            onRemoveChoice={handleRemoveFillBlankAlternative}
            onToggleStrict={(val) => onChange({ isStrict: val })}
          />
        )
      case "essay":
        return <EssayAnswer />
      case "matching":
        return <MatchingAnswer pairs={value.pairs ?? []} onChange={onChange} />
      case "story_group":
        return renderStoryGroupEditor()
      default:
        return null
    }
  }

  // ── Story Group: child question list editor ───────────────────────────────
  const renderStoryGroupEditor = () => {
    const children = value.storyChildren ?? []
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
          <BookOpen size={14} />
          <span>
            The prompt above is the shared <strong>story / passage</strong>. Add child questions below.
            Each child can be any question type.
          </span>
        </div>

        {children.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No child questions yet. Click "Add child question" below.
          </p>
        )}

        {children.map((child, idx) => (
          <div key={idx} className="border border-amber-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-amber-50">
              <span className="text-xs font-bold text-amber-700">Question {idx + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveStoryChild(idx)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Child type selector */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(["multiple_choice", "multiple_complex", "true_false", "fill_blank", "short_answer", "essay"] as QuestionTypeKey[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleUpdateStoryChild(idx, {
                        type: t,
                        choices: getDefaultChoicesForType(t),
                        pairs: getDefaultPairsForType(t),
                        allowMultipleAnswers: t === "multiple_complex",
                      })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        child.type === t
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white border-slate-200 text-slate-500 hover:border-amber-300"
                      }`}
                    >
                      {t.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Child prompt */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Question prompt
                </label>
                <MathEditorField
                  value={child.prompt}
                  onChange={(val) => handleUpdateStoryChild(idx, { prompt: val })}
                  placeholder="Write the child question here..."
                  rows={2}
                  ariaLabel={`Story child question ${idx + 1} prompt`}
                />
              </div>

              {/* Child points + difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Points</label>
                  <input
                    type="number"
                    value={child.points}
                    onChange={(e) => handleUpdateStoryChild(idx, { points: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Difficulty</label>
                  <select
                    value={child.difficulty}
                    onChange={(e) => handleUpdateStoryChild(idx, { difficulty: e.target.value as QuestionFormValue["difficulty"] })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none bg-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {/* Child choices (inline mini answer editor for MC) */}
              {(child.type === "multiple_choice" || child.type === "multiple_complex" || child.type === "true_false" || child.type === "fill_blank" || child.type === "short_answer") && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    {child.type === "fill_blank" ? "Accepted answers" : "Choices"}
                  </label>
                  <div className="space-y-1.5">
                    {child.choices.map((c, ci) => (
                      <div key={c.id ?? ci} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedChoices = child.type === "multiple_complex"
                              ? child.choices.map((ch) => ch.id === c.id ? { ...ch, isCorrect: !ch.isCorrect } : ch)
                              : child.choices.map((ch) => ({ ...ch, isCorrect: ch.id === c.id }))
                            handleUpdateStoryChild(idx, { choices: updatedChoices })
                          }}
                          className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            c.isCorrect ? "border-amber-500 bg-amber-500" : "border-slate-300"
                          }`}
                        >
                          {c.isCorrect && <span className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                        <input
                          value={c.text}
                          onChange={(e) => {
                            const updatedChoices = child.choices.map((ch) =>
                              ch.id === c.id ? { ...ch, text: e.target.value } : ch
                            )
                            handleUpdateStoryChild(idx, { choices: updatedChoices })
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + ci)}`}
                          className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStoryChild(idx, {
                        choices: [...child.choices, { id: newChoiceId(), text: "", isCorrect: false }]
                      })
                    }}
                    className="mt-1.5 text-[10px] font-medium text-slate-500 hover:text-amber-600"
                  >
                    + Add choice
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddStoryChild}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-200 text-xs font-bold text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all"
        >
          + Add child question
        </button>
      </div>
    )
  }

  // ── Preview panel ─────────────────────────────────────────────────────────
  const renderPreviewAnswers = () => {
    switch (value.type) {
      case "true_false":
        return (
          <div className="grid grid-cols-2 gap-2">
            {["True", "False"].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 text-center font-medium"
              >
                {label}
              </div>
            ))}
          </div>
        )
      case "short_answer":
      case "fill_blank":
        return (
          <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-300 italic">
            Type your answer…
          </div>
        )
      case "essay":
        return (
          <div className="rounded-xl border border-slate-200 px-3 py-8 text-sm text-slate-300 italic">
            Write your answer…
          </div>
        )
      case "matching":
        return (
          <div className="space-y-2">
            {(value.pairs ?? []).map((pair) => (
              <div key={pair.id} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5">
                  {pair.left || <span className="text-slate-300 italic">Item</span>}
                </span>
                <span className="text-slate-300">↔</span>
                <span className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5">
                  {pair.right || <span className="text-slate-300 italic">Match</span>}
                </span>
              </div>
            ))}
          </div>
        )
      case "story_group":
        return (
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-3 text-xs text-amber-700">
            📖 Story passage + {(value.storyChildren ?? []).length} child question(s)
          </div>
        )
      case "multiple_complex":
        return (
          <div className="space-y-2">
            {value.choices.map((choice, i) => (
              <div
                key={choice.id}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <span className="w-5 h-5 rounded border border-slate-300 text-[11px] flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {choice.text
                  ? <MathText text={choice.text} className="flex-1 min-w-0" />
                  : <span className="text-slate-300 italic">Choice {i + 1}</span>
                }
                {choice.isCorrect && (
                  <span className="ml-auto text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">✓</span>
                )}
              </div>
            ))}
          </div>
        )
      case "multiple_choice":
      default:
        return (
          <div className="space-y-2">
            {value.choices.map((choice, i) => (
              <div
                key={choice.id}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <span className="w-5 h-5 rounded-full border border-slate-300 text-[11px] flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {choice.text
                  ? <MathText text={choice.text} className="flex-1 min-w-0" />
                  : <span className="text-slate-300 italic">Choice {i + 1}</span>
                }
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
          ← Console
        </button>
        <div className="flex items-center gap-3">
          {onDelete && (
            <button onClick={onDelete} className="text-sm font-medium text-red-500 hover:text-red-600">
              Delete question
            </button>
          )}
          <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="h-9 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all duration-150 hover:scale-[1.02]"
          >
            {saveLabel}
          </button>
        </div>
      </div>

      <div className="pt-6 flex items-center gap-3 mb-6">
        <div className={`w-11 h-11 rounded-2xl ${theme.iconBg} text-white flex items-center justify-center transition-colors duration-300`}>
          +
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Add a question</p>
          <h1 className="text-2xl font-bold text-slate-900">Choose a format, write the prompt, set the answer</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Question format</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {typeOptions.map((opt) => (
                <QuestionTypeCard
                  key={opt.key}
                  typeKey={opt.key}
                  icon={opt.icon}
                  selected={value.type === opt.key}
                  onSelect={() => handleSelectType(opt.key)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                {value.type === "story_group" ? "Story / Passage text" : "Prompt"}
              </label>
              <MathEditorField
                value={value.prompt}
                onChange={(newVal) => onChange({ prompt: newVal })}
                placeholder={value.type === "story_group"
                  ? "Write the shared story or passage here..."
                  : "Ketik soal di sini..."}
                rows={value.type === "story_group" ? 6 : 4}
                ariaLabel="Teks soal / prompt"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Points</label>
                <input
                  type="number"
                  value={value.points}
                  onChange={(e) => onChange({ points: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Difficulty</label>
                <select
                  value={value.difficulty}
                  onChange={(e) => onChange({ difficulty: e.target.value as QuestionFormValue["difficulty"] })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none bg-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Tag (optional)</label>
                <input
                  value={value.tag}
                  onChange={(e) => onChange({ tag: e.target.value })}
                  placeholder="e.g. discriminant"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">{renderAnswerSection()}</div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
              💡 Explanation (shown after submission)
            </label>
            <MathEditorField
              value={value.explanation}
              onChange={(newVal) => onChange({ explanation: newVal })}
              placeholder="Opsional — bantu siswa memahami jawaban yang benar."
              rows={2}
              ariaLabel="Penjelasan jawaban"
            />
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20 self-start">
          <div key={value.type} className={`bg-white rounded-2xl ring-1 ring-slate-100 p-5 ${theme.previewAccent} animate-gradient-fade`}>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              {value.type === "story_group" ? "Story Preview" : "Question"} · {value.points} pts
            </p>
            <div className="text-base font-semibold text-slate-900 mb-4 min-w-0 break-words">
              {value.prompt
                ? <MathText text={value.prompt} />
                : <span className="text-slate-300 font-normal">Your question will preview here</span>
              }
            </div>
            {renderPreviewAnswers()}
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-900 mb-2">Tips</p>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
              {value.type === "multiple_complex" ? (
                <>
                  <li>Tick all correct answers with checkboxes.</li>
                  <li>Students must select <strong>exactly</strong> the same set.</li>
                  <li>Great for "select all that apply" questions.</li>
                </>
              ) : value.type === "fill_blank" ? (
                <>
                  <li>Use <code className="bg-slate-100 px-1 rounded">___</code> in the prompt for the blank.</li>
                  <li>Add alternatives for common correct spellings.</li>
                  <li>Enable strict mode for exact case matching.</li>
                </>
              ) : value.type === "story_group" ? (
                <>
                  <li>Write the shared passage in the prompt above.</li>
                  <li>Add child questions based on the passage.</li>
                  <li>Each child is scored independently.</li>
                </>
              ) : (
                <>
                  <li>Keep the prompt under two sentences.</li>
                  <li>Only one correct choice for multiple choice.</li>
                  <li>Points reflect difficulty &amp; time to solve.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
