import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
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
		expect(screen.getByText("Ledger")).toBeInTheDocument()
		expect(screen.getByText(/3 筆耐久事實已落盤/)).toBeInTheDocument()
		expect(screen.getByText(/本輪 42 條收據可查/)).toBeInTheDocument()
		expect(screen.getByText(/landing 定價區塊/)).toBeInTheDocument()
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
		expect(document.getElementById(row.getAttribute("aria-controls") as string)).toHaveTextContent("Ledger")
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
