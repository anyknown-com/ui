import { DirectionProvider } from "@base-ui/react/direction-provider"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type ReactNode, useState } from "react"
import { afterAll, beforeAll, describe, expect, test } from "vitest"
import { ActionBar } from "../components/action-bar/ActionBar"
import { Button } from "../components/button/Button"
import { Composer } from "../components/composer/Composer"
import { DropdownItem, DropdownMenu, DropdownSub } from "../components/dropdown/DropdownMenu"
import { Slider } from "../components/slider/Slider"
import { Switch } from "../components/switch/Switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "../components/tabs/Tabs"
import { Toaster, createToastManager } from "../components/toast/Toast"

// Right-to-left, as far as jsdom can tell. jsdom has no layout: it does not compute
// `direction`, does not resolve `inset-inline-*` to a side, and StyleX styles arrive as class
// names it never applies. So these tests check what does not need layout:
//
// - which way the arrow keys move, and
// - that nothing writes a physical side (left / right) as an inline style, the one place a
//   class-based logical style could be overridden. Floating UI's measured `top/left` on
//   portalled positioners and visually hidden helpers are geometry, not layout intent, and are
//   left out.
//
// Whether a thumb, an indicator or a popup actually lands on the correct side needs a real
// browser.
//
// Two facts these tests pin:
// - Base UI components (Tabs, the dropdown's submenu) read direction from Base UI's
//   `<DirectionProvider>`, not from the `dir` attribute. An RTL app needs both.
// - Portalled layers (toasts, menus) inherit direction from `<html>`, not from a `dir` on a
//   wrapper, so the document is set to RTL here, as an RTL app would.

beforeAll(() => {
	document.documentElement.dir = "rtl"
})
afterAll(() => {
	document.documentElement.removeAttribute("dir")
})

function Rtl({ children }: { children: ReactNode }) {
	return <DirectionProvider direction="rtl">{children}</DirectionProvider>
}

const PHYSICAL =
	/(^|;)\s*(left|right|margin-left|margin-right|padding-left|padding-right|border-left[\w-]*|border-right[\w-]*)\s*:/

/** Inline styles that name a physical side, outside geometry Base UI measures for itself. */
function physicalInlineStyles(root: ParentNode = document.body) {
	return Array.from(root.querySelectorAll<HTMLElement>("[style]"))
		.filter((el) => !el.closest("[data-side]") && !el.hasAttribute("data-base-ui-focus-guard"))
		.map((el) => el.getAttribute("style") ?? "")
		.filter((style) => !style.includes("clip-path: inset(50%)") && PHYSICAL.test(style))
}

function Volume() {
	const [value, setValue] = useState(0.5)
	return <Slider aria-label="Volume" value={value} onChange={setValue} />
}

describe("RTL", () => {
	test("Switch: toggles from the keyboard and writes no physical inline side", async () => {
		const { container } = render(<Switch label="Wi-Fi" />)
		const control = screen.getByRole("switch", { name: "Wi-Fi" })
		control.focus()
		await userEvent.keyboard(" ")
		expect(control).toBeChecked()
		expect(physicalInlineStyles(container)).toEqual([])
	})

	test("Tabs: ArrowLeft moves to the next tab under a DirectionProvider", async () => {
		const { container } = render(
			<Rtl>
				<Tabs defaultValue="a">
					<TabsList aria-label="Views">
						<TabsTab value="a">A</TabsTab>
						<TabsTab value="b">B</TabsTab>
						<TabsTab value="c">C</TabsTab>
					</TabsList>
					<TabsPanel value="a">Panel A</TabsPanel>
				</Tabs>
			</Rtl>,
		)
		screen.getByRole("tab", { name: "A" }).focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("tab", { name: "B" })).toHaveFocus()
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("tab", { name: "A" })).toHaveFocus()
		expect(physicalInlineStyles(container)).toEqual([])
	})

	test("Slider: writes no physical inline side for the thumb or the fill", () => {
		const { container } = render(<Volume />)
		expect(physicalInlineStyles(container)).toEqual([])
	})

	// Known gap: the thumb moves with inset-inline-start, so under RTL a higher value sits
	// further left, but ArrowRight still raises the value (and pointer math reads clientX
	// from the left edge). Flip this to `test` when Slider mirrors its keys.
	test.fails("Slider: ArrowLeft raises the value, toward the inline end", async () => {
		render(<Volume />)
		const slider = screen.getByRole("slider", { name: "Volume" })
		slider.focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(Number(slider.getAttribute("aria-valuenow"))).toBeGreaterThan(0.5)
	})

	test("DropdownMenu: ArrowLeft opens a submenu under a DirectionProvider", async () => {
		render(
			<Rtl>
				<DropdownMenu trigger={<Button>Menu</Button>}>
					<DropdownItem>Rename</DropdownItem>
					<DropdownSub label="Move to">
						<DropdownItem>Archive</DropdownItem>
					</DropdownSub>
				</DropdownMenu>
			</Rtl>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Menu" }))
		;(await screen.findByRole("menuitem", { name: "Move to" })).focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(await screen.findByRole("menuitem", { name: "Archive" })).toBeInTheDocument()
		expect(physicalInlineStyles()).toEqual([])
	})

	test("Toast: the portalled region inherits RTL from the document and F8 still reaches it", async () => {
		const manager = createToastManager()
		render(<Toaster manager={manager} />)
		act(() => void manager.add({ title: "Saved", action: { label: "Undo", onClick: () => {} } }))
		const region = screen.getByRole("region", { name: "通知" })
		expect(region.closest("[dir]")?.getAttribute("dir")).toBe("rtl")
		await userEvent.keyboard("{F8}")
		expect(region).toHaveFocus()
		expect(physicalInlineStyles(region)).toEqual([])
		act(() => manager.closeAll())
	})

	test("ActionBar: reads the dir attribute; ArrowLeft goes to the next button", async () => {
		render(
			<ActionBar visible>
				<ActionBar.Button>One</ActionBar.Button>
				<ActionBar.Button>Two</ActionBar.Button>
				<ActionBar.Button>Three</ActionBar.Button>
			</ActionBar>,
		)
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "One" })).toHaveFocus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("button", { name: "Two" })).toHaveFocus()
		await userEvent.keyboard("{ArrowRight}{ArrowRight}")
		expect(screen.getByRole("button", { name: "Three" })).toHaveFocus()
	})

	test("Composer: types and sends under RTL; no physical inline side", async () => {
		const sent: string[] = []
		const { container } = render(<Composer onSubmit={(text) => sent.push(text)} />)
		const box = screen.getByRole("textbox")
		await userEvent.type(box, "שלום{Enter}")
		expect(sent).toEqual(["שלום"])
		expect(physicalInlineStyles(container)).toEqual([])
	})
})
