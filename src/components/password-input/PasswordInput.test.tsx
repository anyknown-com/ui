import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { PasswordInput, defaultScorer } from "./PasswordInput"

function Pair() {
	const [primary, setPrimary] = useState("")
	return (
		<>
			<PasswordInput aria-label="passphrase" value={primary} onValueChange={setPrimary} />
			<PasswordInput aria-label="再輸入一次" confirmOf={primary} />
		</>
	)
}

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
	test("the caps-lock and mismatch regions are mounted before they have text", () => {
		render(<PasswordInput aria-label="Vault passphrase" />)
		expect(document.querySelectorAll("[role='status']").length).toBeGreaterThan(0)
	})

	test("chains the caller's own handlers", async () => {
		const onChange = vi.fn()
		const onKeyDown = vi.fn()
		render(<PasswordInput aria-label="Vault passphrase" onChange={onChange} onKeyDown={onKeyDown} />)
		await userEvent.type(screen.getByLabelText("Vault passphrase"), "a")
		expect(onChange).toHaveBeenCalled()
		expect(onKeyDown).toHaveBeenCalled()
	})

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
		expect(screen.getByText("至少 12 個字元。")).toBeInTheDocument()
		await userEvent.type(input, "short")
		expect(screen.getByText("弱，至少要 12 個字元。")).toBeInTheDocument()
		await userEvent.clear(input)
		await userEvent.type(input, "Abcdefghijklmnopqrst1!")
		const label = screen.getByText("很強")
		expect(label).toHaveAttribute("aria-live", "polite")
	})

	test("the strength word is only rewritten when the level changes", async () => {
		render(<PasswordInput aria-label="Vault passphrase" meter />)
		const input = screen.getByLabelText("Vault passphrase")
		await userEvent.type(input, "a")
		const label = screen.getByText("弱，至少要 12 個字元。")
		const changes: MutationRecord[] = []
		const observer = new MutationObserver((records) => changes.push(...records))
		observer.observe(label, { childList: true, characterData: true, subtree: true })
		await userEvent.type(input, "bcd")
		observer.disconnect()
		expect(changes).toHaveLength(0)
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
		render(<Pair />)
		const confirm = screen.getByLabelText("再輸入一次")
		expect(screen.queryByText("再輸入一次同樣的 passphrase。")).not.toBeInTheDocument()
		await userEvent.type(screen.getByLabelText("passphrase"), "correct-horse")
		await userEvent.type(confirm, "wrong")
		const message = screen.getByText("再輸入一次同樣的 passphrase。")
		expect(confirm).toHaveAttribute("aria-invalid", "true")
		expect(confirm.getAttribute("aria-describedby")).toContain(message.id)
	})

	test("Caps Lock warning appears while the key is on and clears on blur", async () => {
		render(<PasswordInput aria-label="Vault passphrase" />)
		const input = screen.getByLabelText("Vault passphrase")
		input.focus()
		await userEvent.keyboard("{CapsLock}a")
		expect(screen.getByText("Caps Lock 開著。")).toBeInTheDocument()
		// the live region itself stays mounted so the change is announced
		expect(screen.getAllByRole("status").length).toBeGreaterThan(0)
		await userEvent.tab()
		expect(screen.queryByText("Caps Lock 開著。")).not.toBeInTheDocument()
		await userEvent.keyboard("{CapsLock}")
	})

	test("built-in words follow the locale; labels and single-word props win", async () => {
		render(
			<LocaleProvider locale="en">
				<PasswordInput aria-label="Vault passphrase" meter labels={{ levelStrong: "Solid" }} />
				<PasswordInput aria-label="Other" showLabel="Peek" />
			</LocaleProvider>,
		)
		expect(screen.getByRole("button", { name: "Show passphrase" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Peek" })).toBeInTheDocument()
		expect(screen.getByText("At least 12 characters.")).toBeInTheDocument()
		await userEvent.type(screen.getByLabelText("Vault passphrase"), "Abcdefghijkl1!")
		expect(screen.getByText("Solid")).toBeInTheDocument()
	})

	test("levelLabels still wins over the table", () => {
		render(<PasswordInput aria-label="Vault passphrase" meter levelLabels={["empty"]} />)
		expect(screen.getByText("empty")).toBeInTheDocument()
	})
})
