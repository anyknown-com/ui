import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Button } from "../button/Button"
import { EmptyState } from "./EmptyState"

describe("EmptyState", () => {
	test("renders a real heading at the requested level", () => {
		render(<EmptyState title="還沒有記憶" description="開始第一個 thread。" />)
		expect(screen.getByRole("heading", { level: 3, name: "還沒有記憶" })).toBeInTheDocument()
		render(<EmptyState title="找不到 thread" headingLevel={2} />)
		expect(screen.getByRole("heading", { level: 2, name: "找不到 thread" })).toBeInTheDocument()
	})

	test("the icon is decorative", () => {
		const { container } = render(<EmptyState icon={<svg data-testid="icon" />} title="還沒有記憶" />)
		expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
		expect(screen.getByRole("heading", { name: "還沒有記憶" })).toBeInTheDocument()
	})

	test("the action is a real button reachable by keyboard", async () => {
		const onClick = vi.fn()
		render(<EmptyState title="還沒有記憶" action={<Button onClick={onClick}>開始第一個 thread</Button>} />)
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "開始第一個 thread" })).toHaveFocus()
		await userEvent.keyboard("{Enter}")
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	test("renders without an action for read-only empty states", () => {
		render(<EmptyState title="這一天沒有紀錄" description="8 月 26 日工作區是安靜的。" />)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})
})
