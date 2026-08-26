"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseContent = parseContent;
exports.basename = basename;
exports.resolveLocalImagePaths = resolveLocalImagePaths;
// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────
/** Convert a CSS measurement string like "3.66in" to a pixel value string. */
function inToPx(value) {
    var match = value.match(/^([\d.]+)in$/);
    if (match) {
        var px = Math.round(parseFloat(match[1]) * 96);
        return "".concat(px, "px");
    }
    return value;
}
/** Push a non-empty text node. */
function pushText(nodes, value) {
    if (value)
        nodes.push({ type: "text", value: value });
}
/** True if a line looks like a GFM/pipe-table separator: |---|---| */
function isPipeTableSeparator(line) {
    return /^\|?(?:[ \t]*:?-+:?[ \t]*\|)+[ \t]*:?-*:?[ \t]*$/.test(line.trim());
}
/** True if a line starts and ends with a pipe character (or is a separator). */
function isPipeTableRow(line) {
    var t = line.trim();
    return t.startsWith("|") && t.endsWith("|");
}
/**
 * Parse a single pipe-table row into an array of cell strings.
 * Leading/trailing pipes and whitespace are trimmed; empty outer cells discarded.
 */
function parsePipeRow(line) {
    var inner = line.trim().replace(/^\||\|$/g, "");
    return inner.split("|").map(function (c) { return c.trim(); });
}
// ─────────────────────────────────────────────────────────────────────────────
// Tokeniser patterns
// ─────────────────────────────────────────────────────────────────────────────
var PATTERNS = [
    // ── <br>, <br/>, <br />, \<br/\>, \\<br/>, </br>, etc. ───────────────────
    // The regex uses `\\*` around every structural character to consume any
    // number of spurious backslashes that Pandoc may inject — without touching
    // LaTeX backslashes which always precede a letter/digit (e.g. \frac).
    {
        name: "html-br",
        test: function (s) { return /^\\*<\\*\/?\\*br\s*\\*\/?\\*>\\*/i.test(s); },
        consume: function (s) {
            var m = s.match(/^\\*<\\*\/?\\*br\s*\\*\/?\\*>\\*/i);
            if (!m)
                return null;
            return { node: { type: "linebreak" }, length: m[0].length };
        },
    },
    // ── Pipe table  (must come BEFORE block-math so "| $x$ |" is not split) ──
    // Recognised when the FIRST LINE of remaining is a pipe-table row AND at
    // least one of the consecutive table lines is a separator (|---|---|).
    // We check only the first line in test() so that mid-text tables embedded
    // after "Text before.\n" are correctly detected when remaining starts at "|".
    {
        name: "pipe-table",
        test: function (s) {
            var firstLine = s.split("\n")[0];
            return isPipeTableRow(firstLine);
        },
        consume: function (s) {
            // Collect all contiguous pipe-table lines
            var allLines = s.split("\n");
            var tableLines = [];
            var consumedLen = 0;
            for (var _i = 0, allLines_1 = allLines; _i < allLines_1.length; _i++) {
                var line = allLines_1[_i];
                if (!isPipeTableRow(line) && !isPipeTableSeparator(line))
                    break;
                tableLines.push(line);
                consumedLen += line.length + 1; // +1 for the \n
            }
            // Must have at least 2 lines to be a real table (one header / separator)
            if (tableLines.length < 2)
                return null;
            // Must contain at least one separator line
            if (!tableLines.some(isPipeTableSeparator))
                return null;
            // Parse rows, dropping separator lines
            var rows = tableLines
                .filter(function (l) { return !isPipeTableSeparator(l); })
                .map(parsePipeRow)
                // Drop rows where every cell is empty (e.g. artificial header row |   |   |)
                .filter(function (row) { return row.some(function (cell) { return cell !== ""; }); });
            if (rows.length === 0)
                return null;
            // consumedLen may overshoot by 1 if the last line had no trailing \n
            var actualLen = Math.min(consumedLen, s.length);
            return { node: { type: "table", rows: rows }, length: actualLen };
        },
    },
    // ── Block math \[ ... \] ──────────────────────────────────────────────────
    {
        name: "block-math-backslash",
        test: function (s) { return s.startsWith("\\["); },
        consume: function (s) {
            var end = s.indexOf("\\]", 2);
            if (end === -1)
                return null;
            var latex = s.slice(2, end).trim();
            return { node: { type: "math", mode: "block", latex: latex }, length: end + 2 };
        },
    },
    // ── Block math $$ ... $$ ─────────────────────────────────────────────────
    {
        name: "block-math-dollar",
        test: function (s) { return s.startsWith("$$"); },
        consume: function (s) {
            var end = s.indexOf("$$", 2);
            if (end === -1)
                return null;
            var latex = s.slice(2, end).trim();
            return { node: { type: "math", mode: "block", latex: latex }, length: end + 4 };
        },
    },
    // ── Inline math \( ... \) ─────────────────────────────────────────────────
    {
        name: "inline-math-backslash",
        test: function (s) { return s.startsWith("\\("); },
        consume: function (s) {
            var end = s.indexOf("\\)", 2);
            if (end === -1)
                return null;
            var latex = s.slice(2, end).trim();
            return { node: { type: "math", mode: "inline", latex: latex }, length: end + 2 };
        },
    },
    // ── Inline math $ ... $ (must come AFTER $$ check) ───────────────────────
    {
        name: "inline-math-dollar",
        test: function (s) { return s.startsWith("$") && !s.startsWith("$$"); },
        consume: function (s) {
            var i = 1;
            while (i < s.length) {
                if (s[i] === "$" && s[i - 1] !== "\\") {
                    if (s.slice(i, i + 2) === "$$")
                        break;
                    var latex = s.slice(1, i).trim();
                    if (latex.length > 0) {
                        return { node: { type: "math", mode: "inline", latex: latex }, length: i + 1 };
                    }
                    break;
                }
                i++;
            }
            return null;
        },
    },
    // ── Markdown image ![alt](url){attrs?} ───────────────────────────────────
    {
        name: "md-image",
        test: function (s) { return s.startsWith("!["); },
        consume: function (s) {
            var _a, _b, _c;
            var m = s.match(/^!\[([^\]]*)\]\(\s*([^)]*?)\s*\)(?:\{([^}]*)\})?/);
            if (!m)
                return null;
            var alt = (_a = m[1]) !== null && _a !== void 0 ? _a : "";
            var src = (_b = m[2]) !== null && _b !== void 0 ? _b : "";
            var attrStr = (_c = m[3]) !== null && _c !== void 0 ? _c : "";
            var width;
            var height;
            if (attrStr) {
                var wm = attrStr.match(/width="([^"]+)"/);
                var hm = attrStr.match(/height="([^"]+)"/);
                if (wm)
                    width = inToPx(wm[1]);
                if (hm)
                    height = inToPx(hm[1]);
            }
            return {
                node: { type: "image", src: src, alt: alt, width: width, height: height },
                length: m[0].length,
            };
        },
    },
];
// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Parse a raw content string into an array of ContentNode tokens.
 *
 * This is the single source of truth for all content rendering in the LMS.
 * All visual renderers (MathText, student quiz, preview) must call this first.
 */
function parseContent(raw) {
    if (!raw)
        return [];
    var nodes = [];
    var remaining = raw;
    var textBuffer = "";
    while (remaining.length > 0) {
        var matched = false;
        for (var _i = 0, PATTERNS_1 = PATTERNS; _i < PATTERNS_1.length; _i++) {
            var pattern = PATTERNS_1[_i];
            if (!pattern.test(remaining))
                continue;
            var result = pattern.consume(remaining);
            if (!result)
                continue;
            pushText(nodes, textBuffer);
            textBuffer = "";
            nodes.push(result.node);
            remaining = remaining.slice(result.length);
            matched = true;
            break;
        }
        if (!matched) {
            textBuffer += remaining[0];
            remaining = remaining.slice(1);
        }
    }
    pushText(nodes, textBuffer);
    return expandNewlines(nodes);
}
/**
 * After tokenisation, split text nodes on literal newlines and insert
 * linebreak nodes between them.
 * Table nodes are passed through unchanged — their cells are handled
 * recursively by the renderer.
 */
function expandNewlines(nodes) {
    var result = [];
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        if (node.type !== "text") {
            result.push(node);
            continue;
        }
        var lines = node.value.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if (lines[i] !== "")
                result.push({ type: "text", value: lines[i] });
            if (i < lines.length - 1)
                result.push({ type: "linebreak" });
        }
    }
    return result;
}
// ─────────────────────────────────────────────────────────────────────────────
// Pre-processing utility: replace local image paths with media URLs
// ─────────────────────────────────────────────────────────────────────────────
/** Return just the basename of a path, handling both / and \ separators. */
function basename(path) {
    var _a;
    return (_a = path.replace(/\\/g, "/").split("/").filter(Boolean).pop()) !== null && _a !== void 0 ? _a : path;
}
/**
 * Replace local filesystem paths inside Markdown image syntax with the
 * proper backend media URL.
 *
 * @param text       The raw question_text / option text from the Word parser.
 * @param sessionId  The active import session ID.
 * @param mediaUrl   Resolver function: (sessionId, filename) => url.
 */
function resolveLocalImagePaths(text, sessionId, mediaUrl) {
    return text.replace(/!\[([^\]]*)\]\(\s*([^)]*?)\s*\)(\{[^}]*\})?/g, function (_match, alt, src, attrs) {
        if (attrs === void 0) { attrs = ""; }
        var trimmedSrc = src.trim();
        // Detect local paths: anything that is not a remote URL (http/https) or data URI
        var isLocal = !/^https?:\/\//i.test(trimmedSrc) && !/^data:/i.test(trimmedSrc);
        if (!isLocal)
            return _match;
        var filename = basename(trimmedSrc);
        var resolvedUrl = mediaUrl(sessionId, filename);
        return "![".concat(alt, "](").concat(resolvedUrl, ")").concat(attrs);
    });
}
