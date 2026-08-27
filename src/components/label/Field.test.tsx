import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { Input } from "../input/Input"
import { Field } from "./Field"
import { Label } from "./Label"

describe("Label", () => {
	test("associates with a control and marks required visually only", () => {
		render(
			<>
				<Label htmlFor="a" required>
					Email
				</Label>
				<input id="a" />
			</>,
		)
		expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
		expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument()
	})

	test("renders the optional marker", () => {
		render(<Label optional>邀請碼</Label>)
		expect(screen.getByText("選填")).toBeInTheDocument()
	})
})

describe("Field", () => {
	test("wires label, help and error to the control", () => {
		render(
			<Field label="Email" help="我們不會寄廣告。" error="格式不完整。" required>
				<Input />
			</Field>,
		)
		const input = screen.getByRole("textbox", { name: /Email/ })
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input).toBeRequired()
		const describedBy = input.getAttribute("aria-describedby")?.split(" ") ?? []
		expect(describedBy).toHaveLength(2)
		for (const id of describedBy) expect(document.getElementById(id)).toBeInTheDocument()
	})

	test("passes disabled down to the control", () => {
		render(
			<Field label="裝置名稱" disabled>
				<Input />
			</Field>,
		)
		expect(screen.getByRole("textbox", { name: "裝置名稱" })).toBeDisabled()
	})
})
