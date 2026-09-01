import * as stylex from "@stylexjs/stylex"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { type StyleArg } from "../../lib/styled"
import { Button } from "../button/Button"
import { ConfirmDialog, Dialog, DialogActions, DialogClose, DialogContent, DialogTrigger } from "./Dialog"

// 跟 popup 的 width 同值,用來確認 base 那顆 atom 被 sx 換掉而不是疊在一起
const probe = stylex.create({
	baseWidth: { width: "min(24rem, calc(100vw - 2rem))" },
	wide: { width: "40rem" },
})

// dev build 會多帶一顆可讀的 debug class,atomic 的是雜湊那顆
function atom(style: StyleArg): string {
	const classes = stylex.props(style).className?.split(" ") ?? []
	const hashed = classes.filter((name) => /^x[a-z0-9]+$/.test(name))
	expect(hashed).toHaveLength(1)
	return hashed[0] as string
}

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

	test("sx replaces the popup's own width instead of stacking on top of it", async () => {
		render(
			<Dialog defaultOpen>
				<DialogContent title="選模型" sx={probe.wide}>
					三欄
				</DialogContent>
			</Dialog>,
		)
		const classes = (await screen.findByRole("dialog")).className.split(" ")
		expect(classes).toContain(atom(probe.wide))
		expect(classes).not.toContain(atom(probe.baseWidth))
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
