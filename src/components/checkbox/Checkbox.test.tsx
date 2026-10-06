import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Checkbox } from "./Checkbox"

describe("Checkbox", () => {
	test("renders a native checkbox labelled by its text", () => {
		render(<Checkbox label="記住這台裝置" />)
		expect(screen.getByRole("checkbox", { name: "記住這台裝置" })).toBeInTheDocument()
	})

	test("toggles on click and reports the new state", async () => {
		const onCheckedChange = vi.fn()
		render(<Checkbox label="換班時通知我" onCheckedChange={onCheckedChange} />)
		const box = screen.getByRole("checkbox", { name: "換班時通知我" })
		await userEvent.click(box)
		expect(box).toBeChecked()
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	test("toggles with the keyboard", async () => {
		render(<Checkbox label="鍵盤" />)
		const box = screen.getByRole("checkbox", { name: "鍵盤" })
		box.focus()
		await userEvent.keyboard(" ")
		expect(box).toBeChecked()
	})

	test("indeterminate sets the native property", () => {
		render(<Checkbox label="全選記憶" indeterminate />)
		const box = screen.getByRole("checkbox", { name: "全選記憶" }) as HTMLInputElement
		expect(box.indeterminate).toBe(true)
		expect(box).toBePartiallyChecked()
	})

	test("respects the controlled checked prop", async () => {
		const onCheckedChange = vi.fn()
		render(<Checkbox label="受控" checked={false} onCheckedChange={onCheckedChange} />)
		const box = screen.getByRole("checkbox", { name: "受控" })
		await userEvent.click(box)
		expect(box).not.toBeChecked()
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	test("disabled cannot be toggled", async () => {
		render(<Checkbox label="端對端加密" defaultChecked disabled />)
		const box = screen.getByRole("checkbox", { name: "端對端加密" })
		await userEvent.click(box)
		expect(box).toBeChecked()
	})
})

describe("Checkbox in a Field", () => {
	test("inherits disabled and aria-describedby from the field", async () => {
		const { Field } = await import("../label/Field")
		render(
			<Field help="每次 handoff 都會通知。" disabled>
				<Checkbox label="換班時通知我" />
			</Field>,
		)
		const box = screen.getByRole("checkbox", { name: "換班時通知我" })
		expect(box).toBeDisabled()
		const describedBy = box.getAttribute("aria-describedby")
		expect(describedBy).not.toBeNull()
		expect(document.getElementById(describedBy as string)).toBeInTheDocument()
	})
})

describe("Checkbox description", () => {
	test("the description is the accessible description, not part of the name", () => {
		render(<Checkbox label="換班時通知我" description="每次 handoff 都會收到桌面通知。" />)
		const box = screen.getByRole("checkbox", { name: "換班時通知我" })
		const describedBy = box.getAttribute("aria-describedby")
		expect(document.getElementById(describedBy as string)).toHaveTextContent(
			"每次 handoff 都會收到桌面通知。",
		)
	})

	test("clears the mixed state once the user toggles", async () => {
		function Parent() {
			const [state, setState] = useState<"mixed" | boolean>("mixed")
			return (
				<Checkbox
					label="全選記憶"
					indeterminate={state === "mixed"}
					checked={state === true}
					onCheckedChange={setState}
				/>
			)
		}
		render(<Parent />)
		const box = screen.getByRole("checkbox", { name: "全選記憶" }) as HTMLInputElement
		expect(box.indeterminate).toBe(true)
		await userEvent.click(box)
		expect(box.indeterminate).toBe(false)
		expect(box).toBeChecked()
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

describe("Checkbox in forced-colors", () => {
	const box = (name: string) => screen.getByRole("checkbox", { name }).parentElement as HTMLElement

	test("unchecked is a ButtonText frame on Canvas; checked fills with Highlight", () => {
		render(
			<>
				<Checkbox label="off" />
				<Checkbox label="on" defaultChecked />
			</>,
		)
		expect(forcedCss(box("off"))).toMatch(/border-color: buttontext/i)
		expect(forcedCss(box("off"))).toMatch(/background-color: canvas/i)
		expect(forcedCss(box("on"))).toMatch(/background-color: highlight/i)
		expect(forcedCss(box("on"))).toMatch(/has\(:focus-visible\).*solid highlight/i)
	})

	test("disabled draws in GrayText, checked or not", () => {
		render(
			<>
				<Checkbox label="off" disabled />
				<Checkbox label="on" disabled defaultChecked />
			</>,
		)
		expect(forcedCss(box("off"))).toMatch(/border-color: graytext/i)
		expect(forcedCss(box("on"))).toMatch(/background-color: graytext/i)
	})

	test("invalid is a dashed ButtonText frame, not the raw danger colour", () => {
		render(
			<>
				<Checkbox label="ok" />
				<Checkbox label="bad" aria-invalid="true" />
			</>,
		)
		expect(forcedCss(box("ok"))).not.toMatch(/dashed/)
		const css = forcedCss(box("bad"))
		expect(css).toMatch(/border-style: dashed/)
		expect(css).toMatch(/border-width: 2px/)
		expect(css).toMatch(/border-color: buttontext/i)
	})
})

describe("Checkbox target and a11y", () => {
	test("the hit area is 24×24 even though the box is drawn smaller", () => {
		render(<Checkbox aria-label="選取" />)
		expect(screen.getByRole("checkbox")).toHaveStyle({ width: "24px", height: "24px" })
	})

	test("uncontrolled: defaultChecked starts it, onCheckedChange hears each toggle", async () => {
		const onCheckedChange = vi.fn()
		render(<Checkbox label="記住" defaultChecked onCheckedChange={onCheckedChange} />)
		const box = screen.getByRole("checkbox", { name: "記住" })
		expect(box).toBeChecked()
		await userEvent.click(box)
		expect(box).not.toBeChecked()
		expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(false)
	})

	test("axe: unchecked, checked, indeterminate, invalid, disabled, described", async () => {
		const { container } = render(
			<>
				<Checkbox label="一" />
				<Checkbox label="二" defaultChecked />
				<Checkbox label="三" indeterminate />
				<Checkbox label="四" aria-invalid="true" />
				<Checkbox label="五" disabled defaultChecked />
				<Checkbox label="六" description="說明" />
				<Checkbox aria-label="七" />
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
