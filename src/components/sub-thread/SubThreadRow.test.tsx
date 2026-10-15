import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { type SubThreadStatus, SubThreadRow } from "./SubThreadRow"

const noop = () => {}

const statusOf = (status: SubThreadStatus) =>
	render(<SubThreadRow title="查重試事件" status={status} onOpenRun={noop} />).container.querySelector(
		"button > span:nth-child(2)",
	)

describe("SubThreadRow", () => {
	test.each<[SubThreadStatus, string]>([
		["queued", "進行中"],
		["running", "進行中"],
		["waiting", "暫停"],
		["blocked", "卡住了"],
		["done", "完成"],
		["failed", "失敗了"],
		["cancelled", "取消了"],
	])("說 %s 的 run 是 %s", (status, label) => {
		expect(statusOf(status)?.textContent).toBe(label)
	})

	test("tells a stuck, a failed and a cancelled run apart by colour", () => {
		const colours = new Set(
			[statusOf("waiting"), statusOf("failed"), statusOf("cancelled")].map((s) => s?.className),
		)
		expect(colours.size).toBe(3)
		expect(statusOf("blocked")?.className).toBe(statusOf("waiting")?.className)
	})

	test("reads English under an en LocaleProvider", () => {
		render(
			<LocaleProvider locale="en">
				<SubThreadRow title="Find retries" status="blocked" onOpenRun={noop} />
			</LocaleProvider>,
		)
		expect(screen.getByRole("button", { name: /Find retries/ })).toHaveTextContent("Stuck")
	})

	test("整顆 pill 打開 run", async () => {
		const onOpenRun = vi.fn()
		render(<SubThreadRow title="查重試事件" status="running" onOpenRun={onOpenRun} />)
		await userEvent.click(screen.getByRole("button", { name: /查重試事件/ }))
		expect(onOpenRun).toHaveBeenCalledOnce()
	})

	test("run 還沒結束才畫內容", () => {
		const { rerender } = render(
			<SubThreadRow title="查重試事件" status="waiting" onOpenRun={noop}>
				正在讀 retry.ts
			</SubThreadRow>,
		)
		expect(screen.getByText("正在讀 retry.ts")).toBeInTheDocument()
		rerender(
			<SubThreadRow title="查重試事件" status="done" onOpenRun={noop}>
				正在讀 retry.ts
			</SubThreadRow>,
		)
		expect(screen.queryByText("正在讀 retry.ts")).toBeNull()
	})

	test("has no axe violations in every status", async () => {
		const { container } = render(
			<>
				{(["running", "waiting", "blocked", "done", "failed", "cancelled"] as const).map((status) => (
					<SubThreadRow key={status} title="查重試事件" status={status} onOpenRun={noop}>
						內容
					</SubThreadRow>
				))}
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
