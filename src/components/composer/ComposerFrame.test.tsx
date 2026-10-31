import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { ComposerFrame } from "./ComposerFrame"

describe("ComposerFrame", () => {
	test("draws its children", () => {
		render(
			<ComposerFrame>
				<textarea aria-label="訊息" />
			</ComposerFrame>,
		)
		expect(screen.getByRole("textbox", { name: "訊息" })).toBeInTheDocument()
	})

	test("dragging marks the frame and changes its look", () => {
		const { container, rerender } = render(<ComposerFrame>x</ComposerFrame>)
		const frame = container.firstElementChild as HTMLElement
		const idle = frame.className
		expect(frame).not.toHaveAttribute("data-dragging")
		rerender(<ComposerFrame dragging>x</ComposerFrame>)
		expect(frame).toHaveAttribute("data-dragging", "true")
		expect(frame.className).not.toBe(idle)
	})

	test("focus inside draws no ring, except in forced colors", () => {
		const { container } = render(<ComposerFrame>x</ComposerFrame>)
		const classes = (container.firstElementChild as HTMLElement).classList
		const focusRules = (rules: CSSRuleList) =>
			[...rules].filter(
				(rule): rule is CSSStyleRule =>
					rule instanceof CSSStyleRule &&
					rule.selectorText.includes(":focus-within") &&
					[...classes].some((name) => rule.selectorText.includes(`.${name}`)),
			)
		const sheets = [...document.styleSheets]
		const plain = sheets.flatMap((sheet) => focusRules(sheet.cssRules))
		const forced = sheets.flatMap((sheet) =>
			[...sheet.cssRules]
				.filter((rule) => rule instanceof CSSMediaRule && rule.conditionText.includes("forced-colors"))
				.flatMap((rule) => focusRules((rule as CSSMediaRule).cssRules)),
		)
		expect(plain.map((rule) => rule.style.outline)).toEqual([])
		expect(forced.map((rule) => rule.style.outline)).toEqual([expect.stringContaining("Highlight")])
	})
})
