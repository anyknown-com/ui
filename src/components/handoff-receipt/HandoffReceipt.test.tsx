import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { HandoffReceipt } from "./HandoffReceipt"

const props = {
	at: "14:32",
	ctxPercent: 50,
	memory: { count: 3, items: ["偏好 pnpm", "部署走 Cloudflare"] },
	ledgerCount: 42,
	handoffSummary: "landing 定價區塊寫到三檔方案的表格。",
}

describe("HandoffReceipt", () => {
	test("collapsed by default: one row summarising the rotation", () => {
		render(<HandoffReceipt {...props} />)
		const row = screen.getByRole("button")
		expect(row).toHaveAttribute("aria-expanded", "false")
		expect(row).toHaveTextContent("換班完成")
		expect(row).toHaveTextContent("14:32")
		expect(row).toHaveTextContent("ctx 50%")
	})

	test("expands the three checks and the handoff summary", async () => {
		render(<HandoffReceipt {...props} />)
		await userEvent.click(screen.getByRole("button"))
		expect(screen.getByText("記憶")).toBeInTheDocument()
		expect(screen.getByText("摘要")).toBeInTheDocument()
		expect(screen.getByText("紀錄")).toBeInTheDocument()
		expect(screen.getByText("3 則記憶已存下(偏好 pnpm、部署走 Cloudflare)。")).toBeInTheDocument()
		expect(screen.getByText("交接摘要已交給新 session,讀過就刪除。")).toBeInTheDocument()
		expect(screen.getByText("這一輪的 42 筆紀錄還查得到,不會帶進新 session。")).toBeInTheDocument()
		expect(screen.getByText(/landing 定價區塊/)).toBeInTheDocument()
	})

	test("the three checks take their words from props", async () => {
		render(
			<HandoffReceipt
				{...props}
				defaultOpen
				memoryTitle="Memory"
				summaryTitle="Summary"
				ledgerTitle="Records"
				memoryLabel={(count, items) => `${count} kept: ${items.join(", ")}`}
				summaryLabel="Handed to the new session."
				ledgerLabel={(count) => `${count} records stay searchable.`}
			/>,
		)
		expect(screen.getByText("Memory")).toBeInTheDocument()
		expect(screen.getByText("Summary")).toBeInTheDocument()
		expect(screen.getByText("Records")).toBeInTheDocument()
		expect(screen.getByText("3 kept: 偏好 pnpm, 部署走 Cloudflare")).toBeInTheDocument()
		expect(screen.getByText("Handed to the new session.")).toBeInTheDocument()
		expect(screen.getByText("42 records stay searchable.")).toBeInTheDocument()
	})

	test("no items, no brackets", async () => {
		render(<HandoffReceipt {...props} memory={{ count: 2 }} defaultOpen />)
		expect(screen.getByText("2 則記憶已存下。")).toBeInTheDocument()
	})

	test("Enter and Space toggle the row", async () => {
		render(<HandoffReceipt {...props} />)
		const row = screen.getByRole("button")
		row.focus()
		await userEvent.keyboard("{Enter}")
		expect(row).toHaveAttribute("aria-expanded", "true")
		await userEvent.keyboard(" ")
		expect(row).toHaveAttribute("aria-expanded", "false")
	})

	test("the row controls the body it expands", async () => {
		render(<HandoffReceipt {...props} defaultOpen />)
		const row = screen.getByRole("button")
		expect(document.getElementById(row.getAttribute("aria-controls") as string)).toHaveTextContent("紀錄")
	})

	test("hard-limit is marked in the row text, not only by colour", () => {
		render(<HandoffReceipt {...props} ctxPercent={80} reason="hard-limit" />)
		expect(screen.getByRole("button")).toHaveTextContent("(硬上限)")
	})

	test("carries no actions — it is a receipt", async () => {
		render(<HandoffReceipt {...props} />)
		await userEvent.click(screen.getByRole("button"))
		expect(screen.getAllByRole("button")).toHaveLength(1)
	})
})

describe("HandoffReceipt regressions", () => {
	// 展開改成 0fr→1fr 的平滑收合後,收合狀態不再是 hidden(要能動畫),
	// 但仍必須離開 a11y tree 與 tab 序 —— 用 inert。
	test("aria-controls resolves while collapsed, and the body stays inert", async () => {
		render(<HandoffReceipt {...props} />)
		const row = screen.getByRole("button")
		const body = document.getElementById(row.getAttribute("aria-controls") as string)
		expect(body).not.toBeNull()
		expect(body).toHaveAttribute("inert")
		await userEvent.click(row)
		expect(document.getElementById(row.getAttribute("aria-controls") as string)).not.toHaveAttribute("inert")
	})
})

describe("HandoffReceipt open state", () => {
	test("uncontrolled: defaultOpen sets the start and onOpenChange reports each toggle", async () => {
		const onOpenChange = vi.fn()
		render(<HandoffReceipt {...props} defaultOpen onOpenChange={onOpenChange} />)
		const row = screen.getByRole("button")
		expect(row).toHaveAttribute("aria-expanded", "true")
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "false")
		expect(onOpenChange).toHaveBeenLastCalledWith(false)
		await userEvent.click(row)
		expect(onOpenChange).toHaveBeenLastCalledWith(true)
	})

	test("controlled: open wins and a click only asks", async () => {
		const onOpenChange = vi.fn()
		const { rerender } = render(<HandoffReceipt {...props} open={false} onOpenChange={onOpenChange} />)
		const row = screen.getByRole("button")
		await userEvent.click(row)
		expect(onOpenChange).toHaveBeenCalledWith(true)
		expect(row).toHaveAttribute("aria-expanded", "false")
		rerender(<HandoffReceipt {...props} open onOpenChange={onOpenChange} />)
		expect(row).toHaveAttribute("aria-expanded", "true")
	})
})
