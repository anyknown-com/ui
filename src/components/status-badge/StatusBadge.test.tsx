import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { StatusBadge } from "./StatusBadge"

describe("StatusBadge", () => {
	test("live 帶一顆呼吸點,讀屏只唸一次", () => {
		render(<StatusBadge tone="live">AI 操作中</StatusBadge>)
		expect(screen.getByRole("status")).toHaveTextContent("AI 操作中")
		expect(screen.getAllByText("AI 操作中")).toHaveLength(2)
	})

	test("warn 與 plain 沒有點,也不是 live region", () => {
		render(
			<>
				<StatusBadge tone="warn">需要處理</StatusBadge>
				<StatusBadge tone="plain">做完了</StatusBadge>
			</>,
		)
		expect(screen.queryByRole("status")).toBeNull()
		expect(screen.getByText("需要處理")).toBeInTheDocument()
	})
})

test("axe: live, warn and plain", async () => {
	const { container } = render(
		<p>
			<StatusBadge tone="live">執行中</StatusBadge>
			<StatusBadge tone="warn">需要處理</StatusBadge>
			<StatusBadge tone="plain">結束</StatusBadge>
		</p>,
	)
	await expectNoAxeViolations(container)
})
