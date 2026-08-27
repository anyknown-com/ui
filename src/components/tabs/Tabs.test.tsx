import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { Tabs, TabsList, TabsPanel, TabsTab } from "./Tabs"

function ThreadTabs({ variant }: { variant?: "underline" | "pills" }) {
	return (
		<Tabs defaultValue="chat" variant={variant}>
			<TabsList aria-label="Thread 檢視">
				<TabsTab value="chat">對話</TabsTab>
				<TabsTab value="memory">記憶</TabsTab>
				<TabsTab value="handoff" disabled>
					換班紀錄
				</TabsTab>
			</TabsList>
			<TabsPanel value="chat">這個 thread 目前有 12 則訊息。</TabsPanel>
			<TabsPanel value="memory">本次工作區共留下 7 條記憶。</TabsPanel>
			<TabsPanel value="handoff">昨天 18:00 交接。</TabsPanel>
		</Tabs>
	)
}

describe("Tabs", () => {
	test("renders a labelled tablist with the first tab selected", () => {
		render(<ThreadTabs />)
		expect(screen.getByRole("tablist", { name: "Thread 檢視" })).toBeInTheDocument()
		expect(screen.getByRole("tab", { name: "對話" })).toHaveAttribute("aria-selected", "true")
		expect(screen.getByRole("tabpanel")).toHaveTextContent("12 則訊息")
	})

	test("switches panel on click", async () => {
		render(<ThreadTabs />)
		await userEvent.click(screen.getByRole("tab", { name: "記憶" }))
		expect(screen.getByRole("tabpanel")).toHaveTextContent("7 條記憶")
	})

	test("roving tabindex keeps a single tab stop", () => {
		render(<ThreadTabs />)
		expect(screen.getByRole("tab", { name: "對話" })).toHaveAttribute("tabindex", "0")
		expect(screen.getByRole("tab", { name: "記憶" })).toHaveAttribute("tabindex", "-1")
	})

	// Base UI activates manually (arrow moves focus, Enter/Space selects) and keeps
	// a disabled tab focusable via aria-disabled. NOTES updated to match.
	test("arrow keys move between tabs and a disabled tab never activates", async () => {
		render(<ThreadTabs />)
		screen.getByRole("tab", { name: "對話" }).focus()
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("tab", { name: "記憶" })).toHaveFocus()
		await userEvent.keyboard("{Enter}")
		expect(screen.getByRole("tabpanel")).toHaveTextContent("7 條記憶")
		await userEvent.keyboard("{ArrowRight}")
		const disabled = screen.getByRole("tab", { name: "換班紀錄" })
		expect(disabled).toHaveAttribute("aria-disabled", "true")
		expect(disabled).toHaveAttribute("aria-selected", "false")
		expect(screen.getByRole("tabpanel")).toHaveTextContent("7 條記憶")
	})

	test("the panel is labelled by its tab and reachable by keyboard", () => {
		render(<ThreadTabs />)
		const panel = screen.getByRole("tabpanel")
		const tab = screen.getByRole("tab", { name: "對話" })
		expect(panel).toHaveAttribute("aria-labelledby", tab.id)
		expect(panel).toHaveAttribute("tabindex", "0")
	})

	test("pills variant keeps tab semantics", () => {
		render(<ThreadTabs variant="pills" />)
		expect(screen.getByRole("tab", { name: "對話" })).toHaveAttribute("aria-selected", "true")
	})
})

describe("Tabs regressions", () => {
	test("a disabled tab is visually distinct, not only aria-disabled", () => {
		render(<ThreadTabs />)
		const enabled = screen.getByRole("tab", { name: "記憶" })
		const disabled = screen.getByRole("tab", { name: "換班紀錄" })
		expect(disabled).toHaveAttribute("aria-disabled", "true")
		expect(disabled.className).not.toBe(enabled.className)
	})
})
