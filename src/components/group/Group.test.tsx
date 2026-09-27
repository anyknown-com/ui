import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { Group } from "./Group"

describe("Group", () => {
	test("header 在卡片上面、footer 在下面", () => {
		const { container } = render(
			<Group header="交接" footer="context 用到 60% 時交接。">
				<p>模型</p>
			</Group>,
		)
		const parts = [...(container.firstElementChild?.children ?? [])].map((child) => child.textContent)
		expect(parts).toEqual(["交接", "模型", "context 用到 60% 時交接。"])
	})

	test("沒給 header / footer 就只有卡片", () => {
		const { container } = render(
			<Group>
				<p>模型</p>
			</Group>,
		)
		expect(container.firstElementChild?.children).toHaveLength(1)
		expect(screen.getByText("模型")).toBeInTheDocument()
	})
})
