import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Spin } from "./Spin"

describe("Spin", () => {
	test("is decorative: the busy state is said by its owner", () => {
		const { container } = render(<Spin />)
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
	})

	test("small is a smaller ring", () => {
		const { container } = render(
			<>
				<Spin />
				<Spin small />
			</>,
		)
		const [normal, small] = [...container.children] as HTMLElement[]
		expect(normal).toHaveStyle({ width: "12px", height: "12px" })
		expect(small).toHaveStyle({ width: "9px", height: "9px" })
	})

	test("axe: inside a busy region", async () => {
		const { container } = render(
			<p aria-busy="true">
				<Spin /> 載入中
			</p>,
		)
		await expectNoAxeViolations(container)
	})
})
