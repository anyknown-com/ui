// 對一次性 HTML 頁面數機械錯誤。有數字才知道 design.md 有沒有用(評估迴圈 §4.3)。
//
//   node scripts/design-lint.mjs a.html b.html ...   逐檔一列,最後一列總計
//   node scripts/design-lint.mjs --json a.html ...   同樣的數字,給 eval 腳本吃
//
// 六個計數,全部是規則抓得到的、不需要判斷的:
//   hex       自創色:#rgb / #rrggbb / #rrggbbaa 字面值(token 值也算,頁面該引用變數不該抄值)
//   color     --ak-* 以外的顏色:rgb() / hsl() / oklch() / 具名色
//   class     詞彙外的 class:class 屬性裡不在 brand.css 的名字
//   font      非 token 字體:font-family 宣告裡沒有 var(--ak-font-*)
//   easing    overshoot:cubic-bezier 的 y 值超出 0..1、spring / bounce / elastic、--ak-motion-spring
//   inline    內聯 style 屬性
//   stat      stat 濫用:一頁超過四個 ak-stat,或 ak-stat-value 的數字在下面的表格裡又出現一次
//   table2    兩欄以下的滿版表:數字被推到最右邊,眼睛接不上(DESIGN.md §3)
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { cssClasses } from "./design-check.mjs"

const VOCAB = new Set([...cssClasses(), "ak-theme-light", "ak-theme-dark"])

const NAMED_COLORS =
	/\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|teal|indigo|violet|slate|zinc|stone|amber|emerald|cyan|sky|rose|lime|fuchsia|navy|maroon|olive|silver|aqua|beige|ivory|tan|coral|salmon|gold|crimson)\b/gi

export function lint(html) {
	// 只看會影響視覺的地方:style 區塊與 style 屬性;script 不算
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

	// stat:超過四個算濫用;值跟任何 td 文字相同就是把表裡的數字再放大一次
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
	// table2:第一列的 th/td 數 ≤ 2
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
		console.error("用法:node scripts/design-lint.mjs [--json] <html>...")
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
				console.log(`  ${"".padEnd(32)}詞彙外:${r.foreignClasses.slice(0, 12).join(" ")}`)
		}
		if (rows.length > 1) console.log(`  ${"total".padEnd(32)}${KEYS.map((k) => pad(total[k], 8)).join("")}`)
	}
}
