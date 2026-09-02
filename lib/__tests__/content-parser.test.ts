/**
 * Tests for lib/content-parser.ts
 *
 * Run with: npx ts-node -e "require('./lib/__tests__/content-parser.test')"
 * (Inline runner — no jest dependency needed)
 */

import { parseContent, resolveLocalImagePaths } from "../content-parser"

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅  ${name}`)
    passed++
  } catch (err: any) {
    console.error(`  ❌  ${name}`)
    console.error(`       ${err.message}`)
    failed++
  }
}

function expect(actual: unknown) {
  return {
    toEqual(expected: unknown) {
      const a = JSON.stringify(actual)
      const b = JSON.stringify(expected)
      if (a !== b) throw new Error(`Expected:\n  ${b}\nGot:\n  ${a}`)
    },
    toBe(expected: unknown) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    },
    toContain(expected: unknown) {
      if (typeof actual === "string" && typeof expected === "string") {
        if (!actual.includes(expected))
          throw new Error(`Expected string to contain "${expected}", got "${actual}"`)
      } else if (Array.isArray(actual)) {
        if (!actual.includes(expected))
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}`)
      } else {
        throw new Error("toContain only supported on string or array")
      }
    },
  }
}

console.log("\n=== content-parser tests ===\n")

// ── Test 1: <br/> → linebreak ────────────────────────────────────────────────
test("Test 1 – <br/> becomes a linebreak node", () => {
  const nodes = parseContent("Hello<br/>World")
  expect(nodes).toEqual([
    { type: "text", value: "Hello" },
    { type: "linebreak" },
    { type: "text", value: "World" },
  ])
})

// ── Test 1b: <br> and <br /> ─────────────────────────────────────────────────
test("Test 1b – <br> and <br /> also become linebreak nodes", () => {
  const nodes = parseContent("A<br>B<br />C")
  const breaks = nodes.filter(n => n.type === "linebreak").length
  expect(breaks).toBe(2)
})

// ── Test 2: \( ... \) → inline math ─────────────────────────────────────────
test("Test 2 – \\( x^2 + y^2 \\) is inline math", () => {
  const nodes = parseContent("\\(x^2 + y^2\\)")
  expect(nodes).toEqual([
    { type: "math", mode: "inline", latex: "x^2 + y^2" },
  ])
})

// ── Test 2b: $ ... $ → inline math ──────────────────────────────────────────
test("Test 2b – $x^2$ is inline math", () => {
  const nodes = parseContent("$x^2$")
  expect(nodes).toEqual([
    { type: "math", mode: "inline", latex: "x^2" },
  ])
})

// ── Test 3: \[ ... \] → block math ──────────────────────────────────────────
test("Test 3 – \\[ ... \\] is block math", () => {
  const nodes = parseContent("\\[\nx^2 + y^2 = z^2\n\\]")
  expect(nodes).toEqual([
    { type: "math", mode: "block", latex: "x^2 + y^2 = z^2" },
  ])
})

// ── Test 3b: $$ ... $$ → block math ─────────────────────────────────────────
test("Test 3b – $$...$$ is block math", () => {
  const nodes = parseContent("$$x^2$$")
  expect(nodes).toEqual([
    { type: "math", mode: "block", latex: "x^2" },
  ])
})

// ── Test 4: Basic Markdown image ─────────────────────────────────────────────
test("Test 4 – ![test](https://example.com/img.png) is an image node", () => {
  const nodes = parseContent("![test](https://example.com/img.png)")
  expect(nodes).toEqual([
    { type: "image", src: "https://example.com/img.png", alt: "test" },
  ])
})

// ── Test 5: Markdown image with dimensions ───────────────────────────────────
test("Test 5 – ![img](url){width=\"3in\" height=\"2in\"} has correct px dimensions", () => {
  const nodes = parseContent('![img](https://example.com/img.png){width="3in" height="2in"}')
  expect(nodes).toEqual([
    {
      type: "image",
      src: "https://example.com/img.png",
      alt: "img",
      width: "288px",
      height: "192px",
    },
  ])
})

// ── Test 6: Mixed content ─────────────────────────────────────────────────────
test("Test 6 – Mixed text / math / image / linebreak all parse correctly", () => {
  const raw = "Normal text\n\\(x^2\\)\n![image](https://example.com/img.png)\nMore text"
  const nodes = parseContent(raw)
  const types = nodes.map(n => n.type)
  expect(types).toContain("text")
  expect(types).toContain("math")
  expect(types).toContain("image")
  expect(types).toContain("linebreak")
})

// ── Test 7: \(1\) and \(2\) → inline math (not raw text) ────────────────────
test("Test 7 – \\(1\\) renders as inline math with latex '1'", () => {
  const nodes = parseContent("\\(1\\) Statement one\n\\(2\\) Statement two")
  const mathNodes = nodes.filter(n => n.type === "math")
  expect(mathNodes.length).toBe(2)
  if (mathNodes[0].type === "math") expect(mathNodes[0].latex).toBe("1")
  if (mathNodes[1].type === "math") expect(mathNodes[1].latex).toBe("2")
})

// ── Test 8: LaTeX in math commands preserved ──────────────────────────────────
test("Test 8 – \\frac inside math delimiter is preserved verbatim", () => {
  const nodes = parseContent("$\\frac{a}{b}$")
  expect(nodes).toEqual([
    { type: "math", mode: "inline", latex: "\\frac{a}{b}" },
  ])
})

// ── Test 9: resolveLocalImagePaths ───────────────────────────────────────────
test("Test 9 – resolveLocalImagePaths replaces /var/folders paths", () => {
  const input = "See ![fig](/var/folders/abc/xyz/image1.png) below"
  const output = resolveLocalImagePaths(input, "sess123", (sid, fn) => `/api/import/${sid}/media/${fn}`)
  expect(output).toBe("See ![fig](/api/import/sess123/media/image1.png) below")
})

// ── Test 9b: resolveLocalImagePaths leaves https:// alone ────────────────────
test("Test 9b – resolveLocalImagePaths leaves remote URLs untouched", () => {
  const input = "![fig](https://cdn.example.com/img.png)"
  const output = resolveLocalImagePaths(input, "sess123", () => "/replaced")
  expect(output).toBe(input)
})

// ── Test 10: Newline preserved ────────────────────────────────────────────────
test("Test 10 – Literal \\n produces a linebreak node", () => {
  const nodes = parseContent("Line one\nLine two")
  expect(nodes).toEqual([
    { type: "text", value: "Line one" },
    { type: "linebreak" },
    { type: "text", value: "Line two" },
  ])
})

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests run — ${passed} passed, ${failed} failed.\n`)
if (failed > 0) process.exit(1)
