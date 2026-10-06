import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Field } from "../label/Field"
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

	test("onValueChange hears the text, next to onChange (uncontrolled)", async () => {
		const onChange = vi.fn()
		const onValueChange = vi.fn()
		render(<Input aria-label="名稱" defaultValue="a" onChange={onChange} onValueChange={onValueChange} />)
		await userEvent.type(screen.getByRole("textbox", { name: "名稱" }), "b")
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith("ab")
		expect(onChange).toHaveBeenCalledOnce()
	})

	test("controlled: the value stays what the parent says", async () => {
		const onValueChange = vi.fn()
		render(<Input aria-label="名稱" value="a" onValueChange={onValueChange} />)
		const input = screen.getByRole("textbox", { name: "名稱" })
		await userEvent.type(input, "b")
		expect(onValueChange).toHaveBeenCalledWith("ab")
		expect(input).toHaveValue("a")
	})

	test("axe: plain, with icon, invalid in a Field, disabled", async () => {
		const { container } = render(
			<>
				<Input aria-label="名稱" placeholder="AnyKnown" />
				<Input aria-label="搜尋" leadingIcon={<svg />} />
				<Field label="Email" error="格式不完整。">
					<Input type="email" defaultValue="a@" />
				</Field>
				<Input aria-label="停用" disabled />
			</>,
		)
		await expectNoAxeViolations(container)
	})

	test("disabled blocks input", async () => {
		render(<Input aria-label="停用" disabled />)
		const input = screen.getByRole("textbox", { name: "停用" })
		await userEvent.type(input, "x")
		expect(input).toHaveValue("")
	})
})

describe("Input regressions", () => {
	test("keeps the caller's className and style", () => {
		render(<Input aria-label="樣式" className="caller-class" style={{ width: "123px" }} />)
		const input = screen.getByRole("textbox", { name: "樣式" })
		expect(input.className).toContain("caller-class")
		expect(input).toHaveStyle({ width: "123px" })
	})

	test("respects an explicitly passed aria-invalid", () => {
		render(<Input aria-label="外部" aria-invalid="true" />)
		expect(screen.getByRole("textbox", { name: "外部" })).toHaveAttribute("aria-invalid", "true")
	})

	test("mono is a look, not an attribute", () => {
		render(<Input mono aria-label="API key" />)
		const input = screen.getByRole("textbox", { name: "API key" })
		expect(input).not.toHaveAttribute("mono")
		expect(input.className).not.toBe(
			render(<Input aria-label="名稱" />).container.querySelector("input")?.className,
		)
	})
})
