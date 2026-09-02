"use client"

import katex from "katex"
import { useMemo } from "react"

interface Segment {
    type: "text" | "inline-math" | "block-math"
    content: string
}

// Pecah string campuran text + LaTeX ($...$ inline, $$...$$ block) jadi segmen.
// Soal hasil pandoc pakai format ini secara native.
function splitSegments(raw: string): Segment[] {
    const segments: Segment[] = []
    // $$...$$ dulu (block), bar $...$ (inline), supaya block tidak ketangkap sebagai 2 inline
    const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g
    let lastIndex = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(raw)) !== null) {
        if (m.index > lastIndex) {
            segments.push({ type: "text", content: raw.slice(lastIndex, m.index) })
        }
        if (m[1] !== undefined) {
            segments.push({ type: "block-math", content: m[1].trim() })
        } else if (m[2] !== undefined) {
            segments.push({ type: "inline-math", content: m[2].trim() })
        }
        lastIndex = re.lastIndex
    }
    if (lastIndex < raw.length) {
        segments.push({ type: "text", content: raw.slice(lastIndex) })
    }
    return segments
}

function renderKatex(latex: string, displayMode: boolean): string {
    try {
        return katex.renderToString(latex, { throwOnError: false, displayMode, strict: "ignore" })
    } catch (error) {
        // Kalau LaTeX-nya rusak, tampilakan raw source dengan warna beda daripada crash seluruh halaman
        return `<span class="text-red-500 font-mono text-xs>[LaTeX error] ${latex}</span>`
    }
}

interface MathTextProps {
    text: string
    className?: string
}
/** Render teks yang mengandung campuran teks biasa + LaTeX inline/block */
export default function MathText({ text, className = "" }: MathTextProps) {
    const segments = useMemo(() => splitSegments(text || ""), [text])

    return (
        <span className={className}>
            {segments.map((seg, i) => {
                if (seg.type === "text") {
                    // Preserve newline dari question_text (soal sering multi-paragraf)
                    return seg.content.split("\n").map((line, li, arr) => (
                        <span key={`${i}-${li}`}>
                            {line}
                            {li < arr.length - 1 && <br />}
                        </span>
                    ))
                }
                const html = renderKatex(seg.content, seg.type === "block-math")
                const Tag = seg.type === "block-math" ? "div" : "span"
                return <Tag key={i} className={seg.type === "block-math" ? "my-2" : ""} dangerouslySetInnerHTML={{ __html: html }} />
            })}
        </span>
    )
}