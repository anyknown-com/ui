import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { ReasoningFold } from "./ReasoningFold"

describe("ReasoningFold", () => {
	test("collapsed by default with the duration label", () => {
		render(<ReasoningFold durationSec={12}>推理內容</ReasoningFold>)
		const row = screen.getByRole("button", { name: "思考了 12 秒" })
		expect(row).toHaveAttribute("aria-expanded", "false")
		expect(screen.getByText("推理內容")).not.toBeVisible()
	})

	test("toggles open and closed", async () => {
		const onToggle = vi.fn()
		render(
			<ReasoningFold durationSec={12} onToggle={onToggle}>
				推理內容
			</ReasoningFold>,
		)
		const row = screen.getByRole("button")
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText("推理內容")).toBeVisible()
		expect(onToggle).toHaveBeenCalledWith(true)
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "false")
	})

	test("the row controls the body it expands", () => {
		render(<ReasoningFold durationSec={3}>內容</ReasoningFold>)
		const row = screen.getByRole("button")
		expect(document.getElementById(row.getAttribute("aria-controls") as string)).toHaveTextContent("內容")
	})

	test("streaming opens it and shows the thinking label", () => {
		render(<ReasoningFold streaming>串流中</ReasoningFold>)
		expect(screen.getByRole("button", { name: "思考中…" })).toHaveAttribute("aria-expanded", "true")
	})

	test("collapses shortly after streaming ends, unless the user has toggled", async () => {
		const { rerender } = render(<ReasoningFold streaming>內容</ReasoningFold>)
		rerender(
			<ReasoningFold streaming={false} durationSec={4}>
				內容
			</ReasoningFold>,
		)
		await waitFor(() => expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false"), {
			timeout: 2000,
		})
	})

	test("a manual toggle wins over the auto collapse", async () => {
		const { rerender } = render(<ReasoningFold streaming>內容</ReasoningFold>)
		await userEvent.click(screen.getByRole("button"))
		await userEvent.click(screen.getByRole("button"))
		rerender(
			<ReasoningFold streaming={false} durationSec={4}>
				內容
			</ReasoningFold>,
		)
		await new Promise((resolve) => setTimeout(resolve, 1200))
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
	})
})
