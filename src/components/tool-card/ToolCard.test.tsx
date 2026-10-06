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

	test("a clipped subtitle keeps the full path on hover", () => {
		const path = "apps/desktop/src/renderer/thread/tool-part.tsx"
		render(<ToolCard tool="read" subtitle={path} />)
		expect(screen.getByText(path)).toHaveAttribute("title", path)
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

	test("retry shows and announces the wait, the attempt and the max in one line", () => {
		render(<ToolCard tool="shell" state="error" retry={{ attempt: 2, max: 3, delayMs: 3000 }} />)
		expect(screen.getByRole("status")).toHaveTextContent("3 秒後重試(第 2 / 3 次)")
		expect(screen.getByText("3 秒後重試(第 2 / 3 次)")).toBeInTheDocument()
	})

	test("retryLabel replaces the retry line's words", () => {
		render(
			<ToolCard
				tool="shell"
				state="error"
				retry={{ attempt: 1, max: 5, delayMs: 2400 }}
				retryLabel={(attempt, max, seconds) => `Retrying in ${seconds}s (${attempt} of ${max})`}
			/>,
		)
		expect(screen.getByRole("status")).toHaveTextContent("Retrying in 2s (1 of 5)")
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

describe("ToolCard open state", () => {
	test("uncontrolled: defaultOpen overrides the per-tool default and onOpenChange reports clicks", async () => {
		const onOpenChange = vi.fn()
		render(<ToolCard tool="read" subtitle="a.ts" defaultOpen onOpenChange={onOpenChange} />)
		const row = screen.getByRole("button")
		expect(row).toHaveAttribute("aria-expanded", "true")
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "false")
		expect(onOpenChange).toHaveBeenCalledWith(false)
	})

	test("controlled: open wins and a click only asks", async () => {
		const onOpenChange = vi.fn()
		const { rerender } = render(
			<ToolCard tool="shell" subtitle="ls" open={false} onOpenChange={onOpenChange} />,
		)
		const row = screen.getByRole("button")
		expect(row).toHaveAttribute("aria-expanded", "false")
		await userEvent.click(row)
		expect(onOpenChange).toHaveBeenCalledWith(true)
		expect(row).toHaveAttribute("aria-expanded", "false")
		rerender(<ToolCard tool="shell" subtitle="ls" open onOpenChange={onOpenChange} />)
		expect(row).toHaveAttribute("aria-expanded", "true")
	})

	test("controlled: an error does not force it open, and the auto-open is not reported", () => {
		const onOpenChange = vi.fn()
		const { rerender } = render(
			<ToolCard tool="read" state="running" open={false} onOpenChange={onOpenChange} />,
		)
		rerender(<ToolCard tool="read" state="error" open={false} onOpenChange={onOpenChange} />)
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false")
		expect(onOpenChange).not.toHaveBeenCalled()
	})

	test("Enter and Space toggle the row", async () => {
		render(<ToolCard tool="read" subtitle="a.ts" />)
		const row = screen.getByRole("button")
		row.focus()
		await userEvent.keyboard("{Enter}")
		expect(row).toHaveAttribute("aria-expanded", "true")
		await userEvent.keyboard(" ")
		expect(row).toHaveAttribute("aria-expanded", "false")
	})
})

describe("ToolCard progress", () => {
	test("indeterminate by default: no progressbar is exposed", () => {
		render(<ToolCard tool="fetch" state="running" subtitle="example.com" />)
		expect(screen.queryByRole("progressbar")).toBeNull()
	})

	test("a fraction becomes a named 0–100 progressbar while running", () => {
		render(<ToolCard tool="fetch" state="running" subtitle="example.com" progress={0.426} />)
		const bar = screen.getByRole("progressbar", { name: "取得 example.com" })
		expect(bar).toHaveAttribute("aria-valuenow", "43")
		expect(bar).toHaveAttribute("aria-valuemin", "0")
		expect(bar).toHaveAttribute("aria-valuemax", "100")
	})

	test("values outside 0–1 are clamped", () => {
		const { rerender } = render(<ToolCard tool="fetch" state="running" progress={1.7} />)
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
		rerender(<ToolCard tool="fetch" state="running" progress={-0.2} />)
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
	})

	test("only while running", () => {
		render(<ToolCard tool="fetch" state="completed" progress={1} />)
		expect(screen.queryByRole("progressbar")).toBeNull()
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
