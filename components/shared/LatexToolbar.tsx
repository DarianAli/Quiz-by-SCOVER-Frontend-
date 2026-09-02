import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, FunctionSquare, X } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LatexSnippet {
  label: string
  tooltip: string
  snippet: string
  cursorOffset: number
}

interface Category {
  id: string
  label: string
  snippets: LatexSnippet[]
}

// ─── Snippet Data ──────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "basic",
    label: "Basic",
    snippets: [
      { label: "+", tooltip: "Tambah", snippet: "+", cursorOffset: 0 },
      { label: "−", tooltip: "Kurang", snippet: "−", cursorOffset: 0 },
      { label: "×", tooltip: "Kali", snippet: "×", cursorOffset: 0 },
      { label: "÷", tooltip: "Bagi", snippet: "÷", cursorOffset: 0 },
      { label: "=", tooltip: "Sama Dengan", snippet: "=", cursorOffset: 0 },
      { label: "≠", tooltip: "Tidak Sama Dengan", snippet: "≠", cursorOffset: 0 },
      { label: "±", tooltip: "Plus Minus", snippet: "±", cursorOffset: 0 },
    ],
  },
  {
    id: "fractions",
    label: "Fractions",
    snippets: [
      {
        label: "a/b",
        tooltip: "Pecahan  →  \\frac{a}{b}",
        snippet: "$\\frac{{SELECTION}}{b}$",
        cursorOffset: -3,
      },
    ],
  },
  {
    id: "powers",
    label: "Powers & Roots",
    snippets: [
      { label: "x²", tooltip: "Kuadrat", snippet: "{SELECTION}^{2}", cursorOffset: 0 },
      { label: "xⁿ", tooltip: "Pangkat n", snippet: "{SELECTION}^{n}", cursorOffset: -2 },
      { label: "xₙ", tooltip: "Indeks bawah", snippet: "{SELECTION}_{n}", cursorOffset: -2 },
      { label: "xⁿₘ", tooltip: "Pangkat & Indeks", snippet: "{SELECTION}_{m}^{n}", cursorOffset: -4 },
      { label: "√x", tooltip: "Akar kuadrat", snippet: "$\\sqrt{{SELECTION}}$", cursorOffset: -2 },
      { label: "∛x", tooltip: "Akar kubik", snippet: "$\\sqrt[3]{{SELECTION}}$", cursorOffset: -2 },
      { label: "ⁿ√x", tooltip: "Akar ke-n", snippet: "$\\sqrt[n]{{SELECTION}}$", cursorOffset: -2 },
    ],
  },
  {
    id: "comparison",
    label: "Comparison",
    snippets: [
      { label: "<", tooltip: "Kurang dari", snippet: "<", cursorOffset: 0 },
      { label: ">", tooltip: "Lebih dari", snippet: ">", cursorOffset: 0 },
      { label: "≤", tooltip: "Kurang dari atau sama dengan", snippet: "≤", cursorOffset: 0 },
      { label: "≥", tooltip: "Lebih dari atau sama dengan", snippet: "≥", cursorOffset: 0 },
      { label: "≈", tooltip: "Hampir sama", snippet: "≈", cursorOffset: 0 },
      { label: "≡", tooltip: "Identik", snippet: "≡", cursorOffset: 0 },
    ],
  },
  {
    id: "greek",
    label: "Greek",
    snippets: [
      { label: "π", tooltip: "Pi", snippet: "π", cursorOffset: 0 },
      { label: "α", tooltip: "Alpha", snippet: "α", cursorOffset: 0 },
      { label: "β", tooltip: "Beta", snippet: "β", cursorOffset: 0 },
      { label: "γ", tooltip: "Gamma", snippet: "γ", cursorOffset: 0 },
      { label: "θ", tooltip: "Theta", snippet: "θ", cursorOffset: 0 },
      { label: "λ", tooltip: "Lambda", snippet: "λ", cursorOffset: 0 },
      { label: "μ", tooltip: "Mu", snippet: "μ", cursorOffset: 0 },
      { label: "σ", tooltip: "Sigma", snippet: "σ", cursorOffset: 0 },
      { label: "ω", tooltip: "Omega", snippet: "ω", cursorOffset: 0 },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    snippets: [
      { label: "∞", tooltip: "Tak Hingga", snippet: "∞", cursorOffset: 0 },
      { label: "°", tooltip: "Derajat", snippet: "°", cursorOffset: 0 },
      { label: "%", tooltip: "Persen", snippet: "%", cursorOffset: 0 },
      { label: "|x|", tooltip: "Nilai Mutlak", snippet: "|{SELECTION}|", cursorOffset: -1 },
      { label: "vec", tooltip: "Vektor", snippet: "$\\vec{{SELECTION}}$", cursorOffset: -2 },
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    snippets: [
      { label: "∑", tooltip: "Sigma / Jumlah", snippet: "$\\sum_{i=1}^{n}$", cursorOffset: 0 },
      { label: "∏", tooltip: "Produk", snippet: "$\\prod_{i=1}^{n}$", cursorOffset: 0 },
      { label: "∫", tooltip: "Integral", snippet: "$\\int_{a}^{b}$", cursorOffset: 0 },
      { label: "lim", tooltip: "Limit", snippet: "$\\lim_{x \\to {SELECTION}}$", cursorOffset: -2 },
      { label: "∂", tooltip: "Turunan Parsial", snippet: "$\\partial$", cursorOffset: 0 },
      { label: "log", tooltip: "Logaritma", snippet: "$\\log$", cursorOffset: 0 },
      { label: "ln", tooltip: "Logaritma Natural", snippet: "$\\ln$", cursorOffset: 0 },
    ],
  },
  {
    id: "sets",
    label: "Sets",
    snippets: [
      { label: "∈", tooltip: "Anggota Himpunan", snippet: "∈", cursorOffset: 0 },
      { label: "∉", tooltip: "Bukan Anggota", snippet: "∉", cursorOffset: 0 },
      { label: "⊂", tooltip: "Himpunan Bagian", snippet: "⊂", cursorOffset: 0 },
      { label: "⊆", tooltip: "Himpunan Bagian/Sama", snippet: "⊆", cursorOffset: 0 },
      { label: "∪", tooltip: "Gabungan", snippet: "∪", cursorOffset: 0 },
      { label: "∩", tooltip: "Irisan", snippet: "∩", cursorOffset: 0 },
      { label: "∅", tooltip: "Himpunan Kosong", snippet: "∅", cursorOffset: 0 },
    ],
  },
  {
    id: "trigo",
    label: "Trigonometry",
    snippets: [
      { label: "sin", tooltip: "Sinus", snippet: "$\\sin$", cursorOffset: 0 },
      { label: "cos", tooltip: "Cosinus", snippet: "$\\cos$", cursorOffset: 0 },
      { label: "tan", tooltip: "Tangen", snippet: "$\\tan$", cursorOffset: 0 },
    ],
  },
  {
    id: "presets",
    label: "Presets",
    snippets: [
      {
        label: "abc formula",
        tooltip: "Rumus ABC",
        snippet: "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
        cursorOffset: 0,
      },
    ],
  },
]

// ─── Core insertion logic ──────────────────────────────────────────────────────

function insertSnippet(
  currentValue: string,
  selStart: number,
  selEnd: number,
  snippetDef: LatexSnippet,
): { newValue: string; newCursor: number } {
  const selectedText = currentValue.slice(selStart, selEnd)
  const before = currentValue.slice(0, selStart)
  const after = currentValue.slice(selEnd)

  const DEFAULTS: Record<string, string> = {
    "$\\frac{{SELECTION}}{b}$": "a",
    "$\\sqrt{{SELECTION}}$": "x",
    "$\\sqrt[3]{{SELECTION}}$": "x",
    "$\\sqrt[n]{{SELECTION}}$": "x",
    "{SELECTION}^{2}": "x",
    "{SELECTION}^{n}": "x",
    "{SELECTION}_{n}": "x",
    "{SELECTION}_{m}^{n}": "x",
    "|{SELECTION}|": "x",
    "$\\lim_{x \\to {SELECTION}}$": "a",
    "$\\vec{{SELECTION}}$": "v",
  }

  let resolvedSnippet = snippetDef.snippet

  if (resolvedSnippet.includes("{SELECTION}")) {
    if (selectedText) {
      const needsParens =
        (resolvedSnippet.includes("^{") || resolvedSnippet.includes("_{")) &&
        resolvedSnippet.startsWith("{SELECTION}") &&
        /[\s+\-*/]/.test(selectedText)
      resolvedSnippet = resolvedSnippet.replace(
        "{SELECTION}",
        needsParens ? `(${selectedText})` : selectedText,
      )
    } else {
      resolvedSnippet = resolvedSnippet.replace(
        "{SELECTION}",
        DEFAULTS[snippetDef.snippet] ?? "",
      )
    }
  }

  const newValue = before + resolvedSnippet + after
  const insertionEnd = selStart + resolvedSnippet.length
  const newCursor =
    snippetDef.cursorOffset === 0
      ? insertionEnd
      : insertionEnd + snippetDef.cursorOffset

  return { newValue, newCursor }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LatexToolbarProps {
  inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>
  value: string
  onChange: (newValue: string) => void
  /** Controls if the popover opens upwards or downwards */
  placement?: "top" | "bottom"
}

export default function LatexToolbar({
  inputRef,
  value,
  onChange,
  placement = "top",
}: LatexToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id)
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({})
  
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  
  // Ref to hold the cursor selection at the exact moment the button is clicked
  const selRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })

  const updatePosition = useCallback(() => {
    if (!isOpen || !containerRef.current) return

    const btnRect = containerRef.current.getBoundingClientRect()
    // Define popover dimensions explicitly or read from ref if rendered
    const POPOVER_WIDTH = 320
    const POPOVER_HEIGHT = 280 // approx max height
    
    let top = 0
    let left = 0
    
    // Default to placement preference
    if (placement === "top") {
      top = btnRect.top - POPOVER_HEIGHT - 8
    } else {
      top = btnRect.bottom + 8
    }

    // Collision detection: Y-Axis (flip if needed)
    if (placement === "top" && top < 0 && btnRect.bottom + POPOVER_HEIGHT + 8 <= window.innerHeight) {
      // Not enough space above, but enough space below -> flip to bottom
      top = btnRect.bottom + 8
    } else if (placement === "bottom" && btnRect.bottom + POPOVER_HEIGHT + 8 > window.innerHeight && btnRect.top - POPOVER_HEIGHT - 8 >= 0) {
      // Not enough space below, but enough space above -> flip to top
      top = btnRect.top - POPOVER_HEIGHT - 8
    }
    
    // Position X-Axis (align right by default since button is usually on the right)
    left = btnRect.right - POPOVER_WIDTH
    
    // Collision detection: X-Axis (keep in viewport)
    if (left < 8) {
      left = 8
    } else if (left + POPOVER_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - POPOVER_WIDTH - 8
    }

    setPopoverStyle({
      position: "fixed", // relative to viewport
      top: `${top}px`,
      left: `${left}px`,
      width: `${POPOVER_WIDTH}px`,
      zIndex: 99999, // Ensure it's above everything
    })
  }, [isOpen, placement])

  // Outside click and scroll listener
  useEffect(() => {
    if (!isOpen) return

    updatePosition()

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside both the trigger button and the popover
      const isOutsideBtn = containerRef.current && !containerRef.current.contains(e.target as Node)
      const isOutsidePopover = popoverRef.current && !popoverRef.current.contains(e.target as Node)
      
      if (isOutsideBtn && isOutsidePopover) {
        setIsOpen(false)
      }
    }
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    // Use capture phase for scroll so we catch scrolls on any overflow container
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, updatePosition])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault() // prevent textarea blur before we capture selection
    if (!isOpen) {
      // Capture selection exactly when opening
      const el = inputRef.current
      selRef.current = {
        start: el?.selectionStart ?? value.length,
        end: el?.selectionEnd ?? value.length,
      }
    }
    setIsOpen(!isOpen)
  }

  const handleSnippetClick = (snippetDef: LatexSnippet) => {
    // If the input happens to still be focused, read fresh selection,
    // otherwise use the snapshot taken when we opened the popover.
    const el = inputRef.current
    const activeDocElement = typeof document !== 'undefined' ? document.activeElement : null
    
    let start = selRef.current.start
    let end = selRef.current.end
    
    if (el && activeDocElement === el) {
       start = el.selectionStart ?? start
       end = el.selectionEnd ?? end
    }

    const { newValue, newCursor } = insertSnippet(value, start, end, snippetDef)
    onChange(newValue)
    
    // Close popover immediately upon insertion for a clean UX
    setIsOpen(false)

    // Restore focus and cursor
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(newCursor, newCursor)
    })
  }

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0]

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        onMouseDown={(e) => e.preventDefault()} // prevent focus loss on mousedown
        aria-label="Sisipkan rumus matematika"
        aria-expanded={isOpen}
        title="Sisipkan Rumus Matematika"
        className={[
          "flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 shadow-sm border",
          isOpen 
            ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/20" 
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300",
        ].join(" ")}
      >
        <FunctionSquare size={13} strokeWidth={2.5} />
        <span>Math</span>
      </button>

      {/* Popover Rendered via Portal */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          style={popoverStyle}
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss while clicking around popover
          className="bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
        >
          {/* Header & Close */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Math Equation
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Categories Sidebar/TopNav */}
          <div className="flex flex-col sm:flex-row">
            {/* Left Nav (Desktop) / Top Nav (Mobile) */}
            <div className="flex sm:flex-col sm:w-[110px] overflow-x-auto sm:overflow-y-auto sm:max-h-[220px] border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50 p-1 gap-0.5 hide-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={[
                    "text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
                    activeCategory === cat.id
                      ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                  ].join(" ")}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Snippets Area */}
            <div className="flex-1 p-2 bg-white max-h-[220px] overflow-y-auto min-h-[140px]">
              <div className="flex flex-wrap gap-1.5 content-start">
                {currentCategory.snippets.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    title={s.tooltip}
                    onClick={() => handleSnippetClick(s)}
                    className="inline-flex items-center justify-center h-8 min-w-[2.5rem] px-2.5 rounded-md text-[13px] font-medium font-mono border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95 active:bg-blue-100 transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
