import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Button } from "../button/Button"
import { Sheet, SheetContent, SheetTrigger } from "./Sheet"

function ModelSheet() {
	const [open, setOpen] = useState(false)
	const [model, setModel] = useState("Opus 5.5")
	return (
		<>
			<p>現在:{model}</p>
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger>
					<Button variant="secondary">模型</Button>
				</SheetTrigger>
				<SheetContent
					title="Opus 5.5 · 你的訂閱"
					height="tall"
					head={<Button variant="ghost">‹ 返回</Button>}
				>
					{["Opus 5.5", "Sonnet 5"].map((name) => (
						<Button
							key={name}
							variant="ghost"
							onClick={() => {
								setModel(name)
								setOpen(false)
							}}
						>
							{name}
						</Button>
					))}
				</SheetContent>
			</Sheet>
		</>
	)
}

async function openSheet() {
	const trigger = screen.getByRole("button", { name: "模型" })
	await userEvent.click(trigger)
	const sheet = await screen.findByRole("dialog", { name: "Opus 5.5 · 你的訂閱" })
	return { trigger, sheet }
}

function closed() {
	return waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
}

describe("Sheet", () => {
	test("opens from its trigger as a dialog named by its title", async () => {
		render(<ModelSheet />)
		await openSheet()
		expect(screen.getByRole("heading", { name: "Opus 5.5 · 你的訂閱" })).toBeInTheDocument()
	})

	test("moves focus into the sheet and makes the page behind inert", async () => {
		render(<ModelSheet />)
		const { trigger, sheet } = await openSheet()
		await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true))
		expect(trigger.closest("[inert], [aria-hidden='true']")).not.toBeNull()
	})

	test("Escape closes and focus returns to the trigger", async () => {
		render(<ModelSheet />)
		const { trigger } = await openSheet()
		await userEvent.keyboard("{Escape}")
		await closed()
		expect(trigger).toHaveFocus()
	})

	test("a click on the backdrop closes it", async () => {
		render(<ModelSheet />)
		await openSheet()
		const backdrop = document.querySelector("[role='presentation']") as HTMLElement
		await userEvent.click(backdrop)
		await closed()
	})

	test("the consumer closes it after a pick, and focus returns to the trigger", async () => {
		render(<ModelSheet />)
		const { trigger } = await openSheet()
		await userEvent.click(screen.getByRole("button", { name: "Sonnet 5" }))
		await closed()
		expect(screen.getByText("現在:Sonnet 5")).toBeInTheDocument()
		expect(trigger).toHaveFocus()
	})

	test("the keyboard opens it, Tab stays inside, Enter picks", async () => {
		render(<ModelSheet />)
		const trigger = screen.getByRole("button", { name: "模型" })
		trigger.focus()
		await userEvent.keyboard("{Enter}")
		const sheet = await screen.findByRole("dialog")
		await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true))
		const seen: (Element | null)[] = []
		for (let i = 0; i < 4; i += 1) {
			await userEvent.tab()
			// Base UI's focus guards hand focus back in on the next tick
			await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true))
			seen.push(document.activeElement)
		}
		const pick = screen.getByRole("button", { name: "Sonnet 5" })
		expect(seen).toContain(pick)
		pick.focus()
		await userEvent.keyboard("{Enter}")
		await closed()
		expect(screen.getByText("現在:Sonnet 5")).toBeInTheDocument()
		expect(trigger).toHaveFocus()
	})

	test("an open sheet has no axe violations", async () => {
		render(<ModelSheet />)
		await openSheet()
		await expectNoAxeViolations()
	})
})
