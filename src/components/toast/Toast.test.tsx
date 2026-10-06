import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
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

// 預設 manager 是 module 層級的,測試之間要清乾淨
afterEach(() => {
	act(() => {
		for (const item of toastManager.getSnapshot().toasts) toastManager.close(item.id)
	})
})

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
		await waitFor(() => expect(screen.queryByText("已刪除「偏好 pnpm」")).not.toBeInTheDocument())
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
		expect(screen.queryByText("交接摘要已複製")).not.toBeInTheDocument()
	})
})

describe("Toast regressions", () => {
	test("the countdown line pauses when the viewport is hovered", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "default" }))
		await screen.findByText("交接摘要已複製")
		const line = document.querySelector("path[pathLength]") as SVGPathElement
		expect(line.getAttribute("style")).toContain("running")
		await userEvent.hover(viewport())
		await waitFor(() => expect(line.getAttribute("style")).toContain("paused"))
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
		expect(screen.queryByText("已複製")).not.toBeInTheDocument()
	})

	test("a per-toast timeout wins; 0 never times out", () => {
		const manager = setup({ timeout: 3000 })
		act(() => {
			manager.add({ title: "短", timeout: 1000 })
			manager.add({ title: "常駐", timeout: 0 })
		})
		act(() => vi.advanceTimersByTime(1000))
		expect(screen.queryByText("短")).not.toBeInTheDocument()
		act(() => vi.advanceTimersByTime(60_000))
		expect(screen.getByText("常駐")).toBeInTheDocument()
	})

	test("update patches the toast in place and restarts its timer", () => {
		const manager = setup({ timeout: 3000 })
		let id = ""
		act(() => void (id = manager.add({ title: "上傳中" })))
		act(() => vi.advanceTimersByTime(2000))
		act(() => manager.update(id, { title: "已上傳", type: "success", description: "3 個檔案" }))
		expect(screen.queryByText("上傳中")).not.toBeInTheDocument()
		expect(screen.getByText("已上傳")).toBeInTheDocument()
		expect(screen.getByText("3 個檔案")).toBeInTheDocument()
		expect(screen.getByRole("status")).toHaveAttribute("data-type", "success")
		act(() => vi.advanceTimersByTime(2000))
		expect(screen.getByText("已上傳")).toBeInTheDocument()
		act(() => vi.advanceTimersByTime(1000))
		expect(screen.queryByText("已上傳")).not.toBeInTheDocument()
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
		expect(screen.queryByText("已儲存 3 筆")).not.toBeInTheDocument()
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
		expect(screen.queryByText("已複製")).not.toBeInTheDocument()
	})

	test("limit drops the oldest toast", () => {
		const manager = setup({ limit: 2 })
		act(() => {
			manager.add({ title: "一" })
			manager.add({ title: "二" })
			manager.add({ title: "三" })
		})
		expect(screen.queryByText("一")).not.toBeInTheDocument()
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
		expect(screen.queryByText("已複製")).not.toBeInTheDocument()
	})

	test("focus within the viewport pauses the timer", () => {
		const manager = setup({ timeout: 3000 })
		act(() => void manager.add({ title: "已複製" }))
		act(() => screen.getByRole("button", { name: "關閉通知" }).focus())
		act(() => vi.advanceTimersByTime(10_000))
		expect(screen.getByText("已複製")).toBeInTheDocument()
		act(() => screen.getByRole("button", { name: "關閉通知" }).blur())
		act(() => vi.advanceTimersByTime(3000))
		expect(screen.queryByText("已複製")).not.toBeInTheDocument()
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
		expect(screen.queryByText("已複製")).not.toBeInTheDocument()
		hidden.mockRestore()
	})

	test("a scoped manager only reaches its own viewport", () => {
		const manager = setup()
		act(() => void manager.add({ title: "只在這裡" }))
		expect(toastManager.getSnapshot().toasts).toHaveLength(0)
		expect(viewport()).toHaveTextContent("只在這裡")
	})
})
