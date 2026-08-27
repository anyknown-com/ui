import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { Button } from "../button/Button"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "./Popover"

function MemoryPopover() {
	return (
		<Popover>
			<PopoverTrigger>
				<Button variant="secondary">部署走 Cloudflare</Button>
			</PopoverTrigger>
			<PopoverContent side="bottom">
				<PopoverTitle>部署走 Cloudflare</PopoverTitle>
				<PopoverDescription>2026/08/12 由換班交接寫入。</PopoverDescription>
				<Button variant="ghost">編輯</Button>
			</PopoverContent>
		</Popover>
	)
}

describe("Popover", () => {
	test("trigger reports its expanded state", async () => {
		render(<MemoryPopover />)
		const trigger = screen.getByRole("button", { name: "部署走 Cloudflare" })
		expect(trigger).toHaveAttribute("aria-expanded", "false")
		await userEvent.click(trigger)
		expect(await screen.findByRole("dialog")).toBeInTheDocument()
		expect(trigger).toHaveAttribute("aria-expanded", "true")
	})

	test("is labelled by its title and described by its description", async () => {
		render(<MemoryPopover />)
		await userEvent.click(screen.getByRole("button", { name: "部署走 Cloudflare" }))
		const panel = await screen.findByRole("dialog")
		expect(panel).toHaveAccessibleName("部署走 Cloudflare")
		expect(panel).toHaveAccessibleDescription("2026/08/12 由換班交接寫入。")
	})

	test("moves focus into the content and back to the trigger on Escape", async () => {
		render(<MemoryPopover />)
		const trigger = screen.getByRole("button", { name: "部署走 Cloudflare" })
		await userEvent.click(trigger)
		const panel = await screen.findByRole("dialog")
		await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
		expect(trigger).toHaveFocus()
	})

	test("clicking outside closes it", async () => {
		render(
			<>
				<MemoryPopover />
				<button type="button">外面</button>
			</>,
		)
		await userEvent.click(screen.getByRole("button", { name: "部署走 Cloudflare" }))
		await screen.findByRole("dialog")
		await userEvent.click(screen.getByRole("button", { name: "外面" }))
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
	})
})
