import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Stat } from "./Stat"

describe("Stat", () => {
	test("renders label, value and note in reading order", () => {
		render(<Stat data-testid="s" label="Spend" value="$3.10" note="up 12% on last week" />)
		const parts = Array.from(screen.getByTestId("s").children).map((c) => c.textContent)
		expect(parts).toEqual(["Spend", "$3.10", "up 12% on last week"])
	})

	test("omits the note line when none is given", () => {
		render(<Stat data-testid="s" label="Runs" value="42" />)
		expect(screen.getByTestId("s").children).toHaveLength(2)
	})

	test("shows the value text as given, without parsing", () => {
		render(<Stat label="Code" value="007" />)
		expect(screen.getByText("007")).toBeInTheDocument()
	})

	test("passes native props and merges className", () => {
		render(<Stat data-testid="s" className="extra" label="Runs" value="42" />)
		expect(screen.getByTestId("s").className).toContain("extra")
	})

	test("axe: with and without a note", async () => {
		const { container } = render(
			<>
				<Stat label="Runs" value="42" />
				<Stat label="Spend" value="$3.10" note="this week" />
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
