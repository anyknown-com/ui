import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { Slider } from "./Slider"

function Effort({ start = 0 }: { start?: number }) {
	const [value, setValue] = useState(start)
	return <Slider value={value} onChange={setValue} label="思考多少" valueText={(v) => `${v}`} />
}

describe("Slider", () => {
	test("方向鍵一次 5%,Home / End 到底", async () => {
		const user = userEvent.setup()
		render(<Effort />)
		const slider = screen.getByRole("slider", { name: "思考多少" })
		await user.tab()
		expect(slider).toHaveFocus()

		await user.keyboard("{ArrowRight}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.05")
		await user.keyboard("{ArrowUp}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.1")
		await user.keyboard("{ArrowLeft}{ArrowDown}")
		expect(slider).toHaveAttribute("aria-valuenow", "0")

		await user.keyboard("{End}")
		expect(slider).toHaveAttribute("aria-valuenow", "1")
		await user.keyboard("{Home}")
		expect(slider).toHaveAttribute("aria-valuenow", "0")
	})

	test("到頂到底就停住,不繞回去", async () => {
		const user = userEvent.setup()
		render(<Effort start={0.98} />)
		const slider = screen.getByRole("slider", { name: "思考多少" })
		await user.tab()
		await user.keyboard("{ArrowRight}{ArrowRight}")
		expect(slider).toHaveAttribute("aria-valuenow", "1")
		await user.keyboard("{Home}{ArrowLeft}")
		expect(slider).toHaveAttribute("aria-valuenow", "0")
	})

	test("range 與 step 都聽 props,方向鍵是 range 的 5%", async () => {
		const onChange = vi.fn()
		const user = userEvent.setup()
		render(<Slider value={20} onChange={onChange} min={0} max={200} step={10} aria-label="寬度" />)
		await user.tab()
		await user.keyboard("{ArrowRight}")
		expect(onChange).toHaveBeenCalledWith(30)
	})

	test("aria-valuetext 唸的是標籤不是數字", () => {
		render(<Slider value={0.62} onChange={() => {}} valueText={() => "多"} aria-label="思考多少" />)
		expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "多")
	})

	test("停用時進不了 tab 序,鍵盤也不動值", async () => {
		const onChange = vi.fn()
		const user = userEvent.setup()
		render(<Slider value={0.5} onChange={onChange} disabled aria-label="思考多少" />)
		const slider = screen.getByRole("slider")
		await user.tab()
		expect(slider).not.toHaveFocus()
		slider.focus()
		await user.keyboard("{ArrowRight}")
		expect(onChange).not.toHaveBeenCalled()
	})
})
