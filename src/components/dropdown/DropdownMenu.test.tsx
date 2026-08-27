import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { Button } from "../button/Button"
import {
	DropdownCheckboxItem,
	DropdownGroup,
	DropdownItem,
	DropdownMenu,
	DropdownSeparator,
	DropdownSub,
} from "./DropdownMenu"

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
