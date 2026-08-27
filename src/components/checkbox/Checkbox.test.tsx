import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Checkbox } from "./Checkbox"

describe("Checkbox", () => {
	test("renders a native checkbox labelled by its text", () => {
		render(<Checkbox label="記住這台裝置" />)
		expect(screen.getByRole("checkbox", { name: "記住這台裝置" })).toBeInTheDocument()
	})

	test("toggles on click and reports the new state", async () => {
		const onCheckedChange = vi.fn()
		render(<Checkbox label="換班時通知我" onCheckedChange={onCheckedChange} />)
		const box = screen.getByRole("checkbox", { name: "換班時通知我" })
		await userEvent.click(box)
		expect(box).toBeChecked()
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	test("toggles with the keyboard", async () => {
		render(<Checkbox label="鍵盤" />)
		const box = screen.getByRole("checkbox", { name: "鍵盤" })
		box.focus()
		await userEvent.keyboard(" ")
		expect(box).toBeChecked()
	})

	test("indeterminate sets the native property", () => {
		render(<Checkbox label="全選記憶" indeterminate />)
		const box = screen.getByRole("checkbox", { name: "全選記憶" }) as HTMLInputElement
		expect(box.indeterminate).toBe(true)
		expect(box).toBePartiallyChecked()
	})

	test("respects the controlled checked prop", async () => {
		const onCheckedChange = vi.fn()
		render(<Checkbox label="受控" checked={false} onCheckedChange={onCheckedChange} />)
		const box = screen.getByRole("checkbox", { name: "受控" })
		await userEvent.click(box)
		expect(box).not.toBeChecked()
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	test("disabled cannot be toggled", async () => {
		render(<Checkbox label="端對端加密" defaultChecked disabled />)
		const box = screen.getByRole("checkbox", { name: "端對端加密" })
		await userEvent.click(box)
		expect(box).toBeChecked()
	})
})
