import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test } from "vitest"
import { PasswordInput, defaultScorer } from "./PasswordInput"

describe("defaultScorer", () => {
	test("scores on length thresholds and character classes", () => {
		expect(defaultScorer("")).toBe(0)
		expect(defaultScorer("abc")).toBe(1)
		expect(defaultScorer("abcdefghij")).toBe(1)
		expect(defaultScorer("Abcdefgh1!")).toBe(2)
		expect(defaultScorer("Abcdefghijkl1!")).toBe(3)
		expect(defaultScorer("Abcdefghijklmnopqrst1!")).toBe(4)
	})
})

describe("PasswordInput", () => {
	test("starts masked and toggles to visible", async () => {
		render(<PasswordInput aria-label="Vault passphrase" />)
		const input = screen.getByLabelText("Vault passphrase")
		expect(input).toHaveAttribute("type", "password")
		const toggle = screen.getByRole("button", { name: "顯示 passphrase" })
		expect(toggle).toHaveAttribute("aria-pressed", "false")
		await userEvent.click(toggle)
		expect(input).toHaveAttribute("type", "text")
		expect(screen.getByRole("button", { name: "隱藏 passphrase" })).toHaveAttribute("aria-pressed", "true")
	})

	test("returns focus to the field after toggling", async () => {
		render(<PasswordInput aria-label="Vault passphrase" />)
		await userEvent.click(screen.getByRole("button", { name: "顯示 passphrase" }))
		expect(screen.getByLabelText("Vault passphrase")).toHaveFocus()
	})

	test("the meter updates and is announced politely", async () => {
		render(<PasswordInput aria-label="Vault passphrase" meter />)
		const input = screen.getByLabelText("Vault passphrase")
		expect(screen.getByText(/passphrase 無法找回/)).toBeInTheDocument()
		await userEvent.type(input, "short")
		expect(screen.getByText("弱 — 再長一點。")).toBeInTheDocument()
		await userEvent.clear(input)
		await userEvent.type(input, "Abcdefghijklmnopqrst1!")
		const label = screen.getByText("很強")
		expect(label).toHaveAttribute("aria-live", "polite")
	})

	test("the bars are decorative", () => {
		const { container } = render(<PasswordInput aria-label="Vault passphrase" meter />)
		expect(container.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(0)
	})

	test("defaults to new-password autocomplete and does not block paste", () => {
		render(<PasswordInput aria-label="Vault passphrase" />)
		const input = screen.getByLabelText("Vault passphrase")
		expect(input).toHaveAttribute("autocomplete", "new-password")
		expect(input).not.toHaveAttribute("onpaste")
	})

	test("confirmOf only complains once something has been typed", async () => {
		function Pair() {
			const [primary, setPrimary] = useState("")
			return (
				<>
					<PasswordInput aria-label="passphrase" value={primary} onValueChange={setPrimary} />
					<PasswordInput aria-label="再輸入一次" confirmOf={primary} />
				</>
			)
		}
		render(<Pair />)
		const confirm = screen.getByLabelText("再輸入一次")
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		await userEvent.type(screen.getByLabelText("passphrase"), "correct-horse")
		await userEvent.type(confirm, "wrong")
		expect(screen.getByRole("alert")).toHaveTextContent("兩次輸入的 passphrase 不一樣。")
		expect(confirm).toHaveAttribute("aria-invalid", "true")
		expect(confirm.getAttribute("aria-describedby")).toContain(screen.getByRole("alert").id)
	})

	test("Caps Lock warning appears while the key is on and clears on blur", async () => {
		render(<PasswordInput aria-label="Vault passphrase" />)
		const input = screen.getByLabelText("Vault passphrase")
		input.focus()
		await userEvent.keyboard("{CapsLock}a")
		expect(screen.getByRole("status")).toHaveTextContent("Caps Lock 開著。")
		await userEvent.tab()
		expect(screen.queryByRole("status")).not.toBeInTheDocument()
		await userEvent.keyboard("{CapsLock}")
	})
})
