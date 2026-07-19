"use client"

import { getQuestionTypeTheme, type QuestionTypeKey } from "@/lib/theme/question-type-themes"
import { getDefaultChoicesForType, getDefaultPairsForType, type QuestionFormValue, type AnswerChoice } from "@/types/questions"
import QuestionTypeCard from "./QuestionTypeCard"
import MultipleChoiceAnswer from "../question-editor/aswer-sections/MultipleChoiceAnswer"
import TrueFalseAnswer from "../question-editor/aswer-sections/TrueFalseAnswer"
import ShortAnswerAnswer from "../question-editor/aswer-sections/ShortAnswerAnswer"
import FillBlankAnswer from "../question-editor/aswer-sections/FillBlankAnswer"
import EssayAnswer from "../question-editor/aswer-sections/EssayAnswer"
import MatchingAnswer from "../question-editor/aswer-sections/MatchingAnswer"

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
  /** NEW — optional. Pass this only when editing an existing question (not
   * when adding a new one) to show a "Delete question" action in the header.
   * Omit the prop entirely and no delete button renders — existing callers
   * (Add Question flow) are unaffected. */
  onDelete?: () => void
  /** NEW — optional. Overrides the default "Save question" button label,
   * e.g. "Save changes" when editing. Defaults to "Save question". */
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

  // Ganti tipe soal -> reset choices/pairs ke default tipe baru
  const handleSelectType = (type: QuestionTypeKey) => {
    onChange({
      type,
      choices: getDefaultChoicesForType(type),
      pairs: getDefaultPairsForType(type),
    })
  }

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
      case "true_false":
        return <TrueFalseAnswer choices={value.choices} theme={theme} onSetCorrectChoice={onSetCorrectChoice} />
      case "short_answer":
        return <ShortAnswerAnswer choices={value.choices} onUpdateChoice={onUpdateChoice} />
      case "fill_blank":
        return <FillBlankAnswer choices={value.choices} onUpdateChoice={onUpdateChoice} />
      case "essay":
        return <EssayAnswer />
      case "matching":
        return <MatchingAnswer pairs={value.pairs ?? []} onChange={onChange} />
      default:
        return null
    }
  }

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
                {choice.text || <span className="text-slate-300 italic">Choice {i + 1}</span>}
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
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Prompt</label>
              <textarea
                value={value.prompt}
                onChange={(e) => onChange({ prompt: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none outline-none transition-shadow focus:ring-2 focus:ring-offset-0 ${theme.text}`}
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
            <textarea
              value={value.explanation}
              onChange={(e) => onChange({ explanation: e.target.value })}
              rows={2}
              placeholder="Optional — help students understand the answer."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none outline-none"
            />
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20 self-start">
          <div key={value.type} className={`bg-white rounded-2xl ring-1 ring-slate-100 p-5 ${theme.previewAccent} animate-gradient-fade`}>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Question · {value.points} pts
            </p>
            <p className="text-base font-semibold text-slate-900 mb-4">{value.prompt || "Your question will preview here"}</p>
            {renderPreviewAnswers()}
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-900 mb-2">Tips</p>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
              <li>Keep the prompt under two sentences.</li>
              <li>Only one correct choice for multiple choice.</li>
              <li>Points reflect difficulty &amp; time to solve.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}