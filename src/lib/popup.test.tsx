import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { Button } from "../components/button/Button"
import { Dialog, DialogContent } from "../components/dialog/Dialog"
import { DropdownItem, DropdownMenu } from "../components/dropdown/DropdownMenu"
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover/Popover"
import { Select, SelectItem } from "../components/select/Select"
import { Toaster, createToastManager } from "../components/toast/Toast"
import { Tooltip } from "../components/tooltip/Tooltip"

/**
 * The declarations StyleX injected under `@media (forced-colors: active)` for any class `el`
 * carries, as one lower-case string. jsdom never matches the query, so the test reads the
 * stylesheet instead of computed style.
 */
function forcedColors(el: Element) {
	const classes = Array.from(el.classList)
	const found: string[] = []
	for (const sheet of Array.from(document.styleSheets))
		for (const rule of Array.from(sheet.cssRules)) {
			if (!(rule instanceof CSSMediaRule) || !rule.conditionText.includes("forced-colors")) continue
			for (const inner of Array.from(rule.cssRules))
				if (inner instanceof CSSStyleRule && classes.some((name) => inner.selectorText.includes(`.${name}`)))
					found.push(`${inner.selectorText} { ${inner.style.cssText} }`)
		}
	return found.join("\n").toLowerCase()
}

// Under forced colors shadows disappear and author colours become system colours: every open
// overlay keeps a CanvasText boundary, and its focus ring turns Highlight.
describe("overlays under forced colors", () => {
	test("dialog: a CanvasText border and a Highlight focus ring", async () => {
		render(
			<Dialog defaultOpen>
				<DialogContent title="重新命名" />
			</Dialog>,
		)
		const css = forcedColors(await screen.findByRole("dialog"))
		expect(css).toMatch(/border-color: canvastext/)
		expect(css).toMatch(/:focus-visible[^{]*\{ outline: [^;]* solid highlight/)
	})

	test("popover: a CanvasText border", async () => {
		render(
			<Popover defaultOpen>
				<PopoverTrigger>
					<Button>說明</Button>
				</PopoverTrigger>
				<PopoverContent aria-label="說明">內容</PopoverContent>
			</Popover>,
		)
		expect(forcedColors(await screen.findByRole("dialog"))).toMatch(/border-color: canvastext/)
	})

	test("dropdown menu: a CanvasText border", async () => {
		render(
			<DropdownMenu defaultOpen trigger={<Button>動作</Button>}>
				<DropdownItem>複製</DropdownItem>
			</DropdownMenu>,
		)
		expect(forcedColors(await screen.findByRole("menu"))).toMatch(/border-color: canvastext/)
	})

	test("select popup: a CanvasText border", async () => {
		render(
			<Select aria-label="模型">
				<SelectItem value="opus-5">Opus 5</SelectItem>
			</Select>,
		)
		await userEvent.click(screen.getByRole("combobox", { name: "模型" }))
		const popup = (await screen.findByRole("listbox")).parentElement
		expect(forcedColors(popup as Element)).toMatch(/border-color: canvastext/)
	})

	test("tooltip: a CanvasText border", async () => {
		render(
			<Tooltip content="產生交接摘要" delay={0}>
				<Button>開始換班</Button>
			</Tooltip>,
		)
		await userEvent.hover(screen.getByRole("button", { name: "開始換班" }))
		expect(forcedColors(await screen.findByRole("tooltip"))).toMatch(/border-color: canvastext/)
	})

	test("toast: a CanvasText border, Highlight focus rings on the region and the close button", () => {
		const manager = createToastManager()
		render(<Toaster manager={manager} />)
		act(() => void manager.add({ title: "已複製" }))
		expect(forcedColors(screen.getByRole("status"))).toMatch(/border-color: canvastext/)
		expect(forcedColors(screen.getByRole("region"))).toMatch(
			/:focus-visible[^{]*\{ outline: [^;]* solid highlight/,
		)
		expect(forcedColors(screen.getByRole("button", { name: "關閉通知" }))).toMatch(
			/:focus-visible[^{]*\{ outline: [^;]* solid highlight/,
		)
	})
})
