import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { type DecisionBlock, DecisionCard, PermissionCard } from "./InteractionCard"

const BLOCKS: DecisionBlock[] = [
	{
		kind: "options",
		id: "variant",
		required: true,
		options: [
			{ value: "three", label: "三檔方案", description: "Free / Pro / Team", recommended: true },
			{ value: "single", label: "單一價", description: "先驗證願付" },
		],
	},
	{ kind: "text", id: "note", label: "補充", placeholder: "想補充什麼…" },
]

describe("PermissionCard", () => {
	test("shows the subject and three replies", () => {
		render(<PermissionCard verb="執行指令" subject="pnpm publish --access public" />)
		expect(screen.getByText("pnpm publish --access public")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: /允許一次/ })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: /總是允許/ })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: /拒絕/ })).toBeInTheDocument()
	})

	test("each reply reports its own shape", async () => {
		const onReply = vi.fn()
		render(<PermissionCard verb="執行指令" subject="pnpm publish" scope="這個指令" onReply={onReply} />)
		await userEvent.click(screen.getByRole("button", { name: /允許一次/ }))
		expect(onReply).toHaveBeenLastCalledWith("once")
		await userEvent.click(screen.getByRole("button", { name: /總是允許/ }))
		expect(onReply).toHaveBeenLastCalledWith({ always: "這個指令" })
		await userEvent.click(screen.getByRole("button", { name: /拒絕/ }))
		expect(onReply).toHaveBeenLastCalledWith({ reject: true })
	})

	test("keyboard shortcuts work while the card has focus", async () => {
		const onReply = vi.fn()
		render(<PermissionCard verb="執行指令" subject="pnpm publish" onReply={onReply} />)
		screen.getByRole("button", { name: /允許一次/ }).focus()
		await userEvent.keyboard("{Escape}")
		expect(onReply).toHaveBeenLastCalledWith({ reject: true })
		await userEvent.keyboard("{Meta>}{Enter}{/Meta}")
		expect(onReply).toHaveBeenLastCalledWith({ always: "這個指令" })
	})

	test("resolved collapses to an unchangeable receipt announced politely", () => {
		render(<PermissionCard verb="執行指令" subject="pnpm publish" resolved={{ text: "已允許一次" }} />)
		const receipt = document.querySelector("[aria-live='polite']")
		expect(receipt).toHaveTextContent("已允許一次")
		expect(receipt).toHaveTextContent("pnpm publish")
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})
})

describe("DecisionCard", () => {
	test("submit is disabled until every required block is answered", async () => {
		render(<DecisionCard title="先出哪一版?" blocks={BLOCKS} blocking />)
		const submit = screen.getByRole("button", { name: "送出決定" })
		expect(submit).toBeDisabled()
		await userEvent.click(screen.getByRole("radio", { name: /三檔方案/ }))
		expect(submit).toBeEnabled()
	})

	test("options are native radios inside labels", () => {
		render(<DecisionCard title="先出哪一版?" blocks={BLOCKS} />)
		expect(screen.getAllByRole("radio")).toHaveLength(2)
		expect(screen.getByRole("radio", { name: /三檔方案/ })).toBeInTheDocument()
	})

	test("multi-select blocks use checkboxes", async () => {
		const onAnswer = vi.fn()
		render(
			<DecisionCard
				title="帶哪些記憶?"
				blocks={[
					{
						kind: "options",
						id: "memories",
						multiple: true,
						required: true,
						options: [
							{ value: "pnpm", label: "偏好 pnpm" },
							{ value: "cf", label: "部署走 Cloudflare" },
						],
					},
				]}
				onAnswer={onAnswer}
			/>,
		)
		await userEvent.click(screen.getByRole("checkbox", { name: "偏好 pnpm" }))
		await userEvent.click(screen.getByRole("checkbox", { name: "部署走 Cloudflare" }))
		await userEvent.click(screen.getByRole("button", { name: "送出決定" }))
		expect(onAnswer).toHaveBeenCalledWith({ memories: ["pnpm", "cf"] })
	})

	test("「照建議」submits the recommended option directly", async () => {
		const onAnswer = vi.fn()
		render(<DecisionCard title="先出哪一版?" blocks={BLOCKS} onAnswer={onAnswer} />)
		await userEvent.click(screen.getByRole("button", { name: "照建議" }))
		expect(onAnswer).toHaveBeenCalledWith({ variant: "three" })
	})

	test("collects free text alongside the chosen option", async () => {
		const onAnswer = vi.fn()
		render(<DecisionCard title="先出哪一版?" blocks={BLOCKS} onAnswer={onAnswer} />)
		await userEvent.click(screen.getByRole("radio", { name: /單一價/ }))
		await userEvent.type(screen.getByRole("textbox", { name: "補充" }), "先看轉換")
		await userEvent.click(screen.getByRole("button", { name: "送出決定" }))
		expect(onAnswer).toHaveBeenCalledWith({ variant: "single", note: "先看轉換" })
	})

	test("non-blocking shows the deadline instead of a blocking state", () => {
		render(<DecisionCard title="要發嗎?" blocks={BLOCKS} deadlineLabel="等你 · 2h 後照建議" />)
		expect(screen.getByText("等你 · 2h 後照建議")).toBeInTheDocument()
	})

	test("resolved collapses to a receipt", () => {
		render(
			<DecisionCard title="先出哪一版?" blocks={BLOCKS} resolved={{ text: "已決定 · 你選了三檔方案" }} />,
		)
		expect(screen.getByText("已決定 · 你選了三檔方案")).toBeInTheDocument()
		expect(screen.queryByRole("radio")).not.toBeInTheDocument()
	})
})

describe("PermissionCard regressions", () => {
	test("Enter activates the focused button rather than always allowing once", async () => {
		const onReply = vi.fn()
		render(<PermissionCard verb="執行指令" subject="pnpm publish" onReply={onReply} />)
		screen.getByRole("button", { name: /拒絕/ }).focus()
		await userEvent.keyboard("{Enter}")
		expect(onReply).toHaveBeenCalledTimes(1)
		expect(onReply).toHaveBeenLastCalledWith({ reject: true })
	})

	test("shortcut glyphs stay out of the accessible name", () => {
		render(<PermissionCard verb="執行指令" subject="pnpm publish" />)
		expect(screen.getByRole("button", { name: "允許一次" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "拒絕" })).toHaveAttribute("aria-keyshortcuts", "Escape")
	})

	test("the receipt region exists before it is filled, so the change is announced", () => {
		const { rerender } = render(<PermissionCard verb="執行指令" subject="pnpm publish" />)
		const region = document.querySelector("[aria-live='polite']")
		expect(region).not.toBeNull()
		rerender(<PermissionCard verb="執行指令" subject="pnpm publish" resolved={{ text: "已允許一次" }} />)
		expect(document.querySelector("[aria-live='polite']")).toHaveTextContent("已允許一次")
	})
})

describe("DecisionCard regressions", () => {
	test("an unlabelled options block still names its group", () => {
		render(<DecisionCard title="先出哪一版?" blocks={BLOCKS} />)
		expect(screen.getByRole("group", { name: "先出哪一版?" })).toHaveAttribute("aria-required", "true")
	})
})

describe("DecisionCard 照建議", () => {
	test("merges the recommendation into what the user already typed", async () => {
		const onAnswer = vi.fn()
		render(<DecisionCard title="先出哪一版?" blocks={BLOCKS} onAnswer={onAnswer} />)
		await userEvent.type(screen.getByRole("textbox", { name: "補充" }), "先看轉換")
		await userEvent.click(screen.getByRole("button", { name: "照建議" }))
		expect(onAnswer).toHaveBeenCalledWith({ variant: "three", note: "先看轉換" })
	})

	test("keeps the array shape for a multi-select block", async () => {
		const onAnswer = vi.fn()
		render(
			<DecisionCard
				title="帶哪些記憶?"
				blocks={[
					{
						kind: "options",
						id: "memories",
						multiple: true,
						options: [
							{ value: "pnpm", label: "偏好 pnpm", recommended: true },
							{ value: "cf", label: "部署走 Cloudflare", recommended: true },
						],
					},
				]}
				onAnswer={onAnswer}
			/>,
		)
		await userEvent.click(screen.getByRole("button", { name: "照建議" }))
		expect(onAnswer).toHaveBeenCalledWith({ memories: ["pnpm", "cf"] })
	})

	test("stays disabled while a required block the recommendation does not cover is empty", () => {
		render(
			<DecisionCard
				title="先出哪一版?"
				blocks={[...BLOCKS, { kind: "text", id: "why", label: "理由", required: true }]}
			/>,
		)
		expect(screen.getByRole("button", { name: "照建議" })).toBeDisabled()
	})
})
