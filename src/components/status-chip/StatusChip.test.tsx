import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Pill, StatusChip } from "./StatusChip"

const VARIANTS = ["r", "w", "d", "n", "a", "f", "plain"] as const

describe("StatusChip", () => {
	test("each variant draws differently", () => {
		render(
			<>
				{VARIANTS.map((variant) => (
					<StatusChip key={variant} variant={variant}>
						{variant}
					</StatusChip>
				))}
			</>,
		)
		const classes = VARIANTS.map((variant) => screen.getByText(variant).className)
		expect(new Set(classes).size).toBe(VARIANTS.length)
	})

	test("active spins and failed has a dot, both hidden from screen readers", () => {
		const { container } = render(
			<>
				<StatusChip variant="a">running</StatusChip>
				<StatusChip variant="f">failed</StatusChip>
				<StatusChip variant="r">read</StatusChip>
			</>,
		)
		const [active, failed, read] = [...container.children]
		expect(active.querySelector("[aria-hidden='true']")).not.toBeNull()
		expect(failed.querySelector("[aria-hidden='true']")).not.toBeNull()
		expect(read.querySelector("[aria-hidden='true']")).toBeNull()
		expect(active).toHaveTextContent("running")
	})
})

describe("Pill", () => {
	test("a status puts a hidden dot first", () => {
		const { container } = render(<Pill status="live">sub</Pill>)
		expect(container.firstElementChild?.firstElementChild).toHaveAttribute("aria-hidden", "true")
	})

	test("a title pill keeps the full name on hover", () => {
		render(<Pill title>整理九月的帳單</Pill>)
		expect(screen.getByText("整理九月的帳單")).toHaveAttribute("title", "整理九月的帳單")
	})
})

test("axe: every chip and pill", async () => {
	const { container } = render(
		<p>
			{VARIANTS.map((variant) => (
				<StatusChip key={variant} variant={variant}>
					{variant}
				</StatusChip>
			))}
			<Pill status="live">live</Pill>
			<Pill status="paused">paused</Pill>
			<Pill status="done">done</Pill>
			<Pill title>標題</Pill>
		</p>,
	)
	await expectNoAxeViolations(container)
})
