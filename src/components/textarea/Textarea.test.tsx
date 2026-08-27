import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { Textarea } from "./Textarea"

describe("Textarea", () => {
	test("renders and accepts multiline input", async () => {
		render(<Textarea aria-label="回報問題" />)
		const area = screen.getByRole("textbox", { name: "回報問題" })
		await userEvent.type(area, "line1{enter}line2")
		expect(area).toHaveValue("line1\nline2")
	})

	test("invalid sets aria-invalid", () => {
		render(<Textarea aria-label="備註" invalid />)
		expect(screen.getByRole("textbox", { name: "備註" })).toHaveAttribute("aria-invalid", "true")
	})

	test("autoGrow renders without a resize handle style conflict", () => {
		render(<Textarea aria-label="長高" autoGrow maxRows={6} />)
		expect(screen.getByRole("textbox", { name: "長高" })).toBeInTheDocument()
	})
})
