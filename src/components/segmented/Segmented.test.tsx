import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { GroupRow } from "../group/Group"
import { Segmented, type SegmentedOption } from "./Segmented"

const LANGUAGES: SegmentedOption<string>[] = [
	{ value: "en", label: "English" },
	{ value: "zh", label: "繁體中文" },
	{ value: "ja", label: "日本語" },
]

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

function Controlled({ onValueChange }: { onValueChange?: (value: string) => void }) {
	const [value, setValue] = useState("en")
	return (
		<Segmented
			value={value}
			options={LANGUAGES}
			onValueChange={(next) => {
				setValue(next)
				onValueChange?.(next)
			}}
			label="語言"
		/>
	)
}

describe("Segmented", () => {
	test("is a radio group named by its label, one radio checked", () => {
		render(<Segmented value="en" options={LANGUAGES} onValueChange={() => {}} label="語言" />)
		expect(screen.getByRole("radiogroup", { name: "語言" })).toBeInTheDocument()
		expect(screen.getByRole("radio", { name: "English" })).toHaveAttribute("aria-checked", "true")
		expect(screen.getByRole("radio", { name: "繁體中文" })).toHaveAttribute("aria-checked", "false")
	})

	test("clicking an option reports it", async () => {
		const onValueChange = vi.fn<(value: string) => void>()
		render(<Segmented value="en" options={LANGUAGES} onValueChange={onValueChange} label="語言" />)
		await userEvent.click(screen.getByRole("radio", { name: "繁體中文" }))
		expect(onValueChange).toHaveBeenCalledWith("zh")
	})

	test("the deprecated onChange still works", async () => {
		const onChange = vi.fn<(value: string) => void>()
		render(<Segmented value="en" options={LANGUAGES} onChange={onChange} label="語言" />)
		await userEvent.click(screen.getByRole("radio", { name: "日本語" }))
		expect(onChange).toHaveBeenCalledWith("ja")
	})

	test("uncontrolled: defaultValue, or the first option, starts checked and clicks move it", async () => {
		const onValueChange = vi.fn()
		const { unmount } = render(<Segmented options={LANGUAGES} label="語言" onValueChange={onValueChange} />)
		expect(screen.getByRole("radio", { name: "English" })).toHaveAttribute("aria-checked", "true")
		await userEvent.click(screen.getByRole("radio", { name: "日本語" }))
		expect(screen.getByRole("radio", { name: "日本語" })).toHaveAttribute("aria-checked", "true")
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith("ja")
		unmount()

		render(<Segmented options={LANGUAGES} defaultValue="zh" label="語言" />)
		expect(screen.getByRole("radio", { name: "繁體中文" })).toHaveAttribute("aria-checked", "true")
	})

	test("controlled: nothing moves until the parent changes value", async () => {
		render(<Segmented value="en" options={LANGUAGES} onValueChange={() => {}} label="語言" />)
		await userEvent.click(screen.getByRole("radio", { name: "日本語" }))
		expect(screen.getByRole("radio", { name: "English" })).toHaveAttribute("aria-checked", "true")
	})

	test("roving tabindex: Tab enters on the checked radio and leaves the group", async () => {
		const user = userEvent.setup()
		render(
			<>
				<Segmented options={LANGUAGES} defaultValue="zh" label="語言" />
				<button type="button">after</button>
			</>,
		)
		await user.tab()
		expect(screen.getByRole("radio", { name: "繁體中文" })).toHaveFocus()
		await user.tab()
		expect(screen.getByRole("button", { name: "after" })).toHaveFocus()
	})

	test("arrows move focus and the choice, wrapping; Home / End go to the ends", async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(<Controlled onValueChange={onValueChange} />)
		await user.tab()
		expect(screen.getByRole("radio", { name: "English" })).toHaveFocus()

		await user.keyboard("{ArrowRight}")
		expect(screen.getByRole("radio", { name: "繁體中文" })).toHaveFocus()
		expect(screen.getByRole("radio", { name: "繁體中文" })).toHaveAttribute("aria-checked", "true")
		await user.keyboard("{ArrowDown}{ArrowDown}")
		expect(screen.getByRole("radio", { name: "English" })).toHaveFocus()
		await user.keyboard("{ArrowLeft}")
		expect(screen.getByRole("radio", { name: "日本語" })).toHaveAttribute("aria-checked", "true")
		await user.keyboard("{ArrowUp}")
		expect(screen.getByRole("radio", { name: "繁體中文" })).toHaveFocus()
		await user.keyboard("{Home}")
		expect(screen.getByRole("radio", { name: "English" })).toHaveFocus()
		await user.keyboard("{End}")
		expect(screen.getByRole("radio", { name: "日本語" })).toHaveFocus()
		expect(onValueChange).toHaveBeenLastCalledWith("ja")
	})

	test("arrow keys skip a disabled option", async () => {
		const user = userEvent.setup()
		render(
			<Segmented options={[LANGUAGES[0], { ...LANGUAGES[1], disabled: true }, LANGUAGES[2]]} label="語言" />,
		)
		expect(screen.getByRole("radio", { name: "繁體中文" })).toBeDisabled()
		await user.tab()
		await user.keyboard("{ArrowRight}")
		expect(screen.getByRole("radio", { name: "日本語" })).toHaveFocus()
	})

	test("a disabled group takes no choice and no focus", async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(<Segmented options={LANGUAGES} label="語言" disabled onValueChange={onValueChange} />)
		await user.tab()
		expect(document.body).toHaveFocus()
		for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled()
	})

	test("forced-colors: the checked segment is Highlight with HighlightText words", () => {
		render(<Segmented options={LANGUAGES} defaultValue="zh" label="語言" />)
		const css = forcedCss(screen.getByRole("radio", { name: "繁體中文" }))
		expect(css).toMatch(/background-color: highlight/i)
		expect(css).toMatch(/color: highlighttext/i)
		expect(css).toMatch(/focus-visible.*solid highlighttext/i)
	})

	test("axe: checked, unchecked, disabled", async () => {
		const { container } = render(
			<>
				<Segmented options={LANGUAGES} defaultValue="zh" label="語言" />
				<Segmented options={LANGUAGES} label="停用" disabled />
			</>,
		)
		await expectNoAxeViolations(container)
	})
})

test("a row's press is the whole line", async () => {
	const onPress = vi.fn<() => void>()
	render(
		<GroupRow name="Notion" onPress={onPress} chevron>
			12 支工具
		</GroupRow>,
	)
	await userEvent.click(screen.getByRole("button", { name: /Notion/ }))
	expect(onPress).toHaveBeenCalledOnce()
})
