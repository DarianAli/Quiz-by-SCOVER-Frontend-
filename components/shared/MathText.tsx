"use client"

import katex from "katex"
import { useMemo } from "react"
import { parseContent, type ContentNode } from "@/lib/content-parser"
import { BASE_API_URL } from "@/global"

// ─────────────────────────────────────────────────────────────────────────────
// KaTeX renderer helper
// ─────────────────────────────────────────────────────────────────────────────

function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    })
  } catch {
    return `<span class="text-red-500 font-mono text-xs">[LaTeX error: ${latex}]</span>`
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image renderer
// ─────────────────────────────────────────────────────────────────────────────

function isSafeUrl(src: string): boolean {
  try {
    // Block javascript: and data:text/html XSS vectors
    const lower = src.trim().toLowerCase()
    if (lower.startsWith("javascript:")) return false
    if (lower.startsWith("data:text/html")) return false
    return true
  } catch {
    return false
  }
}

/**
 * If the src is a backend-relative path (starts with /question_image/ or
 * /public/) resolve it against BASE_API_URL so it points to the correct
 * backend server instead of the frontend origin.
 */
function resolveImageSrc(src: string): string {
  const trimmed = src.trim()
  // Already absolute — leave untouched
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) return trimmed
  // Backend-relative paths produced by commitWordImport
  if (trimmed.startsWith("/question_image/") || trimmed.startsWith("/public/question_image/") || trimmed.startsWith("/public/")) {
    return `${BASE_API_URL}${trimmed}`
  }
  return trimmed
}

// ─────────────────────────────────────────────────────────────────────────────
// Table cell renderer — renders a single raw cell string recursively
// ─────────────────────────────────────────────────────────────────────────────

function TableCell({ raw }: { raw: string }) {
  const nodes = useMemo(() => parseContent(raw), [raw])
  return (
    <td className="border border-slate-300 px-3 py-1.5 text-sm whitespace-nowrap">
      {nodes.map((node, i) => renderNode(node, i))}
    </td>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Node renderer
// ─────────────────────────────────────────────────────────────────────────────

function renderNode(node: ContentNode, key: React.Key): React.ReactNode {
  switch (node.type) {
    case "linebreak":
      return <br key={key} />

    case "math": {
      const html = renderKatex(node.latex, node.mode === "block")
      if (node.mode === "block") {
        return (
          <div
            key={key}
            className="my-2 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      }
      return (
        <span
          key={key}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }

    case "image": {
      if (!isSafeUrl(node.src)) return null
      const resolvedSrc = resolveImageSrc(node.src)
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={resolvedSrc}
          alt={node.alt || ""}
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
            // Only apply explicit dimensions if they are safe and non-empty
            ...(node.width ? { width: node.width } : {}),
          }}
          className="rounded-lg my-2 border border-slate-100 object-contain"
        />
      )
    }

    case "table": {
      return (
        <div key={key} className="my-3 overflow-x-auto">
          <table className="border-collapse border border-slate-300 text-sm">
            <tbody>
              {node.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx === 0 ? "bg-slate-50 font-semibold" : ""}>
                  {row.map((cell, cellIdx) => (
                    <TableCell key={cellIdx} raw={cell} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case "text":
      return <span key={key}>{node.value}</span>

    default:
      return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface MathTextProps {
  text: string
  className?: string
}

/**
 * Shared renderer for all content in the LMS that may contain mixed:
 *   - plain text
 *   - line breaks (<br>, <br/>, <br />, \<br/\> and literal \n)
 *   - inline math:  \( ... \)  or  $ ... $
 *   - block math:   \[ ... \]  or  $$ ... $$
 *   - Markdown images: ![alt](url)  or  ![alt](url){width="Xin" height="Yin"}
 *   - Markdown pipe tables: |col|col| rows (cells may contain inline math)
 *
 * SOURCE OF TRUTH — do NOT duplicate this logic.
 * Import from @/components/shared/MathText everywhere.
 *
 * Used by: ImportQuestionPage, QuestionEditorLive, Student Quiz, Review Page.
 */
export default function MathText({ text, className = "" }: MathTextProps) {
  const nodes = useMemo(() => parseContent(text || ""), [text])

  return (
    <span className={className}>
      {nodes.map((node, i) => renderNode(node, i))}
    </span>
  )
}
