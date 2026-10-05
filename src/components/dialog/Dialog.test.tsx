import * as stylex from "@stylexjs/stylex"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, test, vi } from "vitest"
import { type StyleArg } from "../../lib/styled"
import { Button } from "../button/Button"
import {
	ConfirmDialog,
	createDialogManager,
	Dialog,
	DialogActions,
	DialogClose,
	DialogContent,
	type DialogHandle,
	dialogManager,
	Dialogs,
	DialogTrigger,
	useDialog,
} from "./Dialog"

// 跟 popup 的 width 同值,用來確認 base 那顆 atom 被 sx 換掉而不是疊在一起
const probe = stylex.create({
	baseWidth: { width: "min(24rem, calc(100vw - 2rem))" },
	wide: { width: "40rem" },
	fullWidth: { width: "min(64rem, calc(100vw - 2rem))" },
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

	test("size 換掉 popup 自己的寬,body 是另一段(標頭不跟著捲)", async () => {
		render(
			<Dialog defaultOpen>
				<DialogContent title="工具紀錄" size="full" body={<p>三十個動作</p>}>
					<span>篩選</span>
				</DialogContent>
			</Dialog>,
		)
		const popup = await screen.findByRole("dialog")
		const classes = popup.className.split(" ")
		expect(classes).toContain(atom(probe.fullWidth))
		expect(classes).not.toContain(atom(probe.baseWidth))

		const scroller = screen.getByText("三十個動作").parentElement
		expect(scroller?.parentElement).toBe(popup)
		expect(scroller).not.toContainElement(screen.getByRole("heading", { name: "工具紀錄" }))
		expect(scroller).not.toContainElement(screen.getByText("篩選"))
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

function Opener({
	label = "開啟",
	onOpen,
}: {
	label?: string
	onOpen: (api: ReturnType<typeof useDialog>["dialog"]) => void
}) {
	const { dialog } = useDialog()
	return <Button onClick={() => onOpen(dialog)}>{label}</Button>
}

function RenameForm({ close }: { close: (result?: string) => void }) {
	return (
		<DialogContent title="重新命名">
			<DialogActions>
				<DialogClose>
					<Button variant="ghost">取消</Button>
				</DialogClose>
				<Button onClick={() => close("新名稱")}>儲存</Button>
			</DialogActions>
		</DialogContent>
	)
}

describe("dialog store", () => {
	afterEach(() => act(() => dialogManager.closeAll()))

	test("open renders through <Dialogs /> and resolves with the close result", async () => {
		let handle: DialogHandle<string> | undefined
		render(
			<Dialogs>
				<Opener
					onOpen={(dialog) => (handle = dialog.open<string>(({ close }) => <RenameForm close={close} />))}
				/>
			</Dialogs>,
		)
		const opener = screen.getByRole("button", { name: "開啟" })
		await userEvent.click(opener)
		expect(await screen.findByRole("dialog", { name: "重新命名" })).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "儲存" }))
		await expect(handle?.result).resolves.toBe("新名稱")
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
		await waitFor(() => expect(opener).toHaveFocus())
	})

	test("Escape, a DialogClose button and handle.close resolve undefined unless given a result", async () => {
		render(<Dialogs />)
		let handle: DialogHandle<string> | undefined
		act(() => void (handle = dialogManager.open<string>(({ close }) => <RenameForm close={close} />)))
		await screen.findByRole("dialog")
		await userEvent.keyboard("{Escape}")
		await expect(handle?.result).resolves.toBeUndefined()

		act(() => void (handle = dialogManager.open<string>(({ close }) => <RenameForm close={close} />)))
		await userEvent.click(await screen.findByRole("button", { name: "取消" }))
		await expect(handle?.result).resolves.toBeUndefined()

		act(() => void (handle = dialogManager.open<string>(({ close }) => <RenameForm close={close} />)))
		await screen.findByRole("dialog")
		act(() => handle?.close("外部"))
		await expect(handle?.result).resolves.toBe("外部")
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
	})

	test("confirm resolves true from the confirm button, false from cancel and Escape", async () => {
		render(<Dialogs />)
		let answer: Promise<boolean> = Promise.resolve(false)

		act(
			() =>
				void (answer = dialogManager.confirm({
					title: "刪除這則記憶?",
					confirmLabel: "刪除",
					tone: "danger",
				})),
		)
		await screen.findByRole("alertdialog", { name: "刪除這則記憶?" })
		await waitFor(() => expect(screen.getByRole("button", { name: "取消" })).toHaveFocus())
		await userEvent.click(screen.getByRole("button", { name: "刪除" }))
		await expect(answer).resolves.toBe(true)

		act(() => void (answer = dialogManager.confirm({ title: "封存 thread?" })))
		await userEvent.click(await screen.findByRole("button", { name: "取消" }))
		await expect(answer).resolves.toBe(false)

		act(() => void (answer = dialogManager.confirm({ title: "封存 thread?" })))
		await screen.findByRole("alertdialog")
		await userEvent.keyboard("{Escape}")
		await expect(answer).resolves.toBe(false)
		await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
	})

	test("alert has one button and resolves when it is pressed", async () => {
		render(<Dialogs />)
		let done: Promise<void> = Promise.resolve()
		act(() => void (done = dialogManager.alert({ title: "已達上限", description: "先封存幾個 thread。" })))
		const alert = await screen.findByRole("alertdialog", { name: "已達上限" })
		expect(alert.querySelectorAll("button")).toHaveLength(1)
		await userEvent.click(screen.getByRole("button", { name: "知道了" }))
		await expect(done).resolves.toBeUndefined()
	})

	test("a dialog opened from inside another stacks on top; Escape closes only the top one", async () => {
		let inner: Promise<boolean> = Promise.resolve(true)
		render(<Dialogs />)
		act(
			() =>
				void dialogManager.open(() => (
					<DialogContent title="設定">
						<Opener
							label="刪除工作區"
							onOpen={(dialog) => (inner = dialog.confirm({ title: "真的要刪除?" }))}
						/>
					</DialogContent>
				)),
		)
		await userEvent.click(await screen.findByRole("button", { name: "刪除工作區" }))
		const top = await screen.findByRole("alertdialog", { name: "真的要刪除?" })
		await waitFor(() => expect(top.contains(document.activeElement)).toBe(true))
		expect(dialogManager.getSnapshot()).toHaveLength(2)

		await userEvent.keyboard("{Escape}")
		await expect(inner).resolves.toBe(false)
		await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
		expect(screen.getByRole("dialog", { name: "設定" })).toBeInTheDocument()
		expect(dialogManager.getSnapshot()).toHaveLength(1)
	})

	test("closing a dialog closes the ones stacked on it; closeAll settles every one", async () => {
		render(<Dialogs />)
		let bottom: DialogHandle | undefined
		let answer: Promise<boolean> = Promise.resolve(true)
		act(() => {
			bottom = dialogManager.open(() => <DialogContent title="底下" />)
			answer = dialogManager.confirm({ title: "上面" })
		})
		await screen.findByRole("alertdialog")
		act(() => bottom?.close())
		await expect(answer).resolves.toBe(false)
		await expect(bottom?.result).resolves.toBeUndefined()

		act(() => {
			dialogManager.open(() => <DialogContent title="一" />)
			answer = dialogManager.confirm({ title: "二" })
		})
		await screen.findByRole("alertdialog")
		act(() => dialogManager.closeAll())
		await expect(answer).resolves.toBe(false)
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
	})

	test("a scoped manager renders in its own host and useDialog reaches it", async () => {
		const scoped = createDialogManager()
		render(
			<>
				<Dialogs />
				<Dialogs manager={scoped}>
					<Opener onOpen={(dialog) => dialog.open(() => <DialogContent title="只在這裡" />)} />
				</Dialogs>
			</>,
		)
		await userEvent.click(screen.getByRole("button", { name: "開啟" }))
		expect(await screen.findByRole("dialog", { name: "只在這裡" })).toBeInTheDocument()
		expect(scoped.getSnapshot()).toHaveLength(1)
		expect(dialogManager.getSnapshot()).toHaveLength(0)
		expect(screen.getAllByRole("dialog")).toHaveLength(1)
		act(() => scoped.closeAll())
	})
})
