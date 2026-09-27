import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { Group, Status } from "./Group"

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

function dotOf(text: string) {
	return screen.getByText(text).parentElement?.querySelector("[aria-hidden='true']")
}

describe("Status", () => {
	test("沒給 dot 就只有字", () => {
		render(<Status>連上了</Status>)
		expect(dotOf("連上了")).toBeNull()
	})

	test("實心、空心、虛線三種點", () => {
		render(
			<>
				<Status dot="filled" tone="success">
					還對
				</Status>
				<Status dot="hollow">待確認</Status>
				<Status dot="dashed" tone="danger">
					過期
				</Status>
			</>,
		)
		expect(dotOf("還對")).toHaveStyle({ borderStyle: "none" })
		expect(dotOf("待確認")).toHaveStyle({ borderStyle: "solid", borderWidth: "1.5px" })
		expect(dotOf("過期")).toHaveStyle({ borderStyle: "dashed" })
	})

	test("warn 是實心的 warning 點", () => {
		render(<Status warn>要處理</Status>)
		expect(dotOf("要處理")).not.toBeNull()
		expect(dotOf("要處理")).toHaveStyle({ borderStyle: "none" })
	})
})
