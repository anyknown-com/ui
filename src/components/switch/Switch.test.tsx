import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Switch } from "./Switch"

describe("Switch", () => {
	test("exposes the switch role with its label", () => {
		render(<Switch label="語音喚醒" description="說「Anyknown」開始對話。" />)
		expect(screen.getByRole("switch", { name: /語音喚醒/ })).toBeInTheDocument()
	})

	test("toggles on click and reports the new state", async () => {
		const onCheckedChange = vi.fn()
		render(<Switch label="開機自動啟動" onCheckedChange={onCheckedChange} />)
		const control = screen.getByRole("switch", { name: "開機自動啟動" })
		await userEvent.click(control)
		expect(control).toBeChecked()
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	test("toggles with the keyboard", async () => {
		render(<Switch label="鍵盤" />)
		const control = screen.getByRole("switch", { name: "鍵盤" })
		control.focus()
		await userEvent.keyboard(" ")
		expect(control).toBeChecked()
	})

	test("stays put when controlled", async () => {
		render(<Switch label="受控" checked={false} />)
		const control = screen.getByRole("switch", { name: "受控" })
		await userEvent.click(control)
		expect(control).not.toBeChecked()
	})

	test("disabled cannot be toggled", async () => {
		render(<Switch label="本地儲存" defaultChecked disabled />)
		const control = screen.getByRole("switch", { name: "本地儲存" })
		await userEvent.click(control)
		expect(control).toBeChecked()
	})
})

describe("Switch in a Field", () => {
	test("inherits disabled from the field", async () => {
		const { Field } = await import("../label/Field")
		render(
			<Field disabled>
				<Switch label="語音喚醒" />
			</Field>,
		)
		expect(screen.getByRole("switch", { name: "語音喚醒" })).toBeDisabled()
	})
})
