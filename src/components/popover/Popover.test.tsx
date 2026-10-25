import * as stylex from "@stylexjs/stylex"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { type StyleArg } from "../../lib/styled"
import { expectNoAxeViolations } from "../../test/axe"
import { space } from "../../tokens.stylex"
import { Button } from "../button/Button"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "./Popover"

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

const probe = stylex.create({
	basePadding: { padding: space.md },
	tightPadding: { padding: space.xs },
})

function atom(style: StyleArg): string {
	const classes = stylex.props(style).className?.split(" ") ?? []
	const hashed = classes.filter((name) => /^x[a-z0-9]+$/.test(name))
	expect(hashed).toHaveLength(1)
	return hashed[0] as string
}

function MemoryPopover() {
	return (
		<Popover>
			<PopoverTrigger>
				<Button variant="secondary">部署走 Cloudflare</Button>
			</PopoverTrigger>
			<PopoverContent side="bottom" titled>
				<PopoverTitle>部署走 Cloudflare</PopoverTitle>
				<PopoverDescription>2026/08/12 由換班交接寫入。</PopoverDescription>
				<Button variant="ghost">編輯</Button>
			</PopoverContent>
		</Popover>
	)
}

describe("Popover", () => {
	test("sx replaces the panel padding instead of stacking on top of it", async () => {
		render(
			<Popover defaultOpen>
				<PopoverTrigger>
					<Button variant="secondary">模型</Button>
				</PopoverTrigger>
				<PopoverContent aria-label="模型" sx={probe.tightPadding}>
					內容
				</PopoverContent>
			</Popover>,
		)
		const classes = (await screen.findByRole("dialog")).className.split(" ")
		expect(classes).toContain(atom(probe.tightPadding))
		expect(classes).not.toContain(atom(probe.basePadding))
	})

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

	test("Escape hands focus back to the trigger as the exit starts, not after it", async () => {
		const exits = holdExits()
		try {
			render(<MemoryPopover />)
			const trigger = screen.getByRole("button", { name: "部署走 Cloudflare" })
			await userEvent.click(trigger)
			const panel = await screen.findByRole("dialog")
			await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
			await userEvent.keyboard("{Escape}")
			await waitFor(() => expect(panel).toHaveAttribute("data-ending-style"))
			expect(panel).toBeInTheDocument()
			expect(trigger).toHaveFocus()
			await exits.finish()
			await waitFor(() => expect(panel).not.toBeInTheDocument())
		} finally {
			exits.restore()
		}
	})

	test("an open popover has no axe violations", async () => {
		render(<MemoryPopover />)
		await userEvent.click(screen.getByRole("button", { name: "部署走 Cloudflare" }))
		await screen.findByRole("dialog")
		await expectNoAxeViolations()
	})

	test("Tab moves through the content and focus stays reachable", async () => {
		render(<MemoryPopover />)
		await userEvent.click(screen.getByRole("button", { name: "部署走 Cloudflare" }))
		const panel = await screen.findByRole("dialog")
		await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
		const edit = screen.getByRole("button", { name: "編輯" })
		if (document.activeElement !== edit) await userEvent.tab()
		expect(edit).toHaveFocus()
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
