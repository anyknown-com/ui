import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Stack } from "./Stack"

describe("Stack", () => {
	test("renders its children in order inside a div", () => {
		render(
			<Stack data-testid="s">
				<span>one</span>
				<span>two</span>
			</Stack>,
		)
		const stack = screen.getByTestId("s")
		expect(stack.tagName).toBe("DIV")
		expect(Array.from(stack.children).map((c) => c.textContent)).toEqual(["one", "two"])
	})

	test("column and row give different classes, and each gap differs (md is the default)", () => {
		render(
			<>
				<Stack data-testid="col">x</Stack>
				<Stack data-testid="row" direction="row">
					x
				</Stack>
				<Stack data-testid="sm" gap="sm">
					x
				</Stack>
				<Stack data-testid="lg" gap="lg">
					x
				</Stack>
			</>,
		)
		const cls = (id: string) => screen.getByTestId(id).className
		expect(cls("col")).not.toBe(cls("row"))
		expect(new Set([cls("col"), cls("sm"), cls("lg")]).size).toBe(3)
	})

	test("passes native props and merges className", () => {
		render(
			<Stack data-testid="s" className="extra" aria-label="group" role="group">
				x
			</Stack>,
		)
		const stack = screen.getByRole("group", { name: "group" })
		expect(stack.className).toContain("extra")
	})

	test("axe: column and row", async () => {
		const { container } = render(
			<>
				<Stack>
					<p>a</p>
					<p>b</p>
				</Stack>
				<Stack direction="row" gap="lg">
					<p>c</p>
					<p>d</p>
				</Stack>
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
