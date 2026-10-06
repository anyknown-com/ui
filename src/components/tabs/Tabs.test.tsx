import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
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

describe("Tabs state", () => {
	test("uncontrolled: defaultValue picks the tab, onValueChange hears a switch", async () => {
		const onValueChange = vi.fn()
		render(
			<Tabs defaultValue="memory" onValueChange={onValueChange}>
				<TabsList aria-label="檢視">
					<TabsTab value="chat">對話</TabsTab>
					<TabsTab value="memory">記憶</TabsTab>
				</TabsList>
				<TabsPanel value="chat">a</TabsPanel>
				<TabsPanel value="memory">b</TabsPanel>
			</Tabs>,
		)
		expect(screen.getByRole("tab", { name: "記憶" })).toHaveAttribute("aria-selected", "true")
		await userEvent.click(screen.getByRole("tab", { name: "對話" }))
		expect(screen.getByRole("tab", { name: "對話" })).toHaveAttribute("aria-selected", "true")
		expect(onValueChange.mock.calls[0][0]).toBe("chat")
	})

	test("controlled: the selected tab follows value only", async () => {
		const onValueChange = vi.fn()
		render(
			<Tabs value="chat" onValueChange={onValueChange}>
				<TabsList aria-label="檢視">
					<TabsTab value="chat">對話</TabsTab>
					<TabsTab value="memory">記憶</TabsTab>
				</TabsList>
				<TabsPanel value="chat">a</TabsPanel>
				<TabsPanel value="memory">b</TabsPanel>
			</Tabs>,
		)
		await userEvent.click(screen.getByRole("tab", { name: "記憶" }))
		expect(onValueChange.mock.calls[0][0]).toBe("memory")
		expect(screen.getByRole("tab", { name: "對話" })).toHaveAttribute("aria-selected", "true")
	})
})

/** The declarations StyleX put under `@media (forced-colors: active)` for this element's classes. */
function forcedCss(element: Element) {
	let css = ""
	for (const sheet of Array.from(document.styleSheets))
		for (const rule of Array.from(sheet.cssRules)) {
			if (!(rule instanceof CSSMediaRule) || !rule.media.mediaText.includes("forced-colors")) continue
			for (const inner of Array.from(rule.cssRules)) {
				const owner = inner instanceof CSSStyleRule ? inner.selectorText.match(/^\.([\w-]+)/)?.[1] : null
				if (owner != null && element.classList.contains(owner)) css += `${inner.cssText}\n`
			}
		}
	return css
}

describe("Tabs in forced-colors", () => {
	test("the underline indicator is Highlight; a disabled tab is GrayText", () => {
		render(<ThreadTabs />)
		const indicator = screen.getByRole("tablist").lastElementChild as HTMLElement
		expect(forcedCss(indicator)).toMatch(/background-color: highlight/i)
		expect(forcedCss(screen.getByRole("tab", { name: "換班紀錄" }))).toMatch(/color: graytext/i)
	})

	test("pills: a Highlight pill under HighlightText words", () => {
		render(<ThreadTabs variant="pills" />)
		const indicator = screen.getByRole("tablist").lastElementChild as HTMLElement
		expect(forcedCss(indicator)).toMatch(/background-color: highlight/i)
		expect(forcedCss(screen.getByRole("tab", { name: "對話" }))).toMatch(/color: highlighttext/i)
	})
})

test("axe: underline and pills, with a disabled tab", async () => {
	const { container } = render(
		<>
			<ThreadTabs />
			<ThreadTabs variant="pills" />
		</>,
	)
	await expectNoAxeViolations(container)
})
