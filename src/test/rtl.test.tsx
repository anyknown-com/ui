import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type ReactNode, useState } from "react"
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest"
import { ActionBar } from "../components/action-bar/ActionBar"
import { Button } from "../components/button/Button"
import { Composer } from "../components/composer/Composer"
import { DropdownItem, DropdownMenu, DropdownSub } from "../components/dropdown/DropdownMenu"
import { Segmented } from "../components/segmented/Segmented"
import { Slider } from "../components/slider/Slider"
import { Switch } from "../components/switch/Switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "../components/tabs/Tabs"
import { Toaster, createToastManager } from "../components/toast/Toast"
import { DirectionProvider } from "../lib/direction"

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
// - Base UI components (Tabs, the dropdown's submenu) read direction from our
//   `<DirectionProvider>`, not from the `dir` attribute. An RTL app needs both. Slider,
//   Segmented and ActionBar read either.
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

const VIEWS = [
	{ value: "list", label: "List" },
	{ value: "grid", label: "Grid" },
	{ value: "table", label: "Table" },
]

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

	test("Slider: ArrowLeft raises the value, toward the inline end; Up / Down do not flip", async () => {
		render(<Volume />)
		const slider = screen.getByRole("slider", { name: "Volume" })
		slider.focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.55")
		await userEvent.keyboard("{ArrowRight}{ArrowRight}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.45")
		await userEvent.keyboard("{ArrowUp}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.5")
	})

	test("Slider: a drag measures from the right edge", () => {
		render(<Volume />)
		const slider = screen.getByRole("slider", { name: "Volume" })
		slider.setPointerCapture = vi.fn()
		vi.spyOn(slider, "getBoundingClientRect").mockReturnValue(
			DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 24 }),
		)
		fireEvent.pointerDown(slider, { pointerId: 1, clientX: 20 })
		expect(slider).toHaveAttribute("aria-valuenow", "0.8")
		fireEvent.pointerUp(slider, { pointerId: 1, clientX: 20 })
	})

	test("Slider: a DirectionProvider mirrors the keys even inside dir=ltr", async () => {
		render(
			<div dir="ltr">
				<Rtl>
					<Volume />
				</Rtl>
			</div>,
		)
		const slider = screen.getByRole("slider", { name: "Volume" })
		slider.focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(slider).toHaveAttribute("aria-valuenow", "0.55")
	})

	test("Tabs: wrapping, Home and End follow the list order under RTL", async () => {
		render(
			<Rtl>
				<Tabs defaultValue="a" variant="pills">
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
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("tab", { name: "C" })).toHaveFocus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("tab", { name: "A" })).toHaveFocus()
		await userEvent.keyboard("{End}")
		expect(screen.getByRole("tab", { name: "C" })).toHaveFocus()
		await userEvent.keyboard("{Home}")
		expect(screen.getByRole("tab", { name: "A" })).toHaveFocus()
	})

	test("Tabs: without a DirectionProvider, the dir attribute alone does not mirror the keys", async () => {
		render(
			<Tabs defaultValue="a">
				<TabsList aria-label="Views">
					<TabsTab value="a">A</TabsTab>
					<TabsTab value="b">B</TabsTab>
				</TabsList>
				<TabsPanel value="a">Panel A</TabsPanel>
			</Tabs>,
		)
		screen.getByRole("tab", { name: "A" }).focus()
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("tab", { name: "B" })).toHaveFocus()
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
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.queryByRole("menuitem", { name: "Archive" })).not.toBeInTheDocument()
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

	test("ActionBar: a DirectionProvider mirrors the keys even inside dir=ltr", async () => {
		render(
			<div dir="ltr">
				<Rtl>
					<ActionBar visible>
						<ActionBar.Button>One</ActionBar.Button>
						<ActionBar.Button>Two</ActionBar.Button>
						<ActionBar.Button>Three</ActionBar.Button>
					</ActionBar>
				</Rtl>
			</div>,
		)
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "One" })).toHaveFocus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("button", { name: "Two" })).toHaveFocus()
	})

	test("Segmented: reads the dir attribute; ArrowLeft checks the next option", async () => {
		render(<Segmented label="View" options={VIEWS} />)
		screen.getByRole("radio", { name: "List" }).focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("radio", { name: "Grid" })).toHaveFocus()
		expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked()
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("radio", { name: "List" })).toBeChecked()
	})

	test("Segmented: a DirectionProvider mirrors the keys even inside dir=ltr", async () => {
		render(
			<div dir="ltr">
				<Rtl>
					<Segmented label="View" options={VIEWS} />
				</Rtl>
			</div>,
		)
		screen.getByRole("radio", { name: "List" }).focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked()
		await userEvent.keyboard("{ArrowDown}")
		expect(screen.getByRole("radio", { name: "Table" })).toBeChecked()
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
