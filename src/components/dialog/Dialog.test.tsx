import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Button } from "../button/Button"
import { ConfirmDialog, Dialog, DialogActions, DialogClose, DialogContent, DialogTrigger } from "./Dialog"

function Rename() {
	return (
		<Dialog>
			<DialogTrigger>
				<Button>重新命名工作區</Button>
			</DialogTrigger>
			<DialogContent title="重新命名工作區" description="新名稱會同步到所有成員。">
				<DialogActions>
					<DialogClose>
						<Button variant="ghost">取消</Button>
					</DialogClose>
					<DialogClose>
						<Button>儲存</Button>
					</DialogClose>
				</DialogActions>
			</DialogContent>
		</Dialog>
	)
}

describe("Dialog", () => {
	test("opens from its trigger with a labelled dialog role", async () => {
		render(<Rename />)
		await userEvent.click(screen.getByRole("button", { name: "重新命名工作區" }))
		const dialog = await screen.findByRole("dialog", { name: "重新命名工作區" })
		expect(dialog).toHaveAccessibleDescription("新名稱會同步到所有成員。")
	})

	test("moves focus into the dialog and makes the page behind inert", async () => {
		render(<Rename />)
		const trigger = screen.getByRole("button", { name: "重新命名工作區" })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole("dialog")
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
		const behind = trigger.closest("[inert], [aria-hidden='true']")
		expect(behind).not.toBeNull()
	})

	test("Escape closes and focus returns to the trigger", async () => {
		render(<Rename />)
		const trigger = screen.getByRole("button", { name: "重新命名工作區" })
		await userEvent.click(trigger)
		await screen.findByRole("dialog")
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
		expect(trigger).toHaveFocus()
	})

	test("a close button dismisses the dialog", async () => {
		render(<Rename />)
		await userEvent.click(screen.getByRole("button", { name: "重新命名工作區" }))
		await userEvent.click(await screen.findByRole("button", { name: "取消" }))
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
	})
})

describe("ConfirmDialog", () => {
	test("uses alertdialog semantics and confirms", async () => {
		const onConfirm = vi.fn()
		render(
			<ConfirmDialog
				trigger={<Button>刪除記憶</Button>}
				title="刪除這則記憶?"
				description="此動作無法復原。"
				danger
				confirmLabel="刪除"
				onConfirm={onConfirm}
			/>,
		)
		await userEvent.click(screen.getByRole("button", { name: "刪除記憶" }))
		await screen.findByRole("alertdialog", { name: "刪除這則記憶?" })
		await userEvent.click(screen.getByRole("button", { name: "刪除" }))
		expect(onConfirm).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
	})

	test("danger confirm starts focused on cancel", async () => {
		render(
			<ConfirmDialog
				trigger={<Button>刪除記憶</Button>}
				title="刪除這則記憶?"
				danger
				confirmLabel="刪除"
				onConfirm={() => {}}
			/>,
		)
		await userEvent.click(screen.getByRole("button", { name: "刪除記憶" }))
		await screen.findByRole("alertdialog")
		await waitFor(() => expect(screen.getByRole("button", { name: "取消" })).toHaveFocus())
	})
})
