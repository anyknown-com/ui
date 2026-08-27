import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Input } from "./Input"

describe("Input", () => {
	test("renders a textbox and accepts typing", async () => {
		const onChange = vi.fn()
		render(<Input aria-label="工作區名稱" onChange={onChange} />)
		const input = screen.getByRole("textbox", { name: "工作區名稱" })
		await userEvent.type(input, "anyknown")
		expect(input).toHaveValue("anyknown")
		expect(onChange).toHaveBeenCalled()
	})

	test("invalid sets aria-invalid", () => {
		render(<Input aria-label="Email" invalid />)
		expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true")
	})

	test("leading icon is hidden from the accessibility tree", () => {
		render(<Input aria-label="搜尋" leadingIcon={<svg data-testid="icon" />} />)
		expect(screen.getByTestId("icon").closest("[aria-hidden]")).not.toBeNull()
	})

	test("disabled blocks input", async () => {
		render(<Input aria-label="停用" disabled />)
		const input = screen.getByRole("textbox", { name: "停用" })
		await userEvent.type(input, "x")
		expect(input).toHaveValue("")
	})
})
