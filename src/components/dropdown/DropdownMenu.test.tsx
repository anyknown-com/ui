import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Button } from "../button/Button"
import {
	DropdownCheckboxItem,
	DropdownGroup,
	DropdownItem,
	DropdownMenu,
	DropdownSeparator,
	DropdownSub,
} from "./DropdownMenu"

/** jsdom has no animations; hold every exit (`data-ending-style`) until `finish()`. */
function holdExits() {
	let finish!: () => void
	const finished = new Promise<void>((resolve) => (finish = resolve))
	const held = { finished, pending: false, playState: "running" }
	Element.prototype.getAnimations = function (this: Element) {
		return (this.hasAttribute("data-ending-style") ? [held] : []) as unknown as Animation[]
	}
	return {
		finish: () => act(async () => finish()),
		restore: () => delete (Element.prototype as Partial<Element>).getAnimations,
	}
}

function ThreadMenu({ onSelect }: { onSelect?: () => void }) {
	const [showReceipts, setShowReceipts] = useState(false)
	return (
		<DropdownMenu trigger={<Button>Thread 動作</Button>}>
			<DropdownGroup label="這條 thread">
				<DropdownItem shortcut="⌘N" onSelect={onSelect}>
					新增交接備註
				</DropdownItem>
				<DropdownSub label="匯出">
					<DropdownItem>Markdown</DropdownItem>
					<DropdownSub label="範圍…">
						<DropdownItem>只有今天</DropdownItem>
					</DropdownSub>
				</DropdownSub>
			</DropdownGroup>
			<DropdownSeparator />
			<DropdownCheckboxItem checked={showReceipts} onCheckedChange={setShowReceipts}>
				顯示換班回條
			</DropdownCheckboxItem>
			<DropdownItem variant="danger">刪除這一天的紀錄</DropdownItem>
		</DropdownMenu>
	)
}

describe("DropdownMenu", () => {
	test("trigger exposes menu semantics and opens on click", async () => {
		render(<ThreadMenu />)
		const trigger = screen.getByRole("button", { name: "Thread 動作" })
		expect(trigger).toHaveAttribute("aria-haspopup", "menu")
		expect(trigger).toHaveAttribute("aria-expanded", "false")
		await userEvent.click(trigger)
		expect(await screen.findByRole("menu")).toBeInTheDocument()
		expect(trigger).toHaveAttribute("aria-expanded", "true")
	})

	test("renders group label, shortcut and separator", async () => {
		render(<ThreadMenu />)
		await userEvent.click(screen.getByRole("button", { name: "Thread 動作" }))
		await screen.findByRole("menu")
		expect(screen.getByText("這條 thread")).toBeInTheDocument()
		expect(screen.getByText("⌘N")).toBeInTheDocument()
		expect(screen.getByRole("separator")).toBeInTheDocument()
	})

	test("selects an item with the keyboard and closes", async () => {
		const onSelect = vi.fn()
		render(<ThreadMenu onSelect={onSelect} />)
		const trigger = screen.getByRole("button", { name: "Thread 動作" })
		trigger.focus()
		await userEvent.keyboard("{Enter}")
		await screen.findByRole("menu")
		await userEvent.keyboard("{Enter}")
		await waitFor(() => expect(onSelect).toHaveBeenCalled())
		await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
	})

	test("ArrowRight opens a nested submenu and ArrowLeft closes it", async () => {
		render(<ThreadMenu />)
		await userEvent.click(screen.getByRole("button", { name: "Thread 動作" }))
		await screen.findByRole("menu")
		await userEvent.keyboard("{ArrowDown}{ArrowDown}")
		expect(screen.getByRole("menuitem", { name: /匯出/ })).toHaveAttribute("data-highlighted")
		await userEvent.keyboard("{ArrowRight}")
		expect(await screen.findByRole("menuitem", { name: "Markdown" })).toBeInTheDocument()
		await userEvent.keyboard("{ArrowDown}{ArrowRight}")
		expect(await screen.findByRole("menuitem", { name: "只有今天" })).toBeInTheDocument()
		await userEvent.keyboard("{ArrowLeft}")
		await waitFor(() => expect(screen.queryByRole("menuitem", { name: "只有今天" })).not.toBeInTheDocument())
	})

	test("checkbox item reflects and toggles aria-checked", async () => {
		render(<ThreadMenu />)
		await userEvent.click(screen.getByRole("button", { name: "Thread 動作" }))
		const item = await screen.findByRole("menuitemcheckbox", { name: "顯示換班回條" })
		expect(item).toHaveAttribute("aria-checked", "false")
		await userEvent.click(item)
		await waitFor(() => expect(item).toHaveAttribute("aria-checked", "true"))
		expect(screen.getByRole("menu")).toBeInTheDocument()
	})

	test("Escape closes the menu and returns focus to the trigger", async () => {
		render(<ThreadMenu />)
		const trigger = screen.getByRole("button", { name: "Thread 動作" })
		await userEvent.click(trigger)
		await screen.findByRole("menu")
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
		expect(trigger).toHaveFocus()
	})
})

describe("DropdownMenu focus return", () => {
	test("Escape hands focus back to the trigger as the exit starts, not after it", async () => {
		const exits = holdExits()
		try {
			render(<ThreadMenu />)
			const trigger = screen.getByRole("button", { name: "Thread 動作" })
			await userEvent.click(trigger)
			const menu = await screen.findByRole("menu")
			await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true))
			await userEvent.keyboard("{Escape}")
			await waitFor(() => expect(menu).toHaveAttribute("data-ending-style"))
			expect(menu).toBeInTheDocument()
			expect(trigger).toHaveFocus()
			await exits.finish()
			await waitFor(() => expect(menu).not.toBeInTheDocument())
		} finally {
			exits.restore()
		}
	})

	test("choosing an item in a submenu hands focus back to the menu's trigger", async () => {
		const exits = holdExits()
		try {
			render(<ThreadMenu />)
			const trigger = screen.getByRole("button", { name: "Thread 動作" })
			trigger.focus()
			// opening from the keyboard highlights the first item
			await userEvent.keyboard("{Enter}")
			await screen.findByRole("menu")
			await userEvent.keyboard("{ArrowDown}{ArrowRight}")
			const item = await screen.findByRole("menuitem", { name: "Markdown" })
			await waitFor(() => expect(item).toHaveFocus())
			await userEvent.keyboard("{Enter}")
			await waitFor(() => expect(trigger).toHaveFocus())
			await exits.finish()
			await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
			expect(trigger).toHaveFocus()
		} finally {
			exits.restore()
		}
	})
})

describe("DropdownMenu keyboard (APG menu button)", () => {
	function Plain() {
		return (
			<DropdownMenu trigger={<Button>動作</Button>}>
				<DropdownItem>複製</DropdownItem>
				<DropdownItem>封存</DropdownItem>
				<DropdownItem disabled>移動</DropdownItem>
				<DropdownItem>刪除</DropdownItem>
			</DropdownMenu>
		)
	}

	const highlighted = () =>
		screen.getAllByRole("menuitem").find((item) => item.hasAttribute("data-highlighted"))

	test("ArrowDown on the trigger opens the menu on the first item", async () => {
		render(<Plain />)
		screen.getByRole("button", { name: "動作" }).focus()
		await userEvent.keyboard("{ArrowDown}")
		await screen.findByRole("menu")
		await waitFor(() => expect(highlighted()).toHaveTextContent("複製"))
	})

	// APG: disabled items stay focusable (so they are discoverable) but do nothing
	test("arrows move through every item, disabled ones included, and wrap; Home and End jump", async () => {
		const onSelect = vi.fn()
		render(
			<DropdownMenu trigger={<Button>動作</Button>}>
				<DropdownItem>複製</DropdownItem>
				<DropdownItem>封存</DropdownItem>
				<DropdownItem disabled onSelect={onSelect}>
					移動
				</DropdownItem>
				<DropdownItem>刪除</DropdownItem>
			</DropdownMenu>,
		)
		screen.getByRole("button", { name: "動作" }).focus()
		await userEvent.keyboard("{Enter}")
		await screen.findByRole("menu")
		await waitFor(() => expect(highlighted()).toHaveTextContent("複製"))
		await userEvent.keyboard("{ArrowDown}{ArrowDown}")
		expect(highlighted()).toHaveTextContent("移動")
		expect(highlighted()).toHaveAttribute("aria-disabled", "true")
		await userEvent.keyboard("{Enter}")
		expect(onSelect).not.toHaveBeenCalled()
		expect(screen.getByRole("menu")).toBeInTheDocument()
		await userEvent.keyboard("{ArrowDown}")
		expect(highlighted()).toHaveTextContent("刪除")
		await userEvent.keyboard("{ArrowUp}{ArrowUp}")
		expect(highlighted()).toHaveTextContent("封存")
		await userEvent.keyboard("{End}")
		expect(highlighted()).toHaveTextContent("刪除")
		await userEvent.keyboard("{Home}")
		expect(highlighted()).toHaveTextContent("複製")
		await userEvent.keyboard("{ArrowUp}")
		expect(highlighted()).toHaveTextContent("刪除")
	})

	test("typeahead: a letter jumps to the item that starts with it; quick typing matches a prefix", async () => {
		render(
			<DropdownMenu trigger={<Button>Actions</Button>}>
				<DropdownItem>Copy</DropdownItem>
				<DropdownItem>Archive</DropdownItem>
				<DropdownItem>Delete</DropdownItem>
				<DropdownItem>Duplicate</DropdownItem>
			</DropdownMenu>,
		)
		const trigger = screen.getByRole("button", { name: "Actions" })
		trigger.focus()
		await userEvent.keyboard("{Enter}")
		await screen.findByRole("menu")
		await userEvent.keyboard("d")
		await waitFor(() => expect(highlighted()).toHaveTextContent("Delete"))
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(trigger).toHaveFocus())
		await userEvent.keyboard("{Enter}")
		await screen.findByRole("menu")
		await userEvent.keyboard("du")
		await waitFor(() => expect(highlighted()).toHaveTextContent("Duplicate"))
	})

	test("Tab closes the menu", async () => {
		render(<Plain />)
		await userEvent.click(screen.getByRole("button", { name: "動作" }))
		await screen.findByRole("menu")
		await userEvent.tab()
		await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
	})

	test("an open menu has no axe violations", async () => {
		render(<ThreadMenu />)
		await userEvent.click(screen.getByRole("button", { name: "Thread 動作" }))
		await screen.findByRole("menu")
		await expectNoAxeViolations()
	})
})

describe("DropdownMenu accessibility", () => {
	test("the shortcut is announced as a key shortcut, not part of the name", async () => {
		render(<ThreadMenu />)
		await userEvent.click(screen.getByRole("button", { name: "Thread 動作" }))
		const item = await screen.findByRole("menuitem", { name: "新增交接備註" })
		expect(item).toHaveAttribute("aria-keyshortcuts", "⌘N")
	})
})
