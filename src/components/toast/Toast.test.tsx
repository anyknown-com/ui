import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { Button } from "../button/Button"
import { createToastManager, Toaster, toast as moduleToast, toastManager, useToast } from "./Toast"

function Harness({ onUndo }: { onUndo?: () => void }) {
	const { toast } = useToast()
	return (
		<>
			<Button onClick={() => toast("交接摘要已複製")}>default</Button>
			<Button onClick={() => toast.success("換班完成", { description: "3 則記憶已帶進新 thread" })}>
				success
			</Button>
			<Button onClick={() => toast.danger("無法連到 vault", { description: "稍後會自動重試" })}>
				danger
			</Button>
			<Button
				onClick={() =>
					toast("已刪除「偏好 pnpm」", { action: { label: "復原", onClick: onUndo ?? (() => {}) } })
				}
			>
				with action
			</Button>
			<Toaster />
		</>
	)
}

// 預設 manager 是 module 層級的,測試之間要清乾淨;關掉的那幾則要等退場跑完才真的拿掉
afterEach(async () => {
	const open = toastManager.getSnapshot().toasts
	if (open.length === 0) return
	act(() => {
		for (const item of open) toastManager.close(item.id)
	})
	await act(() => new Promise((resolve) => setTimeout(resolve, EXIT_MS + 30)))
})

const EXIT_MS = 120

/** 關掉的那則會淡出 120ms 才拆;那段時間它已經 aria-hidden,對使用者來說就是不在了。 */
function shown(text: string) {
	const node = screen.queryByText(text)
	return node != null && node.closest("[aria-hidden='true']") == null
}

function setup(props: { timeout?: number; limit?: number } = {}) {
	const manager = createToastManager()
	render(<Toaster manager={manager} {...props} />)
	return manager
}

function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (error: unknown) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return { promise, resolve, reject }
}

function viewport() {
	return screen.getByRole("region", { name: "通知" })
}

describe("Toast", () => {
	test("adds a toast with its title", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "default" }))
		expect(await screen.findByText("交接摘要已複製")).toBeInTheDocument()
	})

	test("renders a description for the success variant", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "success" }))
		expect(await screen.findByText("換班完成")).toBeInTheDocument()
		expect(screen.getByText("3 則記憶已帶進新 thread")).toBeInTheDocument()
	})

	test("the viewport is a polite live region and each toast is a status", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "default" }))
		await screen.findByText("交接摘要已複製")
		expect(viewport()).toHaveAttribute("aria-live", "polite")
		expect(screen.getByRole("status")).toHaveTextContent("交接摘要已複製")
	})

	test("the action button fires and dismisses the toast", async () => {
		const onUndo = vi.fn()
		render(<Harness onUndo={onUndo} />)
		await userEvent.click(screen.getByRole("button", { name: "with action" }))
		await userEvent.click(await screen.findByRole("button", { name: "復原" }))
		expect(onUndo).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(shown("已刪除「偏好 pnpm」")).toBe(false))
	})

	test("a danger toast is an alert", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "danger" }))
		const alert = await screen.findByRole("alert")
		expect(alert).toHaveTextContent("無法連到 vault")
		expect(alert).toHaveAttribute("data-type", "danger")
	})

	test("the close button has a name and dismisses the toast", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "default" }))
		await userEvent.click(await screen.findByRole("button", { name: "關閉通知" }))
		expect(shown("交接摘要已複製")).toBe(false)
	})
})

describe("Toast keyboard access", () => {
	test("F8 moves focus to the notifications and Escape returns it", async () => {
		render(<Harness />)
		const trigger = screen.getByRole("button", { name: "default" })
		await userEvent.click(trigger)
		await screen.findByText("交接摘要已複製")
		expect(viewport()).toHaveAttribute("aria-keyshortcuts", "F8")
		await userEvent.keyboard("{F8}")
		expect(viewport()).toHaveFocus()
		await userEvent.keyboard("{Escape}")
		expect(trigger).toHaveFocus()
	})

	test("closing the last toast from the keyboard hands focus back", async () => {
		render(<Harness />)
		const trigger = screen.getByRole("button", { name: "default" })
		await userEvent.click(trigger)
		await screen.findByText("交接摘要已複製")
		await userEvent.keyboard("{F8}")
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "關閉通知" })).toHaveFocus()
		await userEvent.keyboard("{Enter}")
		expect(trigger).toHaveFocus()
	})

	test("F8 does nothing while there is nothing to read", async () => {
		render(<Harness />)
		const trigger = screen.getByRole("button", { name: "default" })
		trigger.focus()
		await userEvent.keyboard("{F8}")
		expect(trigger).toHaveFocus()
	})
})

describe("Toast regressions", () => {
	test("the countdown line pauses when the viewport is hovered", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "default" }))
		await screen.findByText("交接摘要已複製")
		const line = document.querySelector("[data-countdown]") as HTMLElement
		expect(line.getAttribute("style")).toContain("running")
		await userEvent.hover(viewport())
		await waitFor(() => expect(line.getAttribute("style")).toContain("paused"))
	})

	test("warning and info are polite statuses that say their type in words", () => {
		const manager = setup()
		act(() => {
			manager.add({ title: "額度快用完了", type: "warning" })
			manager.add({ title: "新版本可用", type: "info" })
		})
		const [info, warning] = screen.getAllByRole("status")
		expect(warning).toHaveAttribute("data-type", "warning")
		expect(warning).toHaveTextContent("注意:額度快用完了")
		expect(info).toHaveAttribute("data-type", "info")
		expect(info).toHaveTextContent("提示:新版本可用")
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
	})

	test("toast.warning and toast.info add typed toasts that time out like the default", () => {
		vi.useFakeTimers()
		try {
			render(<Toaster timeout={3000} />)
			act(() => {
				moduleToast.warning("額度快用完了")
				moduleToast.info("新版本可用")
			})
			expect(screen.getAllByRole("status").map((node) => node.dataset.type)).toEqual(["info", "warning"])
			act(() => vi.advanceTimersByTime(3000))
			expect(shown("額度快用完了")).toBe(false)
			expect(shown("新版本可用")).toBe(false)
			act(() => vi.advanceTimersByTime(EXIT_MS))
		} finally {
			vi.useRealTimers()
		}
	})

	test("a success toast says so in words, not only in colour", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "success" }))
		const title = await screen.findByText("換班完成")
		expect(title.closest("div")).toHaveTextContent("成功:")
	})
})

describe("toast manager", () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	test("a toast closes after its timeout", () => {
		const manager = setup({ timeout: 3000 })
		act(() => void manager.add({ title: "已複製" }))
		act(() => vi.advanceTimersByTime(2999))
		expect(screen.getByText("已複製")).toBeInTheDocument()
		act(() => vi.advanceTimersByTime(1))
		expect(shown("已複製")).toBe(false)
	})

	test("a per-toast timeout wins; 0 never times out", () => {
		const manager = setup({ timeout: 3000 })
		act(() => {
			manager.add({ title: "短", timeout: 1000 })
			manager.add({ title: "常駐", timeout: 0 })
		})
		act(() => vi.advanceTimersByTime(1000))
		expect(shown("短")).toBe(false)
		act(() => vi.advanceTimersByTime(60_000))
		expect(screen.getByText("常駐")).toBeInTheDocument()
	})

	test("a toast with an action waits to be dismissed", () => {
		const manager = setup({ timeout: 3000 })
		act(() => void manager.add({ title: "已刪除", action: { label: "復原", onClick: () => {} } }))
		act(() => vi.advanceTimersByTime(60_000))
		expect(screen.getByText("已刪除")).toBeInTheDocument()
		expect(document.querySelector("[data-countdown]")).toBeNull()
	})

	test("a danger toast waits to be dismissed", () => {
		const manager = setup({ timeout: 3000 })
		act(() => void manager.add({ title: "無法連到 vault", type: "danger" }))
		act(() => vi.advanceTimersByTime(60_000))
		expect(screen.getByRole("alert")).toHaveTextContent("無法連到 vault")
	})

	test("an explicit timeout still counts down an action or danger toast", () => {
		const manager = setup({ timeout: 3000 })
		act(() => {
			manager.add({ title: "已刪除", action: { label: "復原", onClick: () => {} }, timeout: 8000 })
			manager.add({ title: "離線", type: "danger", timeout: 8000 })
		})
		act(() => vi.advanceTimersByTime(8000))
		expect(shown("已刪除")).toBe(false)
		expect(shown("離線")).toBe(false)
	})

	test("update patches the toast in place and restarts its timer", () => {
		const manager = setup({ timeout: 3000 })
		let id = ""
		act(() => void (id = manager.add({ title: "上傳中" })))
		act(() => vi.advanceTimersByTime(2000))
		act(() => manager.update(id, { title: "已上傳", type: "success", description: "3 個檔案" }))
		expect(shown("上傳中")).toBe(false)
		expect(screen.getByText("已上傳")).toBeInTheDocument()
		expect(screen.getByText("3 個檔案")).toBeInTheDocument()
		expect(screen.getByRole("status")).toHaveAttribute("data-type", "success")
		act(() => vi.advanceTimersByTime(2000))
		expect(screen.getByText("已上傳")).toBeInTheDocument()
		act(() => vi.advanceTimersByTime(1000))
		expect(shown("已上傳")).toBe(false)
	})

	test("promise: loading does not time out, then success", async () => {
		const manager = setup({ timeout: 3000 })
		const { promise, resolve } = deferred<number>()
		act(
			() =>
				void manager.promise(promise, { loading: "儲存中", success: (n) => `已儲存 ${n} 筆`, error: "失敗" }),
		)
		act(() => vi.advanceTimersByTime(60_000))
		expect(screen.getByText("儲存中")).toBeInTheDocument()
		expect(document.querySelector("path[pathLength]")).toBeNull()
		await act(async () => resolve(3))
		expect(screen.getByText("已儲存 3 筆")).toBeInTheDocument()
		expect(screen.getByRole("status")).toHaveAttribute("data-type", "success")
		act(() => vi.advanceTimersByTime(3000))
		expect(shown("已儲存 3 筆")).toBe(false)
	})

	test("toast.promise: a rejection becomes a danger toast", async () => {
		render(<Toaster />)
		const { promise, reject } = deferred<void>()
		promise.catch(() => {})
		act(
			() =>
				void moduleToast.promise(promise, {
					loading: "儲存中",
					success: "已儲存",
					error: (e) => `失敗:${(e as Error).message}`,
				}),
		)
		await act(async () => reject(new Error("離線")))
		expect(screen.getByRole("alert")).toHaveTextContent("失敗:離線")
	})

	test("the same key updates in place, restarts the timer, and counts ×N", () => {
		const manager = setup({ timeout: 3000 })
		let first = ""
		let second = ""
		act(() => void (first = manager.add({ title: "已複製", key: "copy" })))
		act(() => vi.advanceTimersByTime(2000))
		act(() => void (second = manager.add({ title: "已複製", key: "copy" })))
		expect(second).toBe(first)
		expect(screen.getAllByRole("status")).toHaveLength(1)
		expect(screen.getByRole("status")).toHaveTextContent("已複製×2")
		act(() => void manager.add({ title: "已複製", key: "copy" }))
		expect(screen.getByRole("status")).toHaveTextContent("已複製×3")
		act(() => vi.advanceTimersByTime(2999))
		expect(screen.getByText("已複製")).toBeInTheDocument()
		act(() => vi.advanceTimersByTime(1))
		expect(shown("已複製")).toBe(false)
	})

	test("limit drops the oldest toast", () => {
		const manager = setup({ limit: 2 })
		act(() => {
			manager.add({ title: "一" })
			manager.add({ title: "二" })
			manager.add({ title: "三" })
		})
		expect(shown("一")).toBe(false)
		expect(screen.getByText("二")).toBeInTheDocument()
		expect(screen.getByText("三")).toBeInTheDocument()
	})

	test("hovering the viewport pauses the timer; leaving resumes the rest", () => {
		const manager = setup({ timeout: 3000 })
		act(() => void manager.add({ title: "已複製" }))
		act(() => vi.advanceTimersByTime(1000))
		fireEvent.mouseEnter(viewport())
		act(() => vi.advanceTimersByTime(10_000))
		expect(screen.getByText("已複製")).toBeInTheDocument()
		fireEvent.mouseLeave(viewport())
		act(() => vi.advanceTimersByTime(1999))
		expect(screen.getByText("已複製")).toBeInTheDocument()
		act(() => vi.advanceTimersByTime(1))
		expect(shown("已複製")).toBe(false)
	})

	test("focus within the viewport pauses the timer", () => {
		const manager = setup({ timeout: 3000 })
		act(() => void manager.add({ title: "已複製" }))
		act(() => screen.getByRole("button", { name: "關閉通知" }).focus())
		act(() => vi.advanceTimersByTime(10_000))
		expect(screen.getByText("已複製")).toBeInTheDocument()
		act(() => screen.getByRole("button", { name: "關閉通知" }).blur())
		act(() => vi.advanceTimersByTime(3000))
		expect(shown("已複製")).toBe(false)
	})

	test("a hidden document pauses the timer", () => {
		const manager = setup({ timeout: 3000 })
		act(() => void manager.add({ title: "已複製" }))
		const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true)
		act(() => void document.dispatchEvent(new Event("visibilitychange")))
		act(() => vi.advanceTimersByTime(10_000))
		expect(screen.getByText("已複製")).toBeInTheDocument()
		hidden.mockReturnValue(false)
		act(() => void document.dispatchEvent(new Event("visibilitychange")))
		act(() => vi.advanceTimersByTime(3000))
		expect(shown("已複製")).toBe(false)
		hidden.mockRestore()
	})

	test("a closed toast leaves the accessibility tree at once and the DOM after its exit", () => {
		const manager = setup({ timeout: 3000 })
		let id = ""
		act(() => void (id = manager.add({ title: "已複製" })))
		act(() => manager.close(id))
		expect(screen.queryByRole("status")).not.toBeInTheDocument()
		expect(screen.getByText("已複製").closest("[aria-hidden='true']")).not.toBeNull()
		act(() => vi.advanceTimersByTime(EXIT_MS))
		expect(screen.queryByText("已複製")).not.toBeInTheDocument()
	})

	test("under reduced motion a closed toast is removed at once", () => {
		const original = window.matchMedia
		window.matchMedia = (query: string) =>
			({
				matches: query.includes("reduce"),
				media: query,
				addEventListener: () => {},
				removeEventListener: () => {},
			}) as unknown as MediaQueryList
		try {
			const manager = setup({ timeout: 3000 })
			let id = ""
			act(() => void (id = manager.add({ title: "已複製" })))
			act(() => manager.close(id))
			expect(screen.queryByText("已複製")).not.toBeInTheDocument()
		} finally {
			window.matchMedia = original
		}
	})

	test("onAutoClose then onClose fire when the timeout runs out", () => {
		const manager = setup({ timeout: 3000 })
		const calls: string[] = []
		act(
			() =>
				void manager.add({
					title: "已複製",
					onAutoClose: () => calls.push("auto"),
					onClose: () => calls.push("close"),
				}),
		)
		act(() => vi.advanceTimersByTime(3000))
		expect(calls).toEqual(["auto", "close"])
		act(() => vi.advanceTimersByTime(EXIT_MS))
		expect(calls).toEqual(["auto", "close"])
	})

	test("onClose fires once for the close button, close(), closeAll() and limit; onAutoClose does not", async () => {
		const manager = setup({ timeout: 3000, limit: 3 })
		const onClose = vi.fn()
		const onAutoClose = vi.fn()
		const add = (title: string) => manager.add({ title, onClose: () => onClose(title), onAutoClose })
		let id = ""
		act(() => {
			add("按鈕")
			id = add("程式")
		})
		act(() => screen.getAllByRole("button", { name: "關閉通知" })[1].click())
		expect(onClose).toHaveBeenLastCalledWith("按鈕")
		act(() => manager.close(id))
		act(() => manager.close(id))
		expect(onClose).toHaveBeenLastCalledWith("程式")
		act(() => {
			add("一")
			add("二")
			add("三")
			add("四")
		})
		expect(onClose).toHaveBeenLastCalledWith("一")
		act(() => manager.closeAll())
		expect(onClose.mock.calls.map(([title]) => title)).toEqual(["按鈕", "程式", "一", "四", "三", "二"])
		expect(onAutoClose).not.toHaveBeenCalled()
		act(() => vi.advanceTimersByTime(EXIT_MS))
		expect(screen.queryAllByRole("status")).toHaveLength(0)
		expect(manager.getSnapshot().toasts).toHaveLength(0)
	})

	test("toast.closeAll closes every toast in the default viewport", () => {
		render(<Toaster />)
		act(() => {
			moduleToast("一")
			moduleToast.danger("二")
		})
		act(() => moduleToast.closeAll())
		expect(screen.queryByRole("status")).not.toBeInTheDocument()
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		act(() => vi.advanceTimersByTime(EXIT_MS))
		expect(toastManager.getSnapshot().toasts).toHaveLength(0)
	})

	test("a scoped manager only reaches its own viewport", () => {
		const manager = setup()
		act(() => void manager.add({ title: "只在這裡" }))
		expect(toastManager.getSnapshot().toasts).toHaveLength(0)
		expect(viewport()).toHaveTextContent("只在這裡")
	})
})

describe("Toaster words", () => {
	test("follow the LocaleProvider, and labels override one of them", () => {
		const manager = createToastManager()
		render(
			<LocaleProvider locale="en">
				<Toaster manager={manager} labels={{ dismiss: "Close" }} />
			</LocaleProvider>,
		)
		act(() => void manager.add({ title: "Upload failed", type: "danger" }))
		const region = screen.getByRole("region", { name: "Notifications" })
		expect(region).toHaveTextContent("Error:")
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
	})
})
