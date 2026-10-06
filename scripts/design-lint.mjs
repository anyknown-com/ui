// Count mechanical errors in one-off HTML pages. Only with numbers can we tell whether design.md helps (evaluation loop §4.3).
//
//   node scripts/design-lint.mjs a.html b.html ...   one row per file, a total row last
//   node scripts/design-lint.mjs --json a.html ...   the same numbers, for eval scripts
//
// Eight counts, all of them rule-detectable and needing no judgment:
//   hex       invented colors: #rgb / #rrggbb / #rrggbbaa literals (token values count too; a page should reference the variable, not copy the value)
//   color     colors other than --ak-*: rgb() / hsl() / oklch() / named colors
//   class     out-of-vocabulary classes: names in class attributes that are not in brand.css
//   font      non-token fonts: a font-family declaration without var(--ak-font-*)
//   easing    overshoot: cubic-bezier y values outside 0..1, spring / bounce / elastic, --ak-motion-spring
//   inline    inline style attributes
//   stat      stat misuse: more than four ak-stat on a page, or an ak-stat-value number that appears again in a table below
//   table2    full-width tables with two columns or fewer: the numbers get pushed to the far right and the eye cannot follow (DESIGN.md §3)
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { cssClasses } from "./design-check.mjs"

const VOCAB = new Set([...cssClasses(), "ak-theme-light", "ak-theme-dark"])

const NAMED_COLORS =
	/\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|teal|indigo|violet|slate|zinc|stone|amber|emerald|cyan|sky|rose|lime|fuchsia|navy|maroon|olive|silver|aqua|beige|ivory|tan|coral|salmon|gold|crimson)\b/gi

export function lint(html) {
	// Only look at what affects visuals: style blocks and style attributes; scripts do not count
	const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n")
	const inlineStyles = [...html.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)].map((m) => m[1])
	const css = `${styleBlocks}\n${inlineStyles.join("\n")}`

	const hex = (css.match(/#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi) ?? []).length
	const color =
		(css.match(/\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/gi) ?? []).length +
		(css.replace(/\/\*[\s\S]*?\*\//g, "").match(NAMED_COLORS) ?? []).length
	const fontDecls = css.match(/font-family\s*:[^;}]+/gi) ?? []
	const font = fontDecls.filter((d) => !/var\(--ak-font-/.test(d)).length
	let easing = (css.match(/\b(?:spring|bounce|elastic)\b|--ak-motion-spring/gi) ?? []).length
	for (const m of css.matchAll(/cubic-bezier\(\s*([^)]+)\)/gi)) {
		const [, y1, , y2] = m[1].split(",").map(Number)
		if (y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1) easing++
	}
	const inline = inlineStyles.length

	// stat: more than four is misuse; a value equal to any td text re-enlarges a number already in a table
	const strip = (t) =>
		t
			.replace(/<[^>]+>/g, "")
			.replace(/\s+/g, " ")
			.trim()
	const statValues = [...html.matchAll(/class="[^"]*\bak-stat-value\b[^"]*"[^>]*>([\s\S]*?)<\/\w+>/g)].map(
		(m) => strip(m[1]),
	)
	const cells = new Set([...html.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => strip(m[1])))
	const stat = Math.max(0, statValues.length - 4) + statValues.filter((v) => cells.has(v)).length
	// table2: the first row has at most 2 th/td
	let table2 = 0
	for (const t of html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)) {
		const firstRow = t[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/i)?.[1] ?? ""
		if ((firstRow.match(/<t[hd]\b/gi) ?? []).length <= 2) table2++
	}

	const classes = [...html.matchAll(/\sclass\s*=\s*"([^"]*)"/gi)].flatMap((m) =>
		m[1].split(/\s+/).filter(Boolean),
	)
	const foreign = classes.filter((c) => !VOCAB.has(c))
	const cls = foreign.length

	return { hex, color, class: cls, font, easing, inline, stat, table2, foreignClasses: [...new Set(foreign)] }
}

const KEYS = ["hex", "color", "class", "font", "easing", "inline", "stat", "table2"]

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = process.argv.slice(2)
	const json = args.includes("--json")
	const files = args.filter((a) => !a.startsWith("--"))
	if (files.length === 0) {
		console.error("Usage: node scripts/design-lint.mjs [--json] <html>...")
		process.exit(2)
	}
	const rows = files.map((file) => ({ file, ...lint(readFileSync(file, "utf8")) }))
	const total = Object.fromEntries(KEYS.map((k) => [k, rows.reduce((s, r) => s + r[k], 0)]))
	if (json) {
		console.log(JSON.stringify({ rows, total }, null, "\t"))
	} else {
		const pad = (s, n) => String(s).padStart(n)
		console.log(`  ${"file".padEnd(32)}${KEYS.map((k) => pad(k, 8)).join("")}`)
		for (const r of rows) {
			console.log(`  ${r.file.slice(-32).padEnd(32)}${KEYS.map((k) => pad(r[k], 8)).join("")}`)
			if (r.foreignClasses.length > 0)
				console.log(`  ${"".padEnd(32)}out of vocabulary: ${r.foreignClasses.slice(0, 12).join(" ")}`)
		}
		if (rows.length > 1) console.log(`  ${"total".padEnd(32)}${KEYS.map((k) => pad(total[k], 8)).join("")}`)
	}
}
