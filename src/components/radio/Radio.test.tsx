import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Radio } from "./Radio"
import { RadioGroup } from "./RadioGroup"

function Threshold({ onValueChange }: { onValueChange?: (v: string) => void }) {
	const [value, setValue] = useState("50")
	return (
		<RadioGroup
			legend="換班門檻"
			value={value}
			onValueChange={(v) => {
				setValue(v)
				onValueChange?.(v)
			}}
		>
			<Radio value="50" label="50%(建議)" description="context 用到一半就交接。" />
			<Radio value="75" label="75%" />
			<Radio value="90" label="90%" />
		</RadioGroup>
	)
}

describe("RadioGroup", () => {
	test("renders a labelled group of radios", () => {
		render(<Threshold />)
		expect(screen.getByRole("group", { name: "換班門檻" })).toBeInTheDocument()
		expect(screen.getAllByRole("radio")).toHaveLength(3)
		expect(screen.getByRole("radio", { name: /50%/ })).toBeChecked()
	})

	test("selects on click", async () => {
		const onValueChange = vi.fn()
		render(<Threshold onValueChange={onValueChange} />)
		await userEvent.click(screen.getByRole("radio", { name: "75%" }))
		expect(onValueChange).toHaveBeenCalledWith("75")
		expect(screen.getByRole("radio", { name: "75%" })).toBeChecked()
	})

	test("arrow keys move selection within the group", async () => {
		render(<Threshold />)
		screen.getByRole("radio", { name: /50%/ }).focus()
		await userEvent.keyboard("{ArrowDown}")
		expect(screen.getByRole("radio", { name: "75%" })).toBeChecked()
	})

	test("a disabled group disables every radio", () => {
		render(
			<RadioGroup legend="資料位置" value="local" disabled>
				<Radio value="local" label="這台電腦" />
				<Radio value="cloud" label="雲端同步" />
			</RadioGroup>,
		)
		for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled()
	})

	test("card variant still exposes radio semantics", () => {
		render(
			<RadioGroup legend="訂閱來源" value="claude" variant="card">
				<Radio value="claude" label="Claude" />
				<Radio value="chatgpt" label="ChatGPT" />
			</RadioGroup>,
		)
		expect(screen.getByRole("radio", { name: "Claude" })).toBeChecked()
	})
})

describe("RadioGroup uncontrolled", () => {
	test("selects without a value prop", async () => {
		render(
			<RadioGroup legend="來源" defaultValue="claude">
				<Radio value="claude" label="Claude" />
				<Radio value="chatgpt" label="ChatGPT" />
			</RadioGroup>,
		)
		expect(screen.getByRole("radio", { name: "Claude" })).toBeChecked()
		await userEvent.click(screen.getByRole("radio", { name: "ChatGPT" }))
		expect(screen.getByRole("radio", { name: "ChatGPT" })).toBeChecked()
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

describe("Radio in forced-colors", () => {
	test("checked fills with Highlight, disabled draws in GrayText", () => {
		render(
			<>
				<RadioGroup legend="一" defaultValue="a">
					<Radio value="a" label="A" />
					<Radio value="b" label="B" />
				</RadioGroup>
				<RadioGroup legend="二" defaultValue="c" disabled>
					<Radio value="c" label="C" />
				</RadioGroup>
			</>,
		)
		const dot = (name: string) => screen.getByRole("radio", { name }).parentElement as HTMLElement
		expect(forcedCss(dot("A"))).toMatch(/background-color: highlight/i)
		expect(forcedCss(dot("B"))).toMatch(/border-color: buttontext/i)
		expect(forcedCss(dot("C"))).toMatch(/background-color: graytext/i)
	})
})

describe("Radio target and a11y", () => {
	test("the hit area is 24×24 even though the dot is drawn smaller", () => {
		render(
			<RadioGroup legend="來源">
				<Radio value="a" label="A" />
			</RadioGroup>,
		)
		expect(screen.getByRole("radio")).toHaveStyle({ width: "24px", height: "24px" })
	})

	test("axe: plain and card groups, checked, described, disabled", async () => {
		const { container } = render(
			<>
				<Threshold />
				<RadioGroup legend="方案" variant="card" defaultValue="pro">
					<Radio value="free" label="Free" description="免費" />
					<Radio value="pro" label="Pro" />
				</RadioGroup>
				<RadioGroup legend="停用" disabled defaultValue="x">
					<Radio value="x" label="X" />
				</RadioGroup>
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
