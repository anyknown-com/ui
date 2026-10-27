import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { type ToolGroupCall, ToolGroup } from "./ToolGroup"

const CALLS: ToolGroupCall[] = [
	{
		id: "1",
		tool: "web.fetch",
		summary: "example.com",
		input: { url: "https://example.com" },
		output: "200 OK",
	},
	{ id: "2", tool: "pdf.read", summary: "report.pdf" },
	{ id: "3", tool: "web.fetch", summary: "example.org" },
]

describe("ToolGroup", () => {
	test("標題數呼叫次數,每個工具只列一次", () => {
		render(<ToolGroup calls={CALLS} />)
		expect(screen.getByRole("button", { name: "用了 3 次工具：web.fetch ×2、pdf.read" })).toHaveAttribute(
			"aria-expanded",
			"true",
		)
	})

	test("reads English under an en LocaleProvider", () => {
		render(
			<LocaleProvider locale="en">
				<ToolGroup calls={CALLS} />
				<ToolGroup calls={[CALLS[1] as ToolGroupCall]} />
			</LocaleProvider>,
		)
		expect(
			screen.getByRole("button", { name: "Made 3 tool calls: web.fetch ×2, pdf.read" }),
		).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Made 1 tool call: pdf.read" })).toBeInTheDocument()
	})

	test("標題收起清單,回報新狀態", async () => {
		const onOpenChange = vi.fn()
		render(<ToolGroup calls={CALLS} onOpenChange={onOpenChange} />)
		const head = screen.getByRole("button", { name: /用了 3 次工具/ })
		await userEvent.click(head)
		expect(head).toHaveAttribute("aria-expanded", "false")
		expect(screen.queryByRole("list")).toBeNull()
		expect(onOpenChange).toHaveBeenCalledWith(false)
	})

	test("controlled: open belongs to the caller", async () => {
		render(<ToolGroup calls={CALLS} open={false} />)
		await userEvent.click(screen.getByRole("button", { name: /用了 3 次工具/ }))
		expect(screen.queryByRole("list")).toBeNull()
	})

	test("一列一個呼叫,點開看 input 和 output", async () => {
		render(<ToolGroup calls={CALLS} />)
		expect(screen.getAllByRole("listitem")).toHaveLength(3)
		const row = screen.getByRole("button", { name: /example\.com/ })
		expect(row).toHaveAttribute("title", "web.fetch")
		expect(row).toHaveAttribute("aria-expanded", "false")
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText(/"url": "https:\/\/example.com"/)).toBeInTheDocument()
		expect(screen.getByText("200 OK")).toBeInTheDocument()
	})

	test("沒有 input 就沒有 PayloadBlock", async () => {
		render(<ToolGroup calls={CALLS} />)
		await userEvent.click(screen.getByRole("button", { name: /report\.pdf/ }))
		expect(screen.queryByRole("button", { name: "複製" })).toBeNull()
	})

	test("highlight 交給 PayloadBlock", async () => {
		const highlight = vi.fn((code: string) => <code data-testid="lit">{code.length}</code>)
		render(<ToolGroup calls={CALLS} highlight={highlight} />)
		await userEvent.click(screen.getByRole("button", { name: /example\.com/ }))
		expect(screen.getByTestId("lit")).toBeInTheDocument()
	})

	test("風險字寫在摘要後面", () => {
		render(
			<ToolGroup
				calls={[{ id: "1", tool: "mcp_call", summary: "stripe/charges_create", risk: ["花錢", "刪除"] }]}
			/>,
		)
		expect(screen.getByRole("button", { name: /stripe/ }).textContent).toBe(
			"✓stripe/charges_create花錢 · 刪除",
		)
	})

	test("labels override the title", () => {
		render(<ToolGroup calls={CALLS} labels={{ title: (count: number) => `${count} calls` }} />)
		expect(screen.getByRole("button", { name: "3 calls" })).toBeInTheDocument()
	})

	test("failed 的呼叫畫 ✕,其他畫 ✓", () => {
		render(
			<ToolGroup
				calls={[
					{ id: "1", tool: "shell", summary: "ok" },
					{ id: "2", tool: "shell", summary: "boom", failed: true },
				]}
			/>,
		)
		expect(screen.getByRole("button", { name: /boom/ })).toHaveTextContent("✕")
		expect(screen.getByRole("button", { name: /ok/ })).toHaveTextContent("✓")
	})

	test("duration 寫在列尾", () => {
		render(<ToolGroup calls={[{ id: "1", tool: "shell", summary: "build", duration: "2.1 秒" }]} />)
		expect(screen.getByText("2.1 秒")).toBeInTheDocument()
	})

	test("title 取代計數標題", () => {
		render(<ToolGroup calls={CALLS} title="查了 3 個地方" />)
		expect(screen.getByRole("button", { name: "查了 3 個地方" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /用了 3 次工具/ })).toBeNull()
	})

	test("has no axe violations, closed and open", async () => {
		const { container } = render(<ToolGroup calls={CALLS} />)
		await expectNoAxeViolations(container)
		await userEvent.click(screen.getByRole("button", { name: /example\.com/ }))
		await expectNoAxeViolations(container)
	})
})
