import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Button } from "./Button"

describe("Button", () => {
	test("is a type=button that calls onClick", async () => {
		const onClick = vi.fn()
		render(<Button onClick={onClick}>儲存</Button>)
		const button = screen.getByRole("button", { name: "儲存" })
		expect(button).toHaveAttribute("type", "button")
		await userEvent.click(button)
		expect(onClick).toHaveBeenCalledOnce()
	})

	test("a caller's type wins, and it submits its form", async () => {
		const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
		render(
			<form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
				<Button type="submit">送出</Button>
			</form>,
		)
		await userEvent.click(screen.getByRole("button", { name: "送出" }))
		expect(onSubmit).toHaveBeenCalledOnce()
	})

	test("disabled does not click", async () => {
		const onClick = vi.fn()
		render(
			<Button disabled onClick={onClick}>
				儲存
			</Button>,
		)
		await userEvent.click(screen.getByRole("button"))
		expect(onClick).not.toHaveBeenCalled()
	})

	test("forwards the ref and keeps the caller's className and style", () => {
		const ref = createRef<HTMLButtonElement>()
		render(
			<Button ref={ref} className="mine" style={{ width: "160px" }}>
				儲存
			</Button>,
		)
		const button = screen.getByRole("button")
		expect(ref.current).toBe(button)
		expect(button.className).toContain("mine")
		expect(button).toHaveStyle({ width: "160px" })
	})

	test("each variant and size draws differently", () => {
		const { container } = render(
			<>
				<Button>a</Button>
				<Button variant="secondary">a</Button>
				<Button variant="ghost">a</Button>
				<Button variant="danger">a</Button>
				<Button variant="dangerGhost">a</Button>
				<Button size="lg">a</Button>
				<Button size="xs" icon>
					a
				</Button>
			</>,
		)
		const classes = [...container.querySelectorAll("button")].map((button) => button.className)
		expect(new Set(classes).size).toBe(classes.length)
	})
})

describe("Button loading", () => {
	test("is busy, keeps its name and shows a spinner", () => {
		const { container } = render(<Button loading>儲存</Button>)
		const button = screen.getByRole("button", { name: "儲存" })
		expect(button).toHaveAttribute("aria-busy", "true")
		expect(button).toHaveAttribute("aria-disabled", "true")
		expect(button).not.toBeDisabled()
		expect(container.querySelectorAll("button > span")).toHaveLength(2)
	})

	test("the label stays in the layout (keeps the width), only faded out", () => {
		render(<Button loading>儲存</Button>)
		const label = screen.getByText("儲存")
		expect(label).toHaveStyle({ opacity: "0" })
		expect(label).not.toHaveStyle({ display: "none" })
		expect(label).not.toHaveStyle({ visibility: "hidden" })
	})

	test("blocks clicks and form submission but stays focusable", async () => {
		const onClick = vi.fn()
		const onSubmit = vi.fn()
		const user = userEvent.setup()
		render(
			<form onSubmit={onSubmit}>
				<Button type="submit" loading onClick={onClick}>
					送出
				</Button>
			</form>,
		)
		const button = screen.getByRole("button", { name: "送出" })
		await user.tab()
		expect(button).toHaveFocus()
		await user.click(button)
		await user.keyboard("{Enter}")
		fireEvent.click(button)
		expect(onClick).not.toHaveBeenCalled()
		expect(onSubmit).not.toHaveBeenCalled()
	})

	test("clicks come back when loading ends", async () => {
		const onClick = vi.fn()
		const { rerender } = render(
			<Button loading onClick={onClick}>
				儲存
			</Button>,
		)
		rerender(<Button onClick={onClick}>儲存</Button>)
		const button = screen.getByRole("button")
		expect(button).not.toHaveAttribute("aria-busy")
		await userEvent.click(button)
		expect(onClick).toHaveBeenCalledOnce()
	})
})

test("axe: variants, icon, disabled and loading", async () => {
	const { container } = render(
		<>
			<Button>儲存</Button>
			<Button variant="secondary">取消</Button>
			<Button variant="danger">刪除</Button>
			<Button icon aria-label="關閉">
				<svg aria-hidden="true" />
			</Button>
			<Button disabled>停用</Button>
			<Button loading>儲存中</Button>
		</>,
	)
	await expectNoAxeViolations(container)
})
