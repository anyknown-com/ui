import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Badge, Chip } from "./Badge"

describe("Badge", () => {
	test("renders its text without interactive semantics", () => {
		render(<Badge variant="accent">進行中</Badge>)
		const badge = screen.getByText("進行中")
		expect(badge.tagName).toBe("SPAN")
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	test("renders a count", () => {
		render(<Badge variant="accent" count={3}>等你 · </Badge>)
		expect(screen.getByText("3")).toBeInTheDocument()
	})

	test("the status dot is decorative", () => {
		const { container } = render(<Badge dot="accent">Fable 在線</Badge>)
		expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
		expect(screen.getByText("Fable 在線")).toBeInTheDocument()
	})
})

describe("Chip", () => {
	test("the remove control is a button with a specific label", async () => {
		const onRemove = vi.fn()
		render(
			<Chip onRemove={onRemove} removeLabel="移除篩選:工作區 anyknown">
				工作區:anyknown
			</Chip>,
		)
		const remove = screen.getByRole("button", { name: "移除篩選:工作區 anyknown" })
		await userEvent.click(remove)
		expect(onRemove).toHaveBeenCalledTimes(1)
	})

	test("is reachable and activatable by keyboard", async () => {
		const onRemove = vi.fn()
		render(
			<Chip onRemove={onRemove} removeLabel="移除篩選:本週">
				本週
			</Chip>,
		)
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "移除篩選:本週" })).toHaveFocus()
		await userEvent.keyboard("{Enter}")
		expect(onRemove).toHaveBeenCalledTimes(1)
	})
})
