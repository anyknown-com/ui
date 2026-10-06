import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import { declarations, expected } from "../scripts/tokens-css.mjs"

// tokens.css 給不用 StyleX 的消費端(desktop 的 Tailwind)。它是從 tokens.stylex.ts 生成的;
// 這裡比每個變數的值,不比排版。不同步就跑 pnpm gen:tokens-css。
const css = readFileSync(join(process.cwd(), "src/tokens.css"), "utf8")
const want = expected()

describe("tokens.css", () => {
	test(":root 與 tokens.stylex.ts 同步(不同步就跑 pnpm gen:tokens-css)", () => {
		expect(Object.fromEntries(declarations(css, ":root"))).toEqual(Object.fromEntries(want.light))
	})

	test.each([':root:not([data-theme="light"])', '[data-theme="dark"]'])("%s 有每個暗色值", (selector) => {
		expect(Object.fromEntries(declarations(css, selector))).toEqual(Object.fromEntries(want.dark))
	})

	test("不只顏色:space、type、motion、zIndex、corner、shadow 都有", () => {
		for (const name of [
			"--ak-space-md",
			"--ak-type-t3",
			"--ak-motion-quick",
			"--ak-motion-ease-out",
			"--ak-z-index-popup",
			"--ak-corner-control",
			"--ak-shadow-float",
		])
			expect(want.light.has(name), name).toBe(true)
	})
})
