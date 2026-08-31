import * as stylex from "@stylexjs/stylex"
import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { type StyleArg } from "../../lib/styled"
import { color } from "../../tokens.stylex"
import { Text } from "./Text"

// StyleX 在同一次 props() 內按 property 合併,勝出的那個 property 只會留一個 atomic
// class。所以「有沒有覆蓋成功」要看 base 的那顆 atom 還在不在 —— 只斷言 caller 的
// class 有出現的話,壞掉的版本(兩顆都在,靠 stylesheet 順序決勝)也會通過。
const probe = stylex.create({
	text: { color: color.text },
	muted: { color: color.textMuted },
	accent: { color: color.accent },
})

// dev build 會多帶一顆可讀的 debug class(`Text__styles.base`),atomic 的是雜湊那顆
function atom(style: StyleArg): string {
	const classes = stylex.props(style).className?.split(" ") ?? []
	const hashed = classes.filter((name) => /^x[a-z0-9]+$/.test(name))
	expect(hashed).toHaveLength(1)
	return hashed[0] as string
}

const classesOf = (element: Element) => element.className.split(" ")

describe("Text", () => {
	test("renders the tag and variant it was asked for", () => {
		render(
			<Text as="h2" variant="title">
				標題
			</Text>,
		)
		expect(screen.getByText("標題").tagName).toBe("H2")
	})

	test("sx replaces the base colour instead of stacking on top of it", () => {
		render(<Text sx={probe.muted}>標語</Text>)
		const classes = classesOf(screen.getByText("標語"))
		expect(classes).toContain(atom(probe.muted))
		expect(classes).not.toContain(atom(probe.text))
	})

	test("sx also beats the variant's own colour", () => {
		render(
			<Text variant="caption" sx={probe.accent}>
				說明
			</Text>,
		)
		const classes = classesOf(screen.getByText("說明"))
		expect(classes).toContain(atom(probe.accent))
		expect(classes).not.toContain(atom(probe.muted))
	})

	test("keeps the caller's className — but className alone does not override", () => {
		render(<Text {...stylex.props(probe.muted)}>舊寫法</Text>)
		const classes = classesOf(screen.getByText("舊寫法"))
		expect(classes).toContain(atom(probe.muted))
		expect(classes).toContain(atom(probe.text))
	})
})
