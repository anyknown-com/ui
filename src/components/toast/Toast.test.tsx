import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Button } from "../button/Button"
import { Toaster, useToast } from "./Toast"

function Harness({ onUndo }: { onUndo?: () => void }) {
	const { toast } = useToast()
	return (
		<>
			<Button onClick={() => toast("交接摘要已複製")}>default</Button>
			<Button onClick={() => toast.success("換班完成", { description: "3 則記憶已帶進新 thread" })}>
				success
			</Button>
			<Button onClick={() => toast.danger("無法連到 vault", { description: "稍後會自動重試" })}>danger</Button>
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

	test("the viewport is a live region", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "default" }))
		await screen.findByText("交接摘要已複製")
		expect(document.querySelector("[aria-live]")).not.toBeNull()
	})

	test("the action button fires and dismisses the toast", async () => {
		const onUndo = vi.fn()
		render(<Harness onUndo={onUndo} />)
		await userEvent.click(screen.getByRole("button", { name: "with action" }))
		await userEvent.click(await screen.findByRole("button", { name: "復原" }))
		expect(onUndo).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(screen.queryByText("已刪除「偏好 pnpm」")).not.toBeInTheDocument())
	})

	test("a danger toast carries its variant on the root for high-priority announcement", async () => {
		render(<Harness />)
		await userEvent.click(screen.getByRole("button", { name: "danger" }))
		const titles = await screen.findAllByText("無法連到 vault")
		expect(titles.some((el) => el.closest("[data-type='danger']") != null)).toBe(true)
		// high-priority toasts are mirrored into a live region for urgent announcement
		expect(titles.length).toBeGreaterThan(1)
	})
})
