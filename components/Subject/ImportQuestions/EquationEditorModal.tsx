"use client";

import { useRef, useState, useEffect } from "react";
import { X, Undo2, Redo2 } from "lucide-react";
import MathText from "./MathText";
import { group } from "console";

interface ToolbarGroup {
  label: string;
  symbols: { display: string; insert: string; cursorOffset?: number }[];
}

// cursorOffset: dari akhir string yang di-insert, mundur berapa karakter buat naruh cursor
// (mis. \frac{}{} -> mau cursor di dalam { } pertama)
const TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    label: "Basic",
    symbols: [
      { display: "−", insert: "-" },
      { display: "×", insert: "\\times " },
      { display: "÷", insert: "\\div " },
      { display: "=", insert: "=" },
      { display: "≠", insert: "\\neq " },
      { display: "≈", insert: "\\approx " },
      { display: "≤", insert: "\\leq " },
      { display: "≥", insert: "\\geq " },
    ],
  },
  {
    label: "Fractions",
    symbols: [
      { display: "□/□", insert: "\\frac{}{}", cursorOffset: 3 },
      { display: "Mixed", insert: "{}\\frac{}{}", cursorOffset: 6 },
    ],
  },
  {
    label: "Roots & Power",
    symbols: [
      { display: "√", insert: "\\sqrt{}", cursorOffset: 1 },
      { display: "³√", insert: "\\sqrt[3]{}", cursorOffset: 1 },
      { display: "ⁿ√", insert: "\\sqrt[n]{}", cursorOffset: 1 },
      { display: "x²", insert: "^2" },
      { display: "xⁿ", insert: "^{}", cursorOffset: 1 },
      { display: "xₙ", insert: "_{}", cursorOffset: 1 },
    ],
  },
  {
    label: "Greek",
    symbols: [
      { display: "α", insert: "\\alpha " },
      { display: "β", insert: "\\beta " },
      { display: "γ", insert: "\\gamma " },
      { display: "δ", insert: "\\delta " },
      { display: "θ", insert: "\\theta " },
      { display: "λ", insert: "\\lambda " },
      { display: "μ", insert: "\\mu " },
      { display: "π", insert: "\\pi " },
      { display: "σ", insert: "\\sigma " },
      { display: "Ω", insert: "\\Omega " },
    ],
  },
  {
    label: "Calculus",
    symbols: [
      { display: "∫", insert: "\\int " },
      { display: "∬", insert: "\\iint " },
      { display: "∮", insert: "\\oint " },
      { display: "∂", insert: "\\partial " },
      { display: "lim", insert: "\\lim_{x \\to }", cursorOffset: 2 },
      { display: "∞", insert: "\\infty " },
      { display: "Σ", insert: "\\sum_{i=1}^{n} " },
      { display: "Π", insert: "\\prod_{i=1}^{n} " },
    ],
  },
  {
    label: "Sets",
    symbols: [
      { display: "∈", insert: "\\in " },
      { display: "∉", insert: "\\notin " },
      { display: "⊂", insert: "\\subset " },
      { display: "⊆", insert: "\\subseteq " },
      { display: "∪", insert: "\\cup " },
      { display: "∩", insert: "\\cap " },
      { display: "∅", insert: "\\emptyset " },
    ],
  },
  {
    label: "Logic",
    symbols: [
      { display: "∀", insert: "\\forall " },
      { display: "∃", insert: "\\exists " },
      { display: "⇒", insert: "\\Rightarrow " },
      { display: "⇔", insert: "\\Leftrightarrow " },
      { display: "¬", insert: "\\neg " },
      { display: "∧", insert: "\\land " },
      { display: "∨", insert: "\\lor " },
    ],
  },
  {
    label: "Brackets & Arrows",
    symbols: [
      { display: "( )", insert: "()", cursorOffset: 1 },
      { display: "[ ]", insert: "[]", cursorOffset: 1 },
      { display: "{ }", insert: "\\{\\}", cursorOffset: 2 },
      { display: "| |", insert: "||", cursorOffset: 1 },
      { display: "→", insert: "\\to " },
      { display: "←", insert: "\\leftarrow " },
      { display: "↑", insert: "\\uparrow " },
      { display: "↓", insert: "\\downarrow " },
    ],
  },
  {
    label: "Matrix",
    symbols: [
      {
        display: "2×2",
        insert: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
      },
    ],
  },
];

interface EquationEditorModalProps {
    isOpen: boolean
    initialLatex: string
    onClose: () => void
    onSave: (latex: string) => void
}

export default function EquationEditorMOdal({ isOpen, initialLatex, onClose, onSave }: EquationEditorModalProps) {
    const [value, setValue] = useState(initialLatex)
    const [history, setHistory] = useState<string[]>([initialLatex])
    const [historyIndex, setHistoryIndex] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isOpen) {
            setValue(initialLatex)
            setHistory([initialLatex])
            setHistoryIndex(0)
        }
    }, [isOpen, initialLatex])

    if (!isOpen) return null
    
    const pushHistory = (next: string) => {
        const truncated = history.slice(0, historyIndex + 1)
        const newHistory = [...truncated, next]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
        setValue(next)
    }

    const undo = () => {
        if (historyIndex === 0) return
        setHistoryIndex(historyIndex - 1)
        setValue(history[historyIndex - 1])
    }
    
    const redo = () => {
        if (historyIndex >= history.length -1) return
        setHistoryIndex(historyIndex + 1)
        setValue(history[historyIndex + 1])
    }

    const insertAtCursor = (snippet: string, cursorOffset?: number) => {
        const ta = textareaRef.current
        if (!ta) return
        const start = ta.selectionStart ?? value.length
        const end = ta.selectionEnd ?? value.length
        const next = value.slice(0, start) + snippet + value.slice(end)
        pushHistory(next)

        requestAnimationFrame(() => {
            const caretPos = cursorOffset !== undefined ? start + snippet.length - cursorOffset : start + snippet.length
            ta.focus()
            ta.setSelectionRange(caretPos, caretPos)
        })
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Equation Editor</h3>
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={undo} 
                            disabled={historyIndex === 0} 
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                            arial-label="Undo"
                        >
                            <Undo2 size={16}/>
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1} 
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                            arial-label="Redo"
                        >
                            <Redo2 size={16}/>
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="border-b border-slate-100 px-5 py-3 overflow-x-auto">
                    <div className="flex gap-4">
                        {TOOLBAR_GROUPS.map((group) => (
                            <div key={group.label} className="flex-shrink-0">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
                                    {group.label}
                                </p>
                                <div className="flex gap-1 flex-wrap max-w-[220px]">
                                    {group.symbols.map((sym) => (
                                        <button
                                            key={sym.display}
                                            type="button"
                                            onClick={() => insertAtCursor(sym.insert, sym.cursorOffset)}
                                            className="w-8 h-8 rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
                                            title={sym.insert}
                                        >
                                            {sym.display}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor + Preview split */}
                <div className="flex-1 grid grid-cols-2 gap-0 min-h-[280px] overflow-hidden">
                    <div className="border-r border-slate-100 p-4 flex flex-col">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">LaTeX Source</p>
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => pushHistory(e.target.value)}
                            spellCheck={false}
                            className="flex-1 w-full resize-none rounded-xl border border-slate-200 p-3 font-mono text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                            placeholder="\frac{1}{2} + \sqrt{x}"
                        />
                    </div>
                    <div className="p-4 flex flex-col overflow-y-auto">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Live Preview</p>
                        <div className="flex-1 rounded-xl border border-dashed border-slate-200 p-4 flex items-center justify-center text-lg">
                            {value.trim() ? <MathText text={`$${value}$`} /> : <span className="text-sm text-slate-300">Preview akan muncul di sini</span>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                    <button onClick={onClose} className="px-4 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(value)}
                        className="px-4 h-9 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    )
}
