import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Badge, Chip } from "./Badge"

describe("Badge", () => {
	test("renders its text without interactive semantics", () => {
		render(<Badge variant="accent">進行中</Badge>)
		const badge = screen.getByText("進行中")
		expect(badge.tagName).toBe("SPAN")
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	test("renders a count", () => {
		render(
			<Badge variant="accent" count={3}>
				等你 ·{" "}
			</Badge>,
		)
		expect(screen.getByText("3")).toBeInTheDocument()
	})

	test("the status dot is decorative", () => {
		const { container } = render(<Badge dot="accent">Fable 在線</Badge>)
		expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
		expect(screen.getByText("Fable 在線")).toBeInTheDocument()
	})
})

describe("Chip", () => {
	test("the remove control is a button with a specific label", async () => {
		const onRemove = vi.fn()
		render(
			<Chip onRemove={onRemove} removeLabel="移除篩選:工作區 anyknown">
				工作區:anyknown
			</Chip>,
		)
		const remove = screen.getByRole("button", { name: "移除篩選:工作區 anyknown" })
		await userEvent.click(remove)
		expect(onRemove).toHaveBeenCalledTimes(1)
	})

	test("ref reaches the element: the span of a label chip, the button of a pressable one", () => {
		const label = createRef<HTMLSpanElement | HTMLButtonElement>()
		const pressable = createRef<HTMLSpanElement | HTMLButtonElement>()
		render(
			<>
				<Chip ref={label}>Label</Chip>
				<Chip ref={pressable} onClick={() => {}}>
					Press
				</Chip>
			</>,
		)
		expect(label.current?.tagName).toBe("SPAN")
		expect(pressable.current).toBe(screen.getByRole("button", { name: "Press" }))
	})

	test("沒有 onRemove 就不必給 removeLabel", () => {
		render(<Chip>只讀的一枚</Chip>)
		expect(screen.getByText("只讀的一枚")).toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	test("給了 onClick 就是真的按鈕,pressed 進 aria-pressed", async () => {
		const onClick = vi.fn()
		render(
			<Chip onClick={onClick} pressed>
				失敗 2
			</Chip>,
		)
		const chip = screen.getByRole("button", { name: "失敗 2" })
		expect(chip.tagName).toBe("BUTTON")
		expect(chip).toHaveAttribute("aria-pressed", "true")
		await userEvent.click(chip)
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	test("is reachable and activatable by keyboard", async () => {
		const onRemove = vi.fn()
		render(
			<Chip onRemove={onRemove} removeLabel="移除篩選:本週">
				本週
			</Chip>,
		)
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "移除篩選:本週" })).toHaveFocus()
		await userEvent.keyboard("{Enter}")
		expect(onRemove).toHaveBeenCalledTimes(1)
	})

	test("uncontrolled toggle: defaultPressed starts it, presses flip it", async () => {
		const onPressedChange = vi.fn()
		render(
			<Chip defaultPressed onPressedChange={onPressedChange}>
				本週
			</Chip>,
		)
		const chip = screen.getByRole("button", { name: "本週" })
		expect(chip).toHaveAttribute("aria-pressed", "true")
		await userEvent.click(chip)
		expect(chip).toHaveAttribute("aria-pressed", "false")
		expect(onPressedChange).toHaveBeenCalledExactlyOnceWith(false)
	})

	test("controlled toggle: aria-pressed follows pressed only", async () => {
		const onPressedChange = vi.fn()
		render(
			<Chip pressed={false} onPressedChange={onPressedChange}>
				本週
			</Chip>,
		)
		await userEvent.click(screen.getByRole("button"))
		expect(onPressedChange).toHaveBeenCalledWith(true)
		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false")
	})

	test("onClick alone is a plain button, no aria-pressed", () => {
		render(<Chip onClick={() => {}}>篩選</Chip>)
		expect(screen.getByRole("button", { name: "篩選" })).not.toHaveAttribute("aria-pressed")
	})
})

test("axe: every badge variant, a dot, a count, removable, pressable and pressed chips", async () => {
	const { container } = render(
		<>
			<Badge>neutral</Badge>
			<Badge variant="accent" dot="accent">
				accent
			</Badge>
			<Badge variant="success">success</Badge>
			<Badge variant="danger" dot="danger">
				danger
			</Badge>
			<Badge variant="outline" count={3}>
				outline
			</Badge>
			<Badge variant="mono">mono</Badge>
			<Chip onRemove={() => {}} removeLabel="移除">
				可移除
			</Chip>
			<Chip onClick={() => {}}>可按</Chip>
			<Chip defaultPressed>按下</Chip>
		</>,
	)
	await expectNoAxeViolations(container)
})
