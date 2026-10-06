import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
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

describe("Switch in forced-colors", () => {
	test("the track gets a frame; on is a Highlight track with a HighlightText thumb", () => {
		render(
			<>
				<Switch aria-label="off" />
				<Switch aria-label="on" defaultChecked />
			</>,
		)
		const track = (name: string) => screen.getByRole("switch", { name }).parentElement as HTMLElement
		const thumb = (name: string) => track(name).lastElementChild as HTMLElement
		expect(forcedCss(track("off"))).toMatch(/border-width: 1px/)
		expect(forcedCss(track("off"))).toMatch(/background-color: canvas/i)
		expect(forcedCss(thumb("off"))).toMatch(/background-color: buttontext/i)
		expect(forcedCss(track("on"))).toMatch(/background-color: highlight/i)
		expect(forcedCss(thumb("on"))).toMatch(/background-color: highlighttext/i)
	})

	test("disabled draws in GrayText", () => {
		render(<Switch aria-label="on" disabled defaultChecked />)
		const track = screen.getByRole("switch").parentElement as HTMLElement
		expect(forcedCss(track)).toMatch(/background-color: graytext/i)
	})
})

describe("Switch target and a11y", () => {
	test("the hit area is at least 24px tall although the track is 22px", () => {
		render(<Switch aria-label="喚醒" />)
		expect(screen.getByRole("switch")).toHaveStyle({ height: "24px", width: "100%" })
	})

	test("uncontrolled: defaultChecked starts it on", async () => {
		const onCheckedChange = vi.fn()
		render(<Switch label="喚醒" defaultChecked onCheckedChange={onCheckedChange} />)
		const control = screen.getByRole("switch", { name: "喚醒" })
		expect(control).toBeChecked()
		await userEvent.click(control)
		expect(control).not.toBeChecked()
		expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false)
	})

	test("axe: off, on, described, invalid, disabled", async () => {
		const { container } = render(
			<>
				<Switch label="一" />
				<Switch label="二" defaultChecked />
				<Switch label="三" description="說明" />
				<Switch label="四" aria-invalid="true" />
				<Switch label="五" disabled defaultChecked />
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
