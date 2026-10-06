import { render } from "@testing-library/react"
import * as stylex from "@stylexjs/stylex"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Chevron } from "./Chevron"
import {
	CheckGlyph,
	CopyGlyph,
	FileGlyph,
	Glyph,
	MicGlyph,
	MicOffGlyph,
	PhoneOffGlyph,
	PlusGlyph,
	XGlyph,
} from "./glyphs"
import { ICON_STROKE, icon } from "./icon"

describe("Glyph", () => {
	test("draws a hidden 24-unit stroke icon in currentColor", () => {
		const { container } = render(
			<Glyph>
				<path d="M0 0" />
			</Glyph>,
		)
		const svg = container.querySelector("svg") as SVGSVGElement
		expect(svg).toHaveAttribute("viewBox", "0 0 24 24")
		expect(svg).toHaveAttribute("stroke", "currentColor")
		expect(svg).toHaveAttribute("stroke-width", String(ICON_STROKE))
		expect(svg).toHaveAttribute("fill", "none")
		expect(svg).toHaveAttribute("aria-hidden", "true")
	})

	test("the caller's attributes win", () => {
		const { container } = render(<XGlyph width={12} strokeWidth={1.5} />)
		const svg = container.querySelector("svg") as SVGSVGElement
		expect(svg).toHaveAttribute("width", "12")
		expect(svg).toHaveAttribute("stroke-width", "1.5")
	})

	test("every named glyph draws something", () => {
		for (const Named of [
			CheckGlyph,
			CopyGlyph,
			FileGlyph,
			MicGlyph,
			MicOffGlyph,
			PhoneOffGlyph,
			PlusGlyph,
			XGlyph,
		]) {
			const { container, unmount } = render(<Named />)
			expect(container.querySelector("svg")?.children.length).toBeGreaterThan(0)
			unmount()
		}
	})
})

describe("Chevron", () => {
	test("right and down are different paths", () => {
		const { container } = render(
			<>
				<Chevron direction="right" />
				<Chevron direction="down" />
			</>,
		)
		const [right, down] = [...container.querySelectorAll("path")].map((path) => path.getAttribute("d"))
		expect(right).not.toBe(down)
	})
})

describe("icon sizes", () => {
	test("each size is a different box that ignores the pointer", () => {
		const { container } = render(
			<>
				{(["xs", "sm", "md", "base", "lg"] as const).map((size) => (
					<CheckGlyph key={size} {...stylex.props(icon[size])} />
				))}
			</>,
		)
		const classes = [...container.querySelectorAll("svg")].map((svg) => svg.getAttribute("class"))
		expect(new Set(classes).size).toBe(5)
		expect(container.querySelector("svg")).toHaveStyle({ pointerEvents: "none" })
	})
})

test("axe: decorative glyphs next to text", async () => {
	const { container } = render(
		<p>
			<CheckGlyph /> 完成 <Chevron direction="right" />
		</p>,
	)
	await expectNoAxeViolations(container)
})
