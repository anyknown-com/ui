import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { LineChart } from "./LineChart"

const LABELS = ["00:00", "06:00", "12:00", "18:00"]
const VALUES = [310, 342, 388, 325]

function renderEn(ui: React.ReactElement) {
	return render(<LocaleProvider locale="en">{ui}</LocaleProvider>)
}

const part = (container: HTMLElement, name: string) => container.querySelector(`[data-part="${name}"]`)

describe("LineChart", () => {
	test("draws one ink line through every value on three ticks, named by its first and last label", () => {
		renderEn(<LineChart labels={LABELS} values={VALUES} />)
		const svg = screen.getByRole("img", { name: "Line chart, 00:00 to 18:00" })
		expect(svg.querySelectorAll("line")).toHaveLength(3)
		expect(svg.querySelectorAll("rect")).toHaveLength(0)
		const d = svg.querySelector("path")!.getAttribute("d")!
		expect(d.match(/[ML]/g)).toEqual(["M", "L", "L", "L"])
	})

	test("the ticks cover the values, not zero", () => {
		const { container } = renderEn(<LineChart labels={LABELS} values={VALUES} />)
		for (const tick of ["300", "350", "400"]) expect(within(container).getByText(tick)).toBeInTheDocument()
		expect(within(container).queryByText("0")).toBeNull()
	})

	test("names the chart in Traditional Chinese by default, and aria-label overrides it", () => {
		const { rerender } = render(<LineChart labels={LABELS} values={VALUES} />)
		expect(screen.getByRole("img", { name: "折線圖，00:00 到 18:00" })).toBeInTheDocument()
		rerender(<LineChart labels={LABELS} values={VALUES} aria-label="p95 latency today" />)
		expect(screen.getByRole("img", { name: "p95 latency today" })).toBeInTheDocument()
	})

	test("screen readers get a table with the unit in the header", () => {
		renderEn(<LineChart labels={LABELS} values={VALUES} unit="ms" />)
		const table = screen.getByRole("table")
		expect(within(table).getByRole("columnheader", { name: "Value (ms)" })).toBeInTheDocument()
		expect(within(table).getByRole("row", { name: "12:00 388" })).toBeInTheDocument()
	})

	test("every point has a title with its label, value and unit", () => {
		const { container } = renderEn(<LineChart labels={LABELS} values={VALUES} unit="ms" />)
		const titles = [...container.querySelectorAll('[data-part="chart-slot"]')].map((s) =>
			s.getAttribute("title"),
		)
		expect(titles).toEqual(["00:00 · 310 ms", "06:00 · 342 ms", "12:00 · 388 ms", "18:00 · 325 ms"])
	})

	test("keyboard: one tab stop; focus shows the point and its value, arrows move", async () => {
		const user = userEvent.setup()
		const { container } = renderEn(<LineChart labels={LABELS} values={VALUES} unit="ms" />)
		const rows = screen.getAllByRole("row").slice(1)
		expect(part(container, "chart-point")).toBeNull()
		await user.tab()
		expect(rows[0]).toHaveFocus()
		expect(part(container, "chart-point")).not.toBeNull()
		expect(part(container, "chart-value")?.textContent).toBe("310 ms")
		await user.keyboard("{ArrowRight}{ArrowRight}")
		expect(rows[2]).toHaveFocus()
		expect(part(container, "chart-value")?.textContent).toBe("388 ms")
		await user.tab()
		expect(part(container, "chart-point")).toBeNull()
	})

	test("pointer: entering a point's slot shows it and leaving hides it", () => {
		const { container } = renderEn(<LineChart labels={LABELS} values={VALUES} unit="ms" />)
		const slot = container.querySelectorAll('[data-part="chart-slot"]')[3]!
		fireEvent.pointerEnter(slot)
		expect(part(container, "chart-value")?.textContent).toBe("325 ms")
		fireEvent.pointerLeave(slot)
		expect(part(container, "chart-value")).toBeNull()
	})

	test("one value still draws a mark", () => {
		renderEn(<LineChart labels={["Mon"]} values={[4]} />)
		expect(screen.getByRole("img").querySelector("path")!.getAttribute("d")!.match(/[ML]/g)).toEqual([
			"M",
			"L",
		])
	})

	test("axe: with a unit, without one, and empty", async () => {
		const { container } = renderEn(
			<>
				<LineChart labels={LABELS} values={VALUES} unit="ms" />
				<LineChart labels={["a", "b"]} values={[5, 5]} />
				<LineChart labels={[]} values={[]} />
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
