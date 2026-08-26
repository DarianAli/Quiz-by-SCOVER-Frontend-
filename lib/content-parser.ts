/**
 * content-parser.ts
 *
 * Canonical content parser for the LMS.
 *
 * Converts a raw content string (which may contain mixed text, HTML line breaks,
 * LaTeX in any supported delimiter, Markdown images, and Markdown pipe-tables)
 * into a typed array of ContentNode objects that can be rendered uniformly by MathText.tsx.
 *
 * Supported input formats
 * ─────────────────────────────────────────────────────────────────────────────
 * Line breaks  : <br>  <br/>  <br />  \<br/\>  etc — converted to { type: "linebreak" }
 * Inline math  : \( ... \)   or   $ ... $   → { type:"math", mode:"inline" }
 * Block math   : \[ ... \]   or   $$ ... $$ → { type:"math", mode:"block" }
 * Images       : ![alt](url)  or  ![alt](url){width="Xin" height="Yin"}
 * Pipe tables  : |col|col|  lines → { type:"table", rows:string[][] }
 * Plain text   : everything else
 *
 * Design rules
 * ─────────────────────────────────────────────────────────────────────────────
 * - No dependencies beyond the stdlib.
 * - Does NOT use dangerouslySetInnerHTML — that is entirely the renderer's job.
 * - Local filesystem paths (e.g. /var/folders/..., C:\...) in image src are
 *   passed through as-is; the *caller* (ImportQuestionsPage) is responsible for
 *   replacing them with proper media URLs before storing / rendering.
 * - Escape sequences inside math are preserved verbatim so that \frac, \sqrt,
 *   etc. reach KaTeX intact. Only the *delimiter* escapes (\( \) \[ \]) are
 *   stripped.
 * - Table cells that themselves contain LaTeX are passed as raw strings and
 *   rendered recursively by the table renderer (MathText).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ContentNode =
  | { type: "text"; value: string }
  | { type: "linebreak" }
  | { type: "math"; mode: "inline" | "block"; latex: string }
  | { type: "image"; src: string; alt: string; width?: string; height?: string }
  | { type: "table"; rows: string[][] }

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a CSS measurement string like "3.66in" to a pixel value string. */
function inToPx(value: string): string {
  const match = value.match(/^([\d.]+)in$/)
  if (match) {
    const px = Math.round(parseFloat(match[1]) * 96)
    return `${px}px`
  }
  return value
}

/** Push a non-empty text node. */
function pushText(nodes: ContentNode[], value: string): void {
  if (value) nodes.push({ type: "text", value })
}

/** True if a line looks like a GFM/pipe-table separator: |---|---| */
function isPipeTableSeparator(line: string): boolean {
  return /^\|?(?:[ \t]*:?-+:?[ \t]*\|)+[ \t]*:?-*:?[ \t]*$/.test(line.trim())
}

/** True if a line starts and ends with a pipe character (or is a separator). */
function isPipeTableRow(line: string): boolean {
  const t = line.trim()
  return t.startsWith("|") && t.endsWith("|")
}

/**
 * Parse a single pipe-table row into an array of cell strings.
 * Leading/trailing pipes and whitespace are trimmed; empty outer cells discarded.
 */
function parsePipeRow(line: string): string[] {
  const inner = line.trim().replace(/^\||\|$/g, "")
  return inner.split("|").map((c) => c.trim())
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokeniser patterns
// ─────────────────────────────────────────────────────────────────────────────

const PATTERNS: Array<{
  name: string
  test: (s: string) => boolean
  consume: (s: string) => { node: ContentNode; length: number } | null
}> = [
  // ── <br>, <br/>, <br />, \<br/>\, \\<br/>, </br>, /<br />, etc. ───────────────────
  // The regex uses `[\\/]*` around every structural character to consume any
  // number of spurious backslashes OR forward-slashes that Pandoc may inject —
  // without touching LaTeX backslashes which always precede a letter/digit (e.g. \frac).
  {
    name: "html-br",
    test: (s) => /^[\\\/]*<[\\\/]*\/?[\\\/]*br\s*[\\\/]*\/?[\\\/]*>[\\\/]*/i.test(s),
    consume: (s) => {
      const m = s.match(/^[\\\/]*<[\\\/]*\/?[\\\/]*br\s*[\\\/]*\/?[\\\/]*>[\\\/]*/i)
      if (!m) return null
      return { node: { type: "linebreak" }, length: m[0].length }
    },
  },

  // ── Pipe table  (must come BEFORE block-math so "| $x$ |" is not split) ──
  // Recognised when the FIRST LINE of remaining is a pipe-table row AND at
  // least one of the consecutive table lines is a separator (|---|---|).
  // We check only the first line in test() so that mid-text tables embedded
  // after "Text before.\n" are correctly detected when remaining starts at "|".
  {
    name: "pipe-table",
    test: (s) => {
      const firstLine = s.split("\n")[0]
      return isPipeTableRow(firstLine)
    },
    consume: (s) => {
      // Collect all contiguous pipe-table lines
      const allLines = s.split("\n")
      const tableLines: string[] = []
      let consumedLen = 0

      for (const line of allLines) {
        if (!isPipeTableRow(line) && !isPipeTableSeparator(line)) break
        tableLines.push(line)
        consumedLen += line.length + 1 // +1 for the \n
      }

      // Must have at least 2 lines to be a real table (one header / separator)
      if (tableLines.length < 2) return null

      // Must contain at least one separator line
      if (!tableLines.some(isPipeTableSeparator)) return null

      // Parse rows, dropping separator lines
      const rows = tableLines
        .filter((l) => !isPipeTableSeparator(l))
        .map(parsePipeRow)
        // Drop rows where every cell is empty (e.g. artificial header row |   |   |)
        .filter((row) => row.some((cell) => cell !== ""))

      if (rows.length === 0) return null

      // consumedLen may overshoot by 1 if the last line had no trailing \n
      const actualLen = Math.min(consumedLen, s.length)
      return { node: { type: "table", rows }, length: actualLen }
    },
  },

  // ── Block math \[ ... \] ──────────────────────────────────────────────────
  {
    name: "block-math-backslash",
    test: (s) => s.startsWith("\\["),
    consume: (s) => {
      const end = s.indexOf("\\]", 2)
      if (end === -1) return null
      const latex = s.slice(2, end).trim()
      return { node: { type: "math", mode: "block", latex }, length: end + 2 }
    },
  },

  // ── Block math $$ ... $$ ─────────────────────────────────────────────────
  {
    name: "block-math-dollar",
    test: (s) => s.startsWith("$$"),
    consume: (s) => {
      const end = s.indexOf("$$", 2)
      if (end === -1) return null
      const latex = s.slice(2, end).trim()
      return { node: { type: "math", mode: "block", latex }, length: end + 4 }
    },
  },

  // ── Inline math \( ... \) ─────────────────────────────────────────────────
  {
    name: "inline-math-backslash",
    test: (s) => s.startsWith("\\("),
    consume: (s) => {
      const end = s.indexOf("\\)", 2)
      if (end === -1) return null
      const latex = s.slice(2, end).trim()
      return { node: { type: "math", mode: "inline", latex }, length: end + 2 }
    },
  },

  // ── Inline math $ ... $ (must come AFTER $$ check) ───────────────────────
  {
    name: "inline-math-dollar",
    test: (s) => s.startsWith("$") && !s.startsWith("$$"),
    consume: (s) => {
      let i = 1
      while (i < s.length) {
        if (s[i] === "$" && s[i - 1] !== "\\") {
          if (s.slice(i, i + 2) === "$$") break
          const latex = s.slice(1, i).trim()
          if (latex.length > 0) {
            return { node: { type: "math", mode: "inline", latex }, length: i + 1 }
          }
          break
        }
        i++
      }
      return null
    },
  },

  // ── Markdown image ![alt](url){attrs?} ───────────────────────────────────
  {
    name: "md-image",
    test: (s) => s.startsWith("!["),
    consume: (s) => {
      const m = s.match(/^!\[([^\]]*)\]\(\s*([^)]*?)\s*\)(?:\{([^}]*)\})?/)
      if (!m) return null

      const alt = m[1] ?? ""
      const src = m[2] ?? ""
      const attrStr = m[3] ?? ""

      let width: string | undefined
      let height: string | undefined

      if (attrStr) {
        const wm = attrStr.match(/width="([^"]+)"/)
        const hm = attrStr.match(/height="([^"]+)"/)
        if (wm) width = inToPx(wm[1])
        if (hm) height = inToPx(hm[1])
      }

      return {
        node: { type: "image", src, alt, width, height },
        length: m[0].length,
      }
    },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a raw content string into an array of ContentNode tokens.
 *
 * This is the single source of truth for all content rendering in the LMS.
 * All visual renderers (MathText, student quiz, preview) must call this first.
 */
export function parseContent(raw: string): ContentNode[] {
  if (!raw) return []

  const nodes: ContentNode[] = []
  let remaining = raw
  let textBuffer = ""

  while (remaining.length > 0) {
    let matched = false

    for (const pattern of PATTERNS) {
      if (!pattern.test(remaining)) continue

      const result = pattern.consume(remaining)
      if (!result) continue

      pushText(nodes, textBuffer)
      textBuffer = ""

      nodes.push(result.node)
      remaining = remaining.slice(result.length)
      matched = true
      break
    }

    if (!matched) {
      textBuffer += remaining[0]
      remaining = remaining.slice(1)
    }
  }

  pushText(nodes, textBuffer)
  return expandNewlines(nodes)
}

/**
 * After tokenisation, split text nodes on literal newlines and insert
 * linebreak nodes between them.
 * Table nodes are passed through unchanged — their cells are handled
 * recursively by the renderer.
 */
function expandNewlines(nodes: ContentNode[]): ContentNode[] {
  const result: ContentNode[] = []
  for (const node of nodes) {
    if (node.type !== "text") {
      result.push(node)
      continue
    }
    const lines = node.value.split("\n")
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] !== "") result.push({ type: "text", value: lines[i] })
      if (i < lines.length - 1) result.push({ type: "linebreak" })
    }
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-processing utility: replace local image paths with media URLs
// ─────────────────────────────────────────────────────────────────────────────

/** Return just the basename of a path, handling both / and \ separators. */
export function basename(path: string): string {
  return path.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? path
}

/**
 * Replace local filesystem paths inside Markdown image syntax with the
 * proper backend media URL.
 *
 * @param text       The raw question_text / option text from the Word parser.
 * @param sessionId  The active import session ID.
 * @param mediaUrl   Resolver function: (sessionId, filename) => url.
 */
export function resolveLocalImagePaths(
  text: string,
  sessionId: string,
  mediaUrl: (sessionId: string, filename: string) => string,
): string {
  return text.replace(
    /!\[([^\]]*)\]\(\s*([^)]*?)\s*\)(\{[^}]*\})?/g,
    (_match, alt: string, src: string, attrs: string = "") => {
      const trimmedSrc = src.trim()
      // Detect local paths: anything that is not a remote URL (http/https) or data URI
      const isLocal = !/^https?:\/\//i.test(trimmedSrc) && !/^data:/i.test(trimmedSrc)
      if (!isLocal) return _match
      const filename = basename(trimmedSrc)
      const resolvedUrl = mediaUrl(sessionId, filename)
      return `![${alt}](${resolvedUrl})${attrs}`
    }
  )
}
