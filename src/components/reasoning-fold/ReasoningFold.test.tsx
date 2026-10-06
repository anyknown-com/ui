import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, test, vi } from "vitest"
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

describe("ReasoningFold open state", () => {
	afterEach(() => vi.useRealTimers())

	test("uncontrolled: defaultOpen starts it open; onOpenChange and the deprecated onToggle both fire", async () => {
		const onOpenChange = vi.fn()
		const onToggle = vi.fn()
		render(
			<ReasoningFold durationSec={3} defaultOpen onOpenChange={onOpenChange} onToggle={onToggle}>
				內容
			</ReasoningFold>,
		)
		const row = screen.getByRole("button")
		expect(row).toHaveAttribute("aria-expanded", "true")
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "false")
		expect(onOpenChange).toHaveBeenCalledWith(false)
		expect(onToggle).toHaveBeenCalledWith(false)
	})

	test("controlled: open wins and a click only asks", async () => {
		const onOpenChange = vi.fn()
		const { rerender } = render(
			<ReasoningFold durationSec={3} open={false} onOpenChange={onOpenChange}>
				內容
			</ReasoningFold>,
		)
		const row = screen.getByRole("button")
		await userEvent.click(row)
		expect(onOpenChange).toHaveBeenCalledWith(true)
		expect(row).toHaveAttribute("aria-expanded", "false")
		rerender(
			<ReasoningFold durationSec={3} open onOpenChange={onOpenChange}>
				內容
			</ReasoningFold>,
		)
		expect(row).toHaveAttribute("aria-expanded", "true")
	})

	test("controlled: streaming neither opens nor collapses it", () => {
		vi.useFakeTimers()
		const onOpenChange = vi.fn()
		const { rerender } = render(
			<ReasoningFold open={false} onOpenChange={onOpenChange}>
				內容
			</ReasoningFold>,
		)
		rerender(
			<ReasoningFold open={false} streaming onOpenChange={onOpenChange}>
				內容
			</ReasoningFold>,
		)
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false")
		rerender(
			<ReasoningFold open durationSec={2} onOpenChange={onOpenChange}>
				內容
			</ReasoningFold>,
		)
		act(() => vi.advanceTimersByTime(2000))
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
		expect(onOpenChange).not.toHaveBeenCalled()
	})

	test("Enter and Space toggle the row", async () => {
		render(<ReasoningFold durationSec={3}>內容</ReasoningFold>)
		const row = screen.getByRole("button")
		row.focus()
		await userEvent.keyboard("{Enter}")
		expect(row).toHaveAttribute("aria-expanded", "true")
		await userEvent.keyboard(" ")
		expect(row).toHaveAttribute("aria-expanded", "false")
	})
})

describe("ReasoningFold auto collapse", () => {
	afterEach(() => vi.useRealTimers())

	test("focus inside the body moves back to the row when it collapses", () => {
		vi.useFakeTimers()
		const { rerender } = render(
			<ReasoningFold streaming>
				<a href="#source">來源</a>
			</ReasoningFold>,
		)
		rerender(
			<ReasoningFold durationSec={2}>
				<a href="#source">來源</a>
			</ReasoningFold>,
		)
		screen.getByRole("link").focus()
		act(() => vi.advanceTimersByTime(1000))
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false")
		expect(screen.getByRole("button")).toHaveFocus()
	})

	test("streaming again before the timer fires cancels the collapse", () => {
		vi.useFakeTimers()
		const { rerender } = render(<ReasoningFold streaming>內容</ReasoningFold>)
		rerender(<ReasoningFold durationSec={2}>內容</ReasoningFold>)
		act(() => vi.advanceTimersByTime(500))
		rerender(<ReasoningFold streaming>內容</ReasoningFold>)
		act(() => vi.advanceTimersByTime(1500))
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true")
	})

	test("unmounting clears the pending timer", () => {
		vi.useFakeTimers()
		const { rerender, unmount } = render(<ReasoningFold streaming>內容</ReasoningFold>)
		rerender(<ReasoningFold durationSec={2}>內容</ReasoningFold>)
		expect(vi.getTimerCount()).toBe(1)
		unmount()
		expect(vi.getTimerCount()).toBe(0)
	})
})
