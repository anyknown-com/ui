// src/tokens.css is generated from tokens.stylex.ts, for consumers that do not use StyleX (desktop's Tailwind v4 @theme).
//
// A hand-copied set of values will inevitably drift, the same reasoning as themes.mjs. This script serves both
// `pnpm gen:tokens-css` and the tokens-css test: the test compares the value of every variable, not
// the layout (layout is left to oxfmt).
//
// Naming: the color group is plain --ak-<key>; other groups carry the group name (--ak-shadow-float, --ak-type-t2, --ak-z-index-popup).
// Keys marked @deprecated are not emitted, unless they were already published as CSS variables (PUBLISHED).
// Breakpoints are not emitted: CSS variables cannot be used inside @media.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/** Old names already published as --ak-*: removing them would break CSS consumers; clean them up in the next major. */
const PUBLISHED = new Set(["shadow.raised", "shadow.popover", "motion.spring"])

/** Each group: { name, vars: [{ key, light, dark? }] }; dark exists only for entries with a [DARK] variant. */
export function readGroups(source = readFileSync(join(root, "src/tokens.stylex.ts"), "utf8")) {
	const groups = []
	const re = /export const (\w+) = stylex\.define(?:Vars|Consts)\(\{(.*?)\n\}\)/gs
	for (const [, name, body] of source.matchAll(re)) {
		const vars = []
		// An entry = a line starting with `\tkey:`, up to the next key / comment at the same level
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

/** Value style matches the original hand-written tokens.css: lowercase hex, double quotes for font names. */
const cssValue = (v) => v.replace(/#[0-9A-Fa-f]{3,8}\b/g, (h) => h.toLowerCase()).replaceAll("'", '"')

/** The expected variable table: { light: Map, dark: Map }; the test compares it with tokens.css. */
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
	const locked = themed
		.map((g) =>
			g.vars
				.filter((v) => v.dark !== undefined)
				.map((v) => `\t${varName(g.name, v.key)}: ${cssValue(v.light)};`)
				.join("\n"),
		)
		.join("\n\n")
	return `/* Tokens as plain CSS variables — for non-StyleX consumers
 * (desktop uses Tailwind v4 @theme; reference these vars there).
 * Generated from tokens.stylex.ts by scripts/tokens-css.mjs — do not edit by hand.
 * Regenerate: pnpm gen:tokens-css (src/tokens-css.test.ts fails when out of sync). */

/* Expanding content can add a scrollbar and shift centred layouts; always reserve its space. */
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

/* data-theme="light" locks light on any element and its subtree, even on a dark OS or inside data-theme="dark". */
[data-theme="light"] {
${locked}
}
`
}

/** Declarations between `selector {` and its matching `}` in tokens.css: Map(name -> value), with newlines and indentation in a value collapsed to one space. */
export function declarations(css, selector) {
	const start = css.indexOf(`${selector} {`)
	if (start < 0) throw new Error(`tokens.css: ${selector} not found`)
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
