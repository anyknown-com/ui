import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { SubagentLine, SubagentSummary, ToolCard, ToolError, ToolInput, ToolOutput } from "./ToolCard"

describe("ToolCard", () => {
	test("the whole row is one expandable button", async () => {
		render(
			<ToolCard tool="read" subtitle="tool-part.tsx" durationMs={300}>
				<ToolInput json={{ filePath: "tool-part.tsx" }} />
			</ToolCard>,
		)
		const row = screen.getByRole("button", { expanded: false })
		expect(row).toHaveTextContent("讀取")
		expect(row).toHaveTextContent("300ms")
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText(/filePath/)).toBeVisible()
	})

	test("shell and error default to expanded, read defaults to collapsed", () => {
		const { unmount } = render(<ToolCard tool="shell" subtitle="pnpm test" />)
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
		unmount()
		render(<ToolCard tool="read" state="error" subtitle="x" />)
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
	})

	test("a persistent live region reports the card's state", () => {
		const { rerender } = render(<ToolCard tool="search" state="running" subtitle="parentCallID" />)
		expect(screen.getByRole("status")).toHaveTextContent("執行中")
		rerender(<ToolCard tool="search" state="completed" subtitle="parentCallID" />)
		expect(screen.getByRole("status")).toHaveTextContent("完成")
	})

	test("state icons carry a text label, not colour alone", () => {
		const { unmount } = render(<ToolCard tool="read" state="completed" />)
		expect(screen.getByRole("button")).toHaveTextContent("完成")
		unmount()
		render(<ToolCard tool="read" state="error" />)
		expect(screen.getByRole("button")).toHaveTextContent("失敗")
	})

	test("retry is announced with its attempt count", () => {
		render(<ToolCard tool="shell" state="error" retry={{ attempt: 2, max: 3, delayMs: 3000 }} />)
		expect(screen.getByRole("status")).toHaveTextContent("重試中(第 2 次,3 秒後)")
		expect(screen.getByText("重試 2/3")).toBeInTheDocument()
	})

	test("the error block copies its text", async () => {
		const spy = vi.fn().mockResolvedValue(undefined)
		Object.assign(navigator, { clipboard: { writeText: spy } })
		render(
			<ToolCard tool="shell" state="error">
				<ToolError text="Error: ENOMEM" />
			</ToolCard>,
		)
		await userEvent.click(screen.getByRole("button", { name: "複製錯誤" }))
		expect(spy).toHaveBeenCalledWith("Error: ENOMEM")
	})

	test("output panes scroll on their own and are keyboard reachable", () => {
		render(
			<ToolCard tool="shell" state="completed">
				<ToolOutput text="Tests 84 passed" />
			</ToolCard>,
		)
		expect(screen.getByText("Tests 84 passed")).toHaveAttribute("tabindex", "0")
	})

	test("subagent variant renders the model chip and now line", () => {
		render(
			<ToolCard
				tool="subagent"
				subtitle="調查 retry 事件缺漏"
				state="running"
				durationLabel="01:24"
				secondLine={<SubagentLine model="sonnet-5" now="搜尋 session.retrying" />}
			/>,
		)
		expect(screen.getByRole("button")).toHaveTextContent("委派")
		expect(screen.getByText("sonnet-5")).toBeInTheDocument()
		expect(screen.getByText("搜尋 session.retrying")).toBeInTheDocument()
	})

	test("a completed subagent shows its summary while collapsed", () => {
		render(
			<ToolCard
				tool="subagent"
				subtitle="調查 retry 事件缺漏"
				state="completed"
				secondLine={<SubagentLine model="sonnet-5" toolCount={7} />}
				footer={<SubagentSummary>缺口在 turn.ts</SubagentSummary>}
			/>,
		)
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false")
		expect(screen.getByText("缺口在 turn.ts")).toBeVisible()
		expect(screen.getByText("7 工具")).toBeInTheDocument()
	})
})

describe("ToolCard regressions", () => {
	// `display: grid` in the style would otherwise beat the UA's [hidden] rule
	test("the collapsed detail panel really is hidden", () => {
		render(
			<ToolCard tool="read" subtitle="a.ts">
				<ToolOutput text="secret" />
			</ToolCard>,
		)
		expect(screen.getByText("secret")).not.toBeVisible()
	})
})

describe("ToolCard state transitions", () => {
	test("a card that starts running and later errors opens itself", () => {
		const { rerender } = render(<ToolCard tool="read" state="running" subtitle="a.ts" />)
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false")
		rerender(<ToolCard tool="read" state="error" subtitle="a.ts" />)
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
	})
})
