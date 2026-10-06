import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Slider } from "./Slider"

function Effort({ start = 0, onCommit }: { start?: number; onCommit?: (value: number) => void }) {
	const [value, setValue] = useState(start)
	return (
		<Slider
			value={value}
			onChange={setValue}
			onValueCommit={onCommit}
			label="思考多少"
			valueText={(v) => `${v}`}
		/>
	)
}

/** The declarations StyleX put under `@media (forced-colors: active)` for this element's classes. */
function forcedCss(element: Element) {
	let css = ""
	for (const sheet of Array.from(document.styleSheets))
		for (const rule of Array.from(sheet.cssRules)) {
			if (!(rule instanceof CSSMediaRule) || !rule.media.mediaText.includes("forced-colors")) continue
			for (const inner of Array.from(rule.cssRules)) {
				const owner = inner instanceof CSSStyleRule ? inner.selectorText.match(/^\.([\w-]+)/)?.[1] : null
				if (owner != null && element.classList.contains(owner)) css += `${inner.cssText}\n`
			}
		}
	return css
}

/** jsdom lays nothing out: give the track a 100px width and let it take pointer capture. */
function track(slider: HTMLElement) {
	slider.setPointerCapture = vi.fn()
	vi.spyOn(slider, "getBoundingClientRect").mockReturnValue(
		DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 24 }),
	)
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

	test("拖曳一路 onChange,放開才 onValueCommit 一次", () => {
		const onCommit = vi.fn()
		render(<Effort onCommit={onCommit} />)
		const slider = screen.getByRole("slider", { name: "思考多少" })
		track(slider)

		fireEvent.pointerDown(slider, { pointerId: 1, clientX: 20 })
		fireEvent.pointerMove(slider, { pointerId: 1, clientX: 40 })
		fireEvent.pointerMove(slider, { pointerId: 1, clientX: 60 })
		expect(slider).toHaveAttribute("aria-valuenow", "0.6")
		expect(onCommit).not.toHaveBeenCalled()

		fireEvent.pointerUp(slider, { pointerId: 1, clientX: 60 })
		expect(onCommit).toHaveBeenCalledOnce()
		expect(onCommit).toHaveBeenCalledWith(0.6)
	})

	test("pointercancel 也收尾;沒動到值就不 commit", () => {
		const onCommit = vi.fn()
		render(<Effort start={0.3} onCommit={onCommit} />)
		const slider = screen.getByRole("slider", { name: "思考多少" })
		track(slider)

		fireEvent.pointerDown(slider, { pointerId: 1, clientX: 30 })
		fireEvent.pointerUp(slider, { pointerId: 1, clientX: 30 })
		expect(onCommit).not.toHaveBeenCalled()

		fireEvent.pointerDown(slider, { pointerId: 2, clientX: 80 })
		fireEvent.pointerCancel(slider, { pointerId: 2 })
		expect(onCommit).toHaveBeenCalledExactlyOnceWith(0.8)
	})

	test("PageUp / PageDown move 10% of the range by default", async () => {
		const user = userEvent.setup()
		render(<Effort start={0.5} />)
		const slider = screen.getByRole("slider", { name: "思考多少" })
		await user.tab()
		await user.keyboard("{PageUp}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.6")
		await user.keyboard("{PageDown}{PageDown}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.4")
	})

	test("largeStep sets how far PageUp / PageDown go, clamped at the ends", async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(
			<Slider
				defaultValue={90}
				onValueChange={onValueChange}
				min={0}
				max={100}
				step={1}
				largeStep={25}
				aria-label="音量"
			/>,
		)
		const slider = screen.getByRole("slider")
		await user.tab()
		await user.keyboard("{PageDown}")
		expect(onValueChange).toHaveBeenLastCalledWith(65)
		await user.keyboard("{PageUp}{PageUp}")
		expect(slider).toHaveAttribute("aria-valuenow", "100")
		await user.keyboard("{Home}")
		expect(slider).toHaveAttribute("aria-valuenow", "0")
		await user.keyboard("{End}")
		expect(slider).toHaveAttribute("aria-valuenow", "100")
	})

	test("uncontrolled: defaultValue starts it, onValueChange reports each move", async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(<Slider defaultValue={0.2} onValueChange={onValueChange} aria-label="思考多少" />)
		const slider = screen.getByRole("slider")
		expect(slider).toHaveAttribute("aria-valuenow", "0.2")
		await user.tab()
		await user.keyboard("{ArrowRight}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.25")
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(0.25)
	})

	test("uncontrolled without defaultValue starts at min", () => {
		render(<Slider min={10} max={20} step={1} aria-label="寬度" />)
		expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "10")
	})

	test("controlled: the value only moves when the parent says so", async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(<Slider value={0.5} onValueChange={onValueChange} aria-label="思考多少" />)
		await user.tab()
		await user.keyboard("{ArrowRight}")
		expect(onValueChange).toHaveBeenCalledWith(0.55)
		expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0.5")
	})

	test("the deprecated onChange still hears every move, next to onValueChange", async () => {
		const onChange = vi.fn()
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(<Slider defaultValue={0} onChange={onChange} onValueChange={onValueChange} aria-label="x" />)
		await user.tab()
		await user.keyboard("{ArrowRight}")
		expect(onChange).toHaveBeenCalledWith(0.05)
		expect(onValueChange).toHaveBeenCalledWith(0.05)
	})

	test("forced-colors: track border, Highlight fill and thumb, Highlight focus ring", () => {
		const { container } = render(<Slider defaultValue={0.5} aria-label="音量" />)
		const slider = screen.getByRole("slider")
		const [fill, thumb] = container.querySelectorAll("[role='slider'] > span")
		expect(forcedCss(slider)).toMatch(/border-width: 1px/)
		expect(forcedCss(slider)).toMatch(/focus-visible.*solid highlight/i)
		expect(forcedCss(fill)).toMatch(/background-color: highlight/i)
		expect(forcedCss(thumb)).toMatch(/border-color: highlight/i)
	})

	test("forced-colors: a disabled slider draws in GrayText", () => {
		const { container } = render(<Slider defaultValue={0.5} aria-label="音量" disabled />)
		const [fill, thumb] = container.querySelectorAll("[role='slider'] > span")
		expect(forcedCss(fill)).toMatch(/graytext/i)
		expect(forcedCss(thumb)).toMatch(/graytext/i)
	})

	test("axe: labelled, valued, and disabled", async () => {
		const { container } = render(
			<>
				<Slider defaultValue={0.3} label="思考多少" valueText={() => "少"} />
				<Slider defaultValue={0.7} aria-label="音量" disabled />
			</>,
		)
		await expectNoAxeViolations(container)
	})

	test("鍵盤每動一次值就 commit 一次,到底再按不 commit", async () => {
		const onCommit = vi.fn()
		const user = userEvent.setup()
		render(<Effort start={0.9} onCommit={onCommit} />)
		await user.tab()

		await user.keyboard("{ArrowRight}")
		expect(onCommit).toHaveBeenLastCalledWith(0.95)
		await user.keyboard("{End}")
		expect(onCommit).toHaveBeenLastCalledWith(1)
		await user.keyboard("{ArrowRight}{Tab}")
		expect(onCommit).toHaveBeenCalledTimes(2)
	})
})
