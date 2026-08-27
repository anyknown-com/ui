import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { Button } from "../button/Button"
import { KbdGroup } from "../kbd/Kbd"
import { Tooltip } from "./Tooltip"

describe("Tooltip", () => {
	test("renders only the trigger until hovered", () => {
		render(
			<Tooltip content="產生交接摘要">
				<Button>開始換班</Button>
			</Tooltip>,
		)
		expect(screen.getByRole("button", { name: "開始換班" })).toBeInTheDocument()
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
	})

	test("shows on hover and describes the trigger", async () => {
		render(
			<Tooltip content="產生交接摘要" delay={0}>
				<Button>開始換班</Button>
			</Tooltip>,
		)
		await userEvent.hover(screen.getByRole("button", { name: "開始換班" }))
		const tip = await screen.findByRole("tooltip")
		expect(tip).toHaveTextContent("產生交接摘要")
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "開始換班" })).toHaveAccessibleDescription("產生交接摘要"),
		)
	})

	test("shows on keyboard focus and hides on Escape", async () => {
		render(
			<Tooltip content="封存 thread" delay={0}>
				<Button>封存</Button>
			</Tooltip>,
		)
		await userEvent.tab()
		expect(await screen.findByRole("tooltip")).toBeInTheDocument()
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument())
	})

	test("renders a shortcut alongside the content", async () => {
		render(
			<Tooltip content="產生交接摘要" delay={0} shortcut={<KbdGroup keys={["⌘", "⇧", "H"]} />}>
				<Button>開始換班</Button>
			</Tooltip>,
		)
		await userEvent.hover(screen.getByRole("button", { name: "開始換班" }))
		const tip = await screen.findByRole("tooltip")
		expect(tip).toHaveTextContent("⌘")
		expect(tip.querySelectorAll("kbd")).toHaveLength(3)
	})

	test("disabled renders the trigger untouched", () => {
		render(
			<Tooltip content="不顯示" disabled>
				<Button>單獨按鈕</Button>
			</Tooltip>,
		)
		expect(screen.getByRole("button", { name: "單獨按鈕" })).toBeInTheDocument()
	})
})
