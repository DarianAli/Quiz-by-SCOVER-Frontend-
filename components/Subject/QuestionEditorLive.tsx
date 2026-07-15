"use client"

import { getQuestionTypeTheme, type QuestionTypeKey } from "@/lib/theme/question-type-themes"
import QuestionTypeCard from "./QuestionTypeCard"

export interface AnswerChoice {
  id: number
  text: string
  isCorrect: boolean
}

export interface QuestionFormValue {
  type: QuestionTypeKey
  prompt: string
  points: number
  tag: string
  choices: AnswerChoice[]
}

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
}

/**
 * UI murni, controlled component. Simpan/cancel dan validasi tetap
 * tanggung jawab halaman pemanggil.
 */
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
}: QuestionEditorLiveProps) {
  const theme = getQuestionTypeTheme(value.type)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
          ← Console
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="h-9 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all duration-150 hover:scale-[1.02]"
          >
            Save question
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
                  onSelect={() => onChange({ type: opt.key })}
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
            <div className="grid grid-cols-2 gap-4">
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

          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Answer choices</p>
              <p className="text-xs text-slate-400">Tap the circle to mark the correct answer</p>
            </div>
            <div className="space-y-2">
              {value.choices.map((choice, i) => (
                <div
                  key={choice.id}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all duration-200 ${
                    choice.isCorrect ? `${theme.selectedBorder} bg-slate-50` : "border-slate-100"
                  }`}
                >
                  <button
                    onClick={() => onSetCorrectChoice(choice.id)}
                    aria-label={`Mark answer ${String.fromCharCode(65 + i)} as correct`}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                      choice.isCorrect ? theme.selectedBorder : "border-slate-300"
                    }`}
                  >
                    {choice.isCorrect && (
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.iconBg} animate-fade-slide-up`} />
                    )}
                  </button>
                  <span className="text-xs font-medium text-slate-400 w-4">{String.fromCharCode(65 + i)}</span>
                  <input
                    value={choice.text}
                    onChange={(e) => onUpdateChoice(choice.id, { text: e.target.value })}
                    placeholder={`Choice ${i + 1}`}
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                  <button
                    onClick={() => onRemoveChoice(choice.id)}
                    className="text-slate-300 hover:text-red-500 text-sm px-1"
                    aria-label="Remove choice"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
            <button onClick={onAddChoice} className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700">
              + Add choice
            </button>
          </div>
        </div>

        {/* Right: student preview + tips */}
        <div className="space-y-5 lg:sticky lg:top-20 self-start">
          <div
            key={value.type}
            className={`bg-white rounded-2xl ring-1 ring-slate-100 p-5 ${theme.previewAccent} animate-gradient-fade`}
          >
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Student preview · {value.points} pts
            </p>
            <p className="text-base font-semibold text-slate-900 mb-4">{value.prompt || "Your question will appear here"}</p>
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