"use client"

import { useState, useRef } from "react"
import { Eye, Code2 } from "lucide-react"
import MathText from "@/components/shared/MathText"
import LatexToolbar from "@/components/shared/LatexToolbar"

/**
 * MathEditorField — a drop-in replacement for <textarea> that adds:
 *
 * ┌─────────────────────────────────────────────────────┐
 * │ 👁 Visual  │  </> LaTeX                              │
 * ├─────────────────────────────────────────────────────┤
 * │ Visual mode: renders the value with MathText        │
 * │ LaTeX  mode: shows raw <textarea> + LatexToolbar    │
 * └─────────────────────────────────────────────────────┘
 *
 * DATA IS ALWAYS A PLAIN STRING (LaTeX/Unicode).
 * MathText interprets $...$ / $$...$$ for rendering.
 * No extra dependencies — reuses existing KaTeX infrastructure.
 *
 * Usage:
 *   <MathEditorField
 *     value={value.prompt}
 *     onChange={(v) => onChange({ prompt: v })}
 *     placeholder="Type your question..."
 *     rows={3}
 *   />
 */

interface MathEditorFieldProps {
  value: string
  onChange: (newValue: string) => void
  placeholder?: string
  rows?: number
  /** Extra CSS classes applied to the outer wrapper */
  className?: string
  /** Extra CSS classes for the <textarea> in LaTeX mode */
  textareaClassName?: string
  /** aria-label for the textarea (LaTeX mode) */
  ariaLabel?: string
}

export default function MathEditorField({
  value,
  onChange,
  placeholder = "Type here…",
  rows = 3,
  className = "",
  textareaClassName = "",
  ariaLabel,
}: MathEditorFieldProps) {
  const [mode, setMode] = useState<"visual" | "latex">("visual")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Switch to LaTeX mode when user clicks the rendered content (they want to edit)
  const handleVisualClick = () => {
    setMode("latex")
    // After render, focus textarea and put cursor at end
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const len = textareaRef.current.value.length
        textareaRef.current.setSelectionRange(len, len)
      }
    })
  }

  const isEmpty = !value || value.trim() === ""

  return (
    <div className={`rounded-xl border border-slate-200 overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:border-blue-300 ${className}`}>
      {/* Mode toggle header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Teks Soal
        </span>
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode("visual")}
            title="Mode Visual — lihat tampilan hasil render"
            aria-label="Beralih ke mode visual"
            className={[
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all duration-150",
              mode === "visual"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            ].join(" ")}
          >
            <Eye size={10} />
            Visual
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("latex")
              requestAnimationFrame(() => textareaRef.current?.focus())
            }}
            title="Mode LaTeX — edit rumus secara langsung"
            aria-label="Beralih ke mode LaTeX"
            className={[
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all duration-150",
              mode === "latex"
                ? "bg-white text-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            ].join(" ")}
          >
            <Code2 size={10} />
            LaTeX
          </button>
        </div>
      </div>

      {/* Visual mode: click to edit */}
      {mode === "visual" && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleVisualClick}
          onKeyDown={(e) => e.key === "Enter" && handleVisualClick()}
          title="Klik untuk mengedit"
          aria-label="Area preview soal — klik untuk mengedit"
          className={[
            "px-3 py-2.5 min-h-[4.5rem] cursor-text group",
            "hover:bg-blue-50/40 transition-colors duration-150",
          ].join(" ")}
        >
          {isEmpty ? (
            <span className="text-slate-300 text-sm italic select-none">
              {placeholder}
            </span>
          ) : (
            <MathText
              text={value}
              className="text-sm text-slate-800 leading-relaxed"
            />
          )}
          {/* Subtle "click to edit" hint */}
          <span className="block mt-1 text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity select-none">
            Klik untuk edit
          </span>
        </div>
      )}

      {/* LaTeX mode: toolbar + textarea */}
      {mode === "latex" && (
        <div className="relative px-3 pt-2 pb-3 flex flex-col">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            aria-label={ariaLabel ?? "Editor teks soal (LaTeX)"}
            className={[
              "w-full px-0 py-1 text-sm font-mono resize-none outline-none bg-transparent",
              "text-slate-700 placeholder:text-slate-300 leading-relaxed",
              "pr-16", // Make room for the absolute floating button
              textareaClassName,
            ].join(" ")}
          />
          
          {/* Floating Math Toolbar Button positioned at bottom right */}
          <div className="absolute bottom-3 right-3">
            <LatexToolbar
              inputRef={textareaRef as React.RefObject<HTMLTextAreaElement | HTMLInputElement>}
              value={value}
              onChange={onChange}
              placement="top"
            />
          </div>

          <p className="text-[10px] text-slate-400 mt-1 mr-16">
            Gunakan <code className="bg-slate-100 px-1 rounded text-[9px]">$...$</code> atau tombol <strong>Math</strong>.{" "}
            <button
              type="button"
              onClick={() => setMode("visual")}
              className="text-blue-500 hover:underline font-medium"
            >
              Lihat preview
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
