import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Detail, ListScroll, MoreRow, Table, TableHead, Tr } from "./Table"
import { Break, StatusCell, Subject, TableCell, Toggle } from "./TableCells"

const COLUMNS = "minmax(0, 1fr) 6rem 2rem"

function Ledger() {
	const [open, setOpen] = useState(false)
	return (
		<Table>
			<TableHead columns={COLUMNS} sticky>
				<span>key</span>
				<span>次數</span>
				<span />
			</TableHead>
			<Tr columns={COLUMNS} hover>
				<TableCell mono>stripe.key</TableCell>
				<TableCell num>12</TableCell>
				<Toggle open={open} onOpenChange={setOpen} label="stripe.key 的細節" controls="detail-1" />
			</Tr>
			{open && <Detail id="detail-1">上次用在 9/1。</Detail>}
		</Table>
	)
}

describe("Table", () => {
	test("rows lay out on the head's column template", () => {
		const { container } = render(<Ledger />)
		const [head, row] = [...(container.firstElementChild?.children ?? [])] as HTMLElement[]
		// StyleX writes a dynamic style as an inline custom property
		expect(head.getAttribute("style")).toContain(COLUMNS)
		expect(row.getAttribute("style")).toContain(COLUMNS)
	})

	test("a mono cell keeps its full text on hover", () => {
		render(<TableCell mono>sentry.token.long</TableCell>)
		expect(screen.getByText("sentry.token.long")).toHaveAttribute("title", "sentry.token.long")
	})

	test("Toggle opens the detail through onOpenChange, with aria-expanded and aria-controls", async () => {
		render(<Ledger />)
		const toggle = screen.getByRole("button", { name: "stripe.key 的細節" })
		expect(toggle).toHaveAttribute("aria-expanded", "false")
		expect(toggle).toHaveAttribute("aria-controls", "detail-1")
		await userEvent.click(toggle)
		expect(toggle).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText("上次用在 9/1。")).toHaveAttribute("id", "detail-1")
		await userEvent.click(toggle)
		expect(screen.queryByText("上次用在 9/1。")).toBeNull()
	})

	test("Toggle still calls onPress", () => {
		const onPress = vi.fn()
		render(<Toggle open onPress={onPress} label="收起" />)
		fireEvent.click(screen.getByRole("button", { name: "收起" }))
		expect(onPress).toHaveBeenCalledOnce()
	})

	test("Subject is a button named by its text, with the full text on hover", () => {
		const onPress = vi.fn()
		render(<Subject onPress={onPress}>workspace/anyknown</Subject>)
		const subject = screen.getByRole("button", { name: "workspace/anyknown" })
		expect(subject).toHaveAttribute("title", "workspace/anyknown")
		fireEvent.click(subject)
		expect(onPress).toHaveBeenCalledOnce()
	})

	test("StatusCell draws a hidden warning dot only when warn", () => {
		const { container } = render(
			<>
				<StatusCell>ok</StatusCell>
				<StatusCell warn>E401</StatusCell>
			</>,
		)
		expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(1)
		expect(screen.getByText("E401")).toBeInTheDocument()
	})

	test("Break is hidden from screen readers", () => {
		const { container } = render(<Break order={2} />)
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
	})

	test("MoreRow is a button that asks for more", () => {
		const onPress = vi.fn()
		render(<MoreRow onPress={onPress}>再 20 筆</MoreRow>)
		fireEvent.click(screen.getByRole("button", { name: "再 20 筆" }))
		expect(onPress).toHaveBeenCalledOnce()
	})

	test("ListScroll measures where it starts and stops listening when it goes", () => {
		const remove = vi.spyOn(window, "removeEventListener")
		const { container, unmount } = render(
			<ListScroll>
				<Ledger />
			</ListScroll>,
		)
		const scroll = container.firstElementChild as HTMLElement
		expect(scroll.style.getPropertyValue("--akn-off")).toBe("24px")
		unmount()
		expect(remove).toHaveBeenCalledWith("resize", expect.any(Function))
	})
})

test("axe: a ledger with an open detail, a subject and a status", async () => {
	const { container } = render(
		<>
			<Ledger />
			<Table>
				<Tr columns={COLUMNS}>
					<Subject onPress={() => {}}>workspace/anyknown</Subject>
					<StatusCell warn>E401</StatusCell>
					<TableCell faint>9/1</TableCell>
				</Tr>
				<MoreRow onPress={() => {}}>再 20 筆</MoreRow>
			</Table>
		</>,
	)
	await userEvent.click(screen.getByRole("button", { name: "stripe.key 的細節" }))
	await expectNoAxeViolations(container)
})
