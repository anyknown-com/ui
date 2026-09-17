import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { LiveDot } from "./LiveDot"

describe("LiveDot", () => {
	test("沒有 label 就只是一顆裝飾,讀屏不會唸到", () => {
		const { container } = render(<LiveDot />)
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
		expect(screen.queryByRole("status")).not.toBeInTheDocument()
	})

	test("有 label 就變成 status,唸的是文字不是那顆點", () => {
		render(<LiveDot label="還在跑" />)
		const live = screen.getByRole("status")
		expect(live).toHaveTextContent("還在跑")
		expect(live.querySelector("[aria-hidden='true']")).not.toBeNull()
	})
})
