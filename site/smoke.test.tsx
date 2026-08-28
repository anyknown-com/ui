import { act, render, screen } from "@testing-library/react"
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
})
