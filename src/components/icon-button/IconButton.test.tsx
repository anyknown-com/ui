import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { forcedCss } from "../../test/forcedCss"
import { PlusGlyph } from "../icon/glyphs"
import { IconButton } from "./IconButton"

describe("IconButton", () => {
	test("the label is its accessible name, and it clicks", async () => {
		const onClick = vi.fn()
		render(
			<IconButton label="新增" onClick={onClick}>
				<PlusGlyph />
			</IconButton>,
		)
		const button = screen.getByRole("button", { name: "新增" })
		expect(button).toHaveAttribute("type", "button")
		await userEvent.click(button)
		expect(onClick).toHaveBeenCalledOnce()
	})

	test("the label also shows as a tooltip on focus", async () => {
		const user = userEvent.setup()
		render(
			<IconButton label="新增">
				<PlusGlyph />
			</IconButton>,
		)
		await user.tab()
		expect(await screen.findByText("新增", { selector: ":not(button)" })).toBeInTheDocument()
	})

	test("current marks the page it stands for", () => {
		render(
			<IconButton label="設定" current>
				<PlusGlyph />
			</IconButton>,
		)
		expect(screen.getByRole("button", { name: "設定" })).toHaveAttribute("aria-current", "page")
	})

	test("a badge shows a positive count only", () => {
		const { rerender } = render(
			<IconButton label="通知" badge={3} open>
				<PlusGlyph />
			</IconButton>,
		)
		expect(screen.getByText("3")).toBeInTheDocument()
		rerender(
			<IconButton label="通知" badge={0} open>
				<PlusGlyph />
			</IconButton>,
		)
		expect(screen.queryByText("0")).toBeNull()
	})

	test("keeps the caller's className and style", () => {
		render(
			<IconButton label="新增" className="mine" style={{ marginTop: "4px" }} open>
				<PlusGlyph />
			</IconButton>,
		)
		const button = screen.getByRole("button")
		expect(button.className).toContain("mine")
		expect(button).toHaveStyle({ marginTop: "4px" })
	})
})

test("axe: plain, current, open with a badge, disabled", async () => {
	const { container } = render(
		<>
			<IconButton label="新增">
				<PlusGlyph />
			</IconButton>
			<IconButton label="設定" current>
				<PlusGlyph />
			</IconButton>
			<IconButton label="通知" open badge={2}>
				<PlusGlyph />
			</IconButton>
			<IconButton label="停用" disabled size="xs">
				<PlusGlyph />
			</IconButton>
		</>,
	)
	await expectNoAxeViolations(container)
})

test("forced-colors: a ButtonText outline on hover, a Highlight ring on focus", () => {
	render(
		<IconButton label="新增">
			<PlusGlyph />
		</IconButton>,
	)
	const css = forcedCss(screen.getByRole("button", { name: "新增" }))
	expect(css).toMatch(/:hover:not\(:disabled\)[^{]*\{ outline: 1px solid buttontext/i)
	expect(css).toMatch(/:focus-visible[^{]*\{ outline: \S+ solid highlight/i)
})
