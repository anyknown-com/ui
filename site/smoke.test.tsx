import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { Site } from "./Site"

function goto(hash: string) {
	act(() => {
		location.hash = hash
		window.dispatchEvent(new HashChangeEvent("hashchange"))
	})
}

describe("site smoke", () => {
	test("demo, docs and guide pages all render", () => {
		location.hash = ""
		render(<Site />)
		expect(screen.getByRole("heading", { name: "@anyknown/ui" })).toBeInTheDocument()
		for (const id of ["input", "dialog", "message", "data-table"]) {
			expect(document.getElementById(id)).not.toBeNull()
		}
		goto("#/docs/dialog")
		expect(screen.getByRole("heading", { name: /Dialog \/ ConfirmDialog/ })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "實際操作示範 →" })).toHaveAttribute("href", "#/demo/dialog")
		goto("#/guide/readme")
		expect(screen.getByRole("link", { name: "StyleX" })).toBeInTheDocument()
		goto("#/demo/badge")
		expect(document.getElementById("badge")).not.toBeNull()
	})

	test("theme toggle stamps html with data-theme and a theme class", async () => {
		const user = userEvent.setup()
		location.hash = ""
		render(<Site />)
		const html = document.documentElement
		expect(html.dataset.theme).toBeUndefined()

		await user.click(screen.getByRole("button", { name: "暗" }))
		expect(html.dataset.theme).toBe("dark")
		const darkClasses = [...html.classList]
		expect(darkClasses.length).toBeGreaterThan(0)

		await user.click(screen.getByRole("button", { name: "亮" }))
		expect(html.dataset.theme).toBe("light")
		expect([...html.classList]).not.toEqual(darkClasses)

		await user.click(screen.getByRole("button", { name: "系統" }))
		expect(html.dataset.theme).toBeUndefined()
		expect(html.classList.length).toBe(0)
	})
})
