// src/tokens.css 從 tokens.stylex.ts 生成:給不用 StyleX 的消費端(desktop 的 Tailwind v4 @theme)。
//
// 手抄一份值必然會漂,跟 themes.mjs 同一思路。這支同時給 `pnpm gen:tokens-css` 與
// tokens-css 的測試用:測試比的是「每個變數的值」,不比排版(排版交給 oxfmt)。
//
// 命名:color 群直接 --ak-<key>,其他群帶群名(--ak-shadow-float、--ak-type-t2、--ak-z-index-popup)。
// 標了 @deprecated 的 key 不輸出,除非它早就以 CSS 變數發佈過(PUBLISHED)。
// breakpoint 不輸出:CSS 變數不能放進 @media。
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/** 已經以 --ak-* 發佈過的舊名:拿掉會弄壞 CSS 消費端,下一個 major 再清。 */
const PUBLISHED = new Set(["shadow.raised", "shadow.popover", "motion.spring"])

/** 每個 group:{ name, vars: [{ key, light, dark? }] };dark 只有帶 [DARK] 變體的才有。 */
export function readGroups(source = readFileSync(join(root, "src/tokens.stylex.ts"), "utf8")) {
	const groups = []
	const re = /export const (\w+) = stylex\.define(?:Vars|Consts)\(\{(.*?)\n\}\)/gs
	for (const [, name, body] of source.matchAll(re)) {
		const vars = []
		// 一個 entry = 一行 `\tkey:` 開頭,到下一個同層的 key / 註解為止
		const lines = body.split("\n")
		let deprecated = false
		let inDoc = false
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (/^\t\/\*\*/.test(line)) inDoc = !line.includes("*/")
			if (/^\t(\/\*\*|\*| \*)/.test(line) || inDoc) {
				if (line.includes("@deprecated")) deprecated = true
				if (line.includes("*/")) inDoc = false
				continue
			}
			const entry = line.match(/^\t(\w+):(.*)$/)
			if (!entry) continue
			let text = entry[2]
			while (i + 1 < lines.length && !/^\t(\w+:|\/\/|\/\*)/.test(lines[i + 1])) text += `\n${lines[++i]}`
			const strings = [...text.matchAll(/"([^"]*)"/g)].map((m) => m[1])
			const number = text.match(/^\s*(-?\d+(?:\.\d+)?),?\s*$/)
			const value = number
				? { light: number[1] }
				: text.includes("[DARK]")
					? { light: strings[0], dark: strings[1] }
					: { light: strings[0] }
			if (value.light !== undefined && !(deprecated && !PUBLISHED.has(`${name}.${entry[1]}`)))
				vars.push({ key: entry[1], ...value })
			deprecated = false
		}
		if (vars.length > 0 && !vars.some((v) => v.light.startsWith("@media"))) groups.push({ name, vars })
	}
	return groups
}

export const varName = (group, key) => `--ak-${group === "color" ? "" : `${kebab(group)}-`}${kebab(key)}`

/** 值的寫法跟原本手寫的 tokens.css 一致:hex 小寫、字型名用雙引號。 */
const cssValue = (v) => v.replace(/#[0-9A-Fa-f]{3,8}\b/g, (h) => h.toLowerCase()).replaceAll("'", '"')

/** 預期的變數表:{ light: Map, dark: Map };測試拿它跟 tokens.css 比。 */
export function expected(groups = readGroups()) {
	const light = new Map()
	const dark = new Map()
	for (const g of groups)
		for (const v of g.vars) {
			light.set(varName(g.name, v.key), cssValue(v.light))
			if (v.dark !== undefined) dark.set(varName(g.name, v.key), cssValue(v.dark))
		}
	return { light, dark }
}

export function generate(groups = readGroups()) {
	const decl = (g, mode) =>
		g.vars.filter((v) => v[mode] !== undefined).map((v) => `${varName(g.name, v.key)}: ${cssValue(v[mode])};`)
	const themed = groups.filter((g) => g.vars.some((v) => v.dark !== undefined))
	const block = (mode, indent) =>
		(mode === "light" ? groups : themed)
			.map((g) =>
				decl(g, mode)
					.map((d) => `${indent}${d}`)
					.join("\n"),
			)
			.join("\n\n")
	return `/* Tokens as plain CSS variables — for non-StyleX consumers
 * (desktop uses Tailwind v4 @theme; reference these vars there).
 * Generated from tokens.stylex.ts by scripts/tokens-css.mjs — do not edit by hand.
 * Regenerate: pnpm gen:tokens-css (src/tokens-css.test.ts fails when out of sync). */

/* 展開/收合讓頁面長高時捲軸出現 → 置中內容左移;永遠留捲軸的位置。 */
html {
	scrollbar-gutter: stable;
}

:root {
${block("light", "\t")}
}

@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) {
${block("dark", "\t\t")}
	}
}

[data-theme="dark"] {
${block("dark", "\t")}
}
`
}

/** tokens.css 裡 `selector {` 到對應 `}` 之間的宣告:Map(name → value),值裡的換行與縮排壓成一個空格。 */
export function declarations(css, selector) {
	const start = css.indexOf(`${selector} {`)
	if (start < 0) throw new Error(`tokens.css: 找不到 ${selector}`)
	const open = css.indexOf("{", start)
	let depth = 1
	let i = open + 1
	for (; depth > 0; i++) {
		if (css[i] === "{") depth++
		else if (css[i] === "}") depth--
	}
	const body = css.slice(open + 1, i - 1).replace(/\/\*[\s\S]*?\*\//g, "")
	return new Map(
		[...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, " ").trim()]),
	)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.stdout.write(generate())
