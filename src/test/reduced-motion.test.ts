import { readFile, readdir } from "node:fs/promises"
import { join, relative, resolve } from "node:path"
import { expect, test } from "vitest"

const SRC = resolve(import.meta.dirname, "..")

/**
 * Animations that are gated in JS with `usePrefersReducedMotion` instead of a
 * media query, because the element is not rendered at all under reduce.
 */
const JS_GATED = new Set(["toast/Toast.tsx:countLine"])

/**
 * `prefers-reduced-motion` means reduce, not necessarily eliminate. These keep
 * moving but slower, because the motion is the information — see the component's
 * NOTES.md for the reasoning.
 */
const SLOWED = new Set(["tool-card/ToolCard.tsx:spinner"])

const ANIMATED = new Set(["animationName", "transitionDuration"])

async function* walk(dir: string): AsyncGenerator<string> {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) yield* walk(path)
		else if (/\.tsx?$/.test(path) && !path.includes(".test.") && !path.includes("/test/")) yield path
	}
}

/** Splits a `stylex.create({...})` body into its top-level style objects. */
function styleObjects(source: string) {
	const found: { name: string; body: string; line: number }[] = []
	const create = /stylex\.create\(\{/g
	for (const match of source.matchAll(create)) {
		let depth = 1
		let index = match.index + match[0].length
		const start = index
		while (index < source.length && depth > 0) {
			if (source[index] === "{") depth += 1
			else if (source[index] === "}") depth -= 1
			index += 1
		}
		const body = source.slice(start, index - 1)
		const entry = /^\t(\w+):\s*(\{|\(.*?\)\s*=>\s*\()/gm
		for (const style of body.matchAll(entry)) {
			let level = 1
			let cursor = style.index + style[0].length
			const from = cursor
			while (cursor < body.length && level > 0) {
				if (body[cursor] === "{" || body[cursor] === "(") level += 1
				else if (body[cursor] === "}" || body[cursor] === ")") level -= 1
				cursor += 1
			}
			found.push({
				name: style[1],
				body: body.slice(from, cursor - 1),
				line: source.slice(0, start + style.index).split("\n").length,
			})
		}
	}
	return found
}

/** Splits one style object into its own top-level `property: value` entries. */
function entries(body: string) {
	const found: { property: string; value: string }[] = []
	const start = /^\t\t(\w+|"[^"]+"|\[[^\]]+\]):\s*/gm
	for (const match of body.matchAll(start)) {
		let level = 0
		let cursor = match.index + match[0].length
		const from = cursor
		while (cursor < body.length) {
			const char = body[cursor]
			if (char === "{" || char === "(" || char === "[") level += 1
			else if (char === "}" || char === ")" || char === "]") level -= 1
			else if (char === "," && level === 0) break
			cursor += 1
		}
		found.push({ property: match[1], value: body.slice(from, cursor) })
	}
	return found
}

function guards(value: string) {
	return value.includes("REDUCED") || value.includes("prefers-reduced-motion")
}

test("every animated property is wrapped in prefers-reduced-motion", async () => {
	const offenders: string[] = []
	let checked = 0

	for await (const file of walk(SRC)) {
		const source = await readFile(file, "utf8")
		if (!source.includes("stylex.create")) continue
		const short = relative(join(SRC, "components"), file)
		for (const style of styleObjects(source)) {
			const declared = entries(style.body)
			const animated = declared.filter((entry) => ANIMATED.has(entry.property))
			if (animated.length === 0) continue
			const id = `${short}:${style.name}`
			for (const entry of animated) {
				checked += 1
				if (guards(entry.value)) continue
				if (JS_GATED.has(id)) continue
				// A slowed animation keeps its name but zeroes nothing; the duration
				// carries the reduce override instead.
				const duration = declared.find((other) => other.property === "animationDuration")
				if (SLOWED.has(id) && entry.property === "animationName" && duration && guards(duration.value))
					continue
				offenders.push(`${id}.${entry.property} (${file}:${style.line})`)
			}
		}
	}

	expect(checked).toBeGreaterThan(30)
	expect(offenders).toEqual([])
})

test("the documented exceptions still exist and are still exceptional", async () => {
	const toast = await readFile(join(SRC, "components/toast/Toast.tsx"), "utf8")
	expect(toast).toContain("usePrefersReducedMotion")
	expect(toast).toContain("{!reduced && duration > 0 && (")

	const toolCard = await readFile(join(SRC, "components/tool-card/ToolCard.tsx"), "utf8")
	expect(toolCard).toContain('animationDuration: { default: "0.8s", [REDUCED]: "1.6s" }')

	expect(JS_GATED.size + SLOWED.size).toBe(2)
})

test("rAF-driven animation is gated on the media query", async () => {
	for (const file of ["progress/Progress.tsx", "voice-indicator/VoiceIndicator.tsx"]) {
		const source = await readFile(join(SRC, "components", file), "utf8")
		expect(source, file).toContain("usePrefersReducedMotion")
		expect(source, file).toContain("useAnimationFrame(!reduced")
	}
})
