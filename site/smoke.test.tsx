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
	test("demo and guide pages all render", () => {
		location.hash = ""
		render(<Site />)
		expect(screen.getByRole("heading", { name: "@anyknown/ui" })).toBeInTheDocument()
		for (const id of ["input", "dialog", "message", "data-table"]) {
			expect(document.getElementById(id)).not.toBeNull()
		}
		goto("#/guide/readme")
		expect(screen.getByRole("link", { name: "StyleX" })).toBeInTheDocument()
		goto("#/guide/decisions")
		expect(screen.getByRole("heading", { name: "元件決定紀錄" })).toBeInTheDocument()
		goto("#/guide/texture")
		expect(screen.getByRole("heading", { name: /織物設計語言/ })).toBeInTheDocument()
		goto("#/demo/badge")
		expect(document.getElementById("badge")).not.toBeNull()
		// NOTES 刪掉之後,舊的 #/docs/<name> 連結要落到該元件的示範,不是 404
		goto("#/docs/dialog")
		expect(document.getElementById("dialog")).not.toBeNull()
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
