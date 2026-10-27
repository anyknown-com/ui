import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { axisTicks } from "./axis"
import { BarChart } from "./BarChart"

const LABELS = ["Mon", "Tue", "Wed"]
const VALUES = [12, 8, 30]

function renderEn(ui: React.ReactElement) {
	return render(<LocaleProvider locale="en">{ui}</LocaleProvider>)
}

const shown = (container: HTMLElement) => container.querySelector('[data-part="chart-value"]')?.textContent

describe("axisTicks", () => {
	test.each([
		[0, 12, [0, 6, 12]],
		[0, 43910, [0, 25000, 50000]],
		[185, 388, [0, 200, 400]],
		[310, 388, [300, 350, 400]],
		[0, 0.5, [0, 0.25, 0.5]],
		[-3, 12, [-20, 0, 20]],
		[0, 0, [0, 0.5, 1]],
	])("%d to %d", (min, max, ticks) => {
		expect(axisTicks(min, max)).toEqual(ticks)
	})
})

describe("BarChart", () => {
	test("draws one ink bar per value on three ticks, named by its first and last label", () => {
		const { container } = renderEn(<BarChart labels={LABELS} values={VALUES} />)
		const svg = screen.getByRole("img", { name: "Bar chart, Mon to Wed" })
		expect(svg.querySelectorAll("rect")).toHaveLength(3)
		expect(svg.querySelectorAll("line")).toHaveLength(3)
		for (const tick of ["0", "20", "40"]) expect(within(container).getByText(tick)).toBeInTheDocument()
	})

	test("names the chart in Traditional Chinese by default, and aria-label overrides it", () => {
		const { rerender } = render(<BarChart labels={LABELS} values={VALUES} />)
		expect(screen.getByRole("img", { name: "長條圖，Mon 到 Wed" })).toBeInTheDocument()
		rerender(<BarChart labels={LABELS} values={VALUES} aria-label="Runs this week" />)
		expect(screen.getByRole("img", { name: "Runs this week" })).toBeInTheDocument()
	})

	test("screen readers get a table, with the unit in the header and separators in the numbers", () => {
		renderEn(<BarChart labels={["Mon", "Tue"]} values={[1200, 8]} unit="runs" />)
		const table = screen.getByRole("table")
		expect(within(table).getByRole("columnheader", { name: "Value (runs)" })).toBeInTheDocument()
		const row = within(table).getByRole("row", { name: "Mon 1,200" })
		expect(within(row).getByRole("rowheader", { name: "Mon" })).toBeInTheDocument()
		expect(within(row).getByRole("cell", { name: "1,200" })).toBeInTheDocument()
	})

	test("every bar has a title with its label, value and unit", () => {
		const { container } = renderEn(<BarChart labels={LABELS} values={[1200, 8, 30]} unit="runs" />)
		const titles = [...container.querySelectorAll('[data-part="chart-slot"]')].map((s) =>
			s.getAttribute("title"),
		)
		expect(titles).toEqual(["Mon · 1,200 runs", "Tue · 8 runs", "Wed · 30 runs"])
	})

	test("keyboard: one tab stop, arrows, Home and End move between values and show each one", async () => {
		const user = userEvent.setup()
		const { container } = renderEn(<BarChart labels={LABELS} values={VALUES} unit="runs" />)
		const rows = screen.getAllByRole("row").slice(1)
		expect(rows.map((r) => r.tabIndex)).toEqual([0, -1, -1])
		await user.tab()
		expect(rows[0]).toHaveFocus()
		expect(shown(container)).toBe("12 runs")
		await user.keyboard("{ArrowRight}")
		expect(rows[1]).toHaveFocus()
		expect(shown(container)).toBe("8 runs")
		await user.keyboard("{End}")
		expect(rows[2]).toHaveFocus()
		await user.keyboard("{ArrowRight}")
		expect(rows[2]).toHaveFocus()
		await user.keyboard("{Home}")
		expect(rows[0]).toHaveFocus()
		expect(rows.map((r) => r.tabIndex)).toEqual([0, -1, -1])
		await user.tab()
		expect(shown(container)).toBeUndefined()
	})

	test("the focused value's slot carries the focus ring", async () => {
		const user = userEvent.setup()
		const { container } = renderEn(<BarChart labels={LABELS} values={VALUES} />)
		const slots = [...container.querySelectorAll('[data-part="chart-slot"]')]
		const before = slots[1]!.className
		await user.tab()
		await user.keyboard("{ArrowRight}")
		expect(slots[1]!.className).not.toBe(before)
	})

	test("pointer: entering a bar shows its value and leaving hides it", () => {
		const { container } = renderEn(<BarChart labels={LABELS} values={VALUES} unit="runs" />)
		const slots = container.querySelectorAll('[data-part="chart-slot"]')
		fireEvent.pointerEnter(slots[2]!)
		expect(shown(container)).toBe("30 runs")
		fireEvent.pointerLeave(slots[2]!)
		expect(shown(container)).toBeUndefined()
	})

	test("passes native props and merges className", () => {
		renderEn(<BarChart data-testid="c" className="extra" labels={LABELS} values={VALUES} />)
		expect(screen.getByTestId("c").className).toContain("extra")
	})

	test("axe: with a unit, without one, and empty", async () => {
		const { container } = renderEn(
			<>
				<BarChart labels={LABELS} values={VALUES} unit="runs" />
				<BarChart labels={LABELS} values={[-3, 12, 0]} />
				<BarChart labels={[]} values={[]} />
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
