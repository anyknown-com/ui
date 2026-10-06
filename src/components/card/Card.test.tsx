import * as stylex from "@stylexjs/stylex"
import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { type StyleArg } from "../../lib/styled"
import { space } from "../../tokens.stylex"
import { expectNoAxeViolations } from "../../test/axe"
import { Card } from "./Card"

const probe = stylex.create({
	basePadding: { padding: space.lg },
	tightPadding: { padding: space.xs },
})

function atom(style: StyleArg): string {
	const classes = stylex.props(style).className?.split(" ") ?? []
	const hashed = classes.filter((name) => /^x[a-z0-9]+$/.test(name))
	expect(hashed).toHaveLength(1)
	return hashed[0] as string
}

describe("Card", () => {
	test("sx replaces the base padding instead of stacking on top of it", () => {
		render(<Card sx={probe.tightPadding}>內容</Card>)
		const classes = screen.getByText("內容").className.split(" ")
		expect(classes).toContain(atom(probe.tightPadding))
		expect(classes).not.toContain(atom(probe.basePadding))
	})
})

test("axe: a card holding a heading and a control", async () => {
	const { container } = render(
		<Card aria-labelledby="card-title" role="region">
			<h2 id="card-title">方案</h2>
			<button type="button">升級</button>
		</Card>,
	)
	await expectNoAxeViolations(container)
})
