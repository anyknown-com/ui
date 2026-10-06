import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { expect, test } from "vitest"

/**
 * Literal guard: components use tokens, not raw values. Scans src/components (not tests) for
 *
 * - `duration`   a raw `120ms` (use `motion.*`; `"0s"` for reduced motion is fine)
 * - `zIndex`     a raw `zIndex: 70` (portal layers are `zIndex.*` in tokens.stylex.ts)
 * - `hex`        a raw `#RRGGBB` colour (use `color.*` / `tone.*`)
 * - `fontSize`   a raw `fontSize: 12` / `"0.75rem"` (use `type.*`)
 * - `breakpoint` a raw `@media (max-width: 45rem)` (use `breakpoint.*`)
 *
 * Comments are ignored. A line that must keep its literal says why, on the line itself or on
 * a comment line directly above: `// literal-ok: white thumb on any track colour`.
 *
 * Today's leftovers are in literal-baseline.json (file → count per kind). The test fails when a
 * file goes over its count, or a new file has any. When you remove literals the count drops
 * and the test fails too, asking you to lower the baseline:
 *
 *     UPDATE_LITERAL_BASELINE=1 pnpm vitest run src/test/literals.test.ts
 *
 * That rewrites the baseline with the lower counts. It never raises a count.
 */

const SRC = resolve(import.meta.dirname, "..")
const COMPONENTS = join(SRC, "components")
const BASELINE = join(import.meta.dirname, "literal-baseline.json")

const KINDS = {
	duration: /(?<![\w.])(?!0+ms)\d+(?:\.\d+)?ms\b/g,
	zIndex: /\bzIndex:\s*(?:\{[^}]*?)?(?<![\w.])-?\d/g,
	hex: /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g,
	fontSize: /\bfontSize:\s*(?:\{[^}]*?)?(?:["'`]\d*\.?\d+(?:px|rem|em)["'`]|(?<![\w.])\d)/g,
	breakpoint: /@media[^"'`]*?\d/g,
} as const

type Kind = keyof typeof KINDS
type Counts = Partial<Record<Kind, number>>
type Hit = { file: string; line: number; kind: Kind; text: string }

function* walk(dir: string): Generator<string> {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) yield* walk(path)
		else if (/\.tsx?$/.test(entry.name) && !entry.name.includes(".test.")) yield path
	}
}

/** Blanks out comments but keeps line numbers. `//` after `:` (a URL) is not a comment. */
function stripComments(source: string) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
		.replace(/(^|[^:\\])\/\/.*$/gm, "$1")
}

/** Every literal in one file, with the escape hatch applied. */
function scan(source: string, file = "") {
	const raw = source.split("\n")
	const code = stripComments(source).split("\n")
	const hits: Hit[] = []
	code.forEach((text, index) => {
		const allowed = raw[index].includes("literal-ok:") || /^\s*\/\/\s*literal-ok:/.test(raw[index - 1] ?? "")
		if (allowed) return
		for (const kind of Object.keys(KINDS) as Kind[])
			for (const _ of text.matchAll(KINDS[kind]))
				hits.push({ file, line: index + 1, kind, text: raw[index].trim() })
	})
	return hits
}

function countAll() {
	const hits: Hit[] = []
	for (const path of walk(COMPONENTS)) hits.push(...scan(readFileSync(path, "utf8"), relative(SRC, path)))
	const counts: Record<string, Counts> = {}
	for (const hit of hits) {
		const row = (counts[hit.file] ??= {})
		row[hit.kind] = (row[hit.kind] ?? 0) + 1
	}
	return { hits, counts }
}

test("escape hatch and comments are not counted", () => {
	const source = [
		'const a = { transitionDuration: "160ms" }',
		'const b = { backgroundColor: "#FFFFFF" } // literal-ok: thumb stays white',
		"// literal-ok: caption over a photo",
		'const c = { color: "#FFF" }',
		"// a 120ms comment, #ABCDEF and https://example.com",
		'const d = { zIndex: 3, fontSize: "0.75rem", animationDuration: "0ms" }',
		'const e = { [PHONE]: 1 } // "@media (max-width: 45rem)"',
		'const f = "@media (max-width: 45rem)"',
	].join("\n")
	expect(scan(source).map((hit) => `${hit.line}:${hit.kind}`)).toEqual([
		"1:duration",
		"6:zIndex",
		"6:fontSize",
		"8:breakpoint",
	])
})

test("components stay at or under the literal baseline", () => {
	const baseline: Record<string, Counts> = JSON.parse(readFileSync(BASELINE, "utf8"))
	const { hits, counts } = countAll()
	const over: string[] = []
	const under: string[] = []
	for (const file of new Set([...Object.keys(baseline), ...Object.keys(counts)]))
		for (const kind of Object.keys(KINDS) as Kind[]) {
			const now = counts[file]?.[kind] ?? 0
			const allowed = baseline[file]?.[kind] ?? 0
			if (now > allowed) {
				const lines = hits.filter((hit) => hit.file === file && hit.kind === kind)
				over.push(
					`${file} ${kind}: ${now} > baseline ${allowed}\n` +
						lines.map((hit) => `    ${hit.line}: ${hit.text}`).join("\n"),
				)
			} else if (now < allowed) under.push(`${file} ${kind}: ${allowed} → ${now}`)
		}

	if (under.length > 0 && process.env.UPDATE_LITERAL_BASELINE) {
		const next: Record<string, Counts> = {}
		for (const file of Object.keys(baseline)) {
			const row: Counts = {}
			for (const kind of Object.keys(KINDS) as Kind[]) {
				const value = Math.min(baseline[file][kind] ?? 0, counts[file]?.[kind] ?? 0)
				if (value > 0) row[kind] = value
			}
			if (Object.keys(row).length > 0) next[file] = row
		}
		writeFileSync(BASELINE, `${JSON.stringify(next, null, "\t")}\n`)
		under.length = 0
	}

	expect(
		over,
		"Raw literals in components: use a token, or add `// literal-ok: <reason>` on the line.",
	).toEqual([])
	expect(
		under,
		"Fewer literals than the baseline — nice. Lower it: UPDATE_LITERAL_BASELINE=1 pnpm vitest run src/test/literals.test.ts",
	).toEqual([])
})
