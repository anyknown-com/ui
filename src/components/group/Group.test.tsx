import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Acts, Empty, Expand, Group, GroupItem, GroupRow, Mark, Note, Status, Tag } from "./Group"

describe("Group", () => {
	test("header 在卡片上面、footer 在下面", () => {
		const { container } = render(
			<Group header="交接" footer="context 用到 60% 時交接。">
				<p>模型</p>
			</Group>,
		)
		const parts = [...(container.firstElementChild?.children ?? [])].map((child) => child.textContent)
		expect(parts).toEqual(["交接", "模型", "context 用到 60% 時交接。"])
	})

	test("沒給 header / footer 就只有卡片", () => {
		const { container } = render(
			<Group>
				<p>模型</p>
			</Group>,
		)
		expect(container.firstElementChild?.children).toHaveLength(1)
		expect(screen.getByText("模型")).toBeInTheDocument()
	})
})

function dotOf(text: string) {
	return screen.getByText(text).parentElement?.querySelector("[aria-hidden='true']")
}

describe("Status", () => {
	test("沒給 dot 就只有字", () => {
		render(<Status>連上了</Status>)
		expect(dotOf("連上了")).toBeNull()
	})

	test("實心、空心、虛線三種點", () => {
		render(
			<>
				<Status dot="filled" tone="success">
					還對
				</Status>
				<Status dot="hollow">待確認</Status>
				<Status dot="dashed" tone="danger">
					過期
				</Status>
			</>,
		)
		expect(dotOf("還對")).toHaveStyle({ borderStyle: "none" })
		expect(dotOf("待確認")).toHaveStyle({ borderStyle: "solid", borderWidth: "1.5px" })
		expect(dotOf("過期")).toHaveStyle({ borderStyle: "dashed" })
	})

	test("warn 是實心的 warning 點", () => {
		render(<Status warn>要處理</Status>)
		expect(dotOf("要處理")).not.toBeNull()
		expect(dotOf("要處理")).toHaveStyle({ borderStyle: "none" })
	})
})

describe("GroupItem disclosure", () => {
	test("uncontrolled: a row with expands toggles the item's Expand", async () => {
		const onOpenChange = vi.fn()
		render(
			<Group>
				<GroupItem onOpenChange={onOpenChange}>
					<GroupRow name="Notion" expands />
					<Expand>
						<Note>連線設定</Note>
					</Expand>
				</GroupItem>
			</Group>,
		)
		const row = screen.getByRole("button", { name: "Notion" })
		expect(row).toHaveAttribute("aria-expanded", "false")
		expect(screen.queryByText("連線設定")).toBeNull()

		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "true")
		expect(document.getElementById(row.getAttribute("aria-controls") ?? "")).toContainElement(
			screen.getByText("連線設定"),
		)
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true)

		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "false")
		expect(onOpenChange).toHaveBeenLastCalledWith(false)
	})

	test("defaultOpen starts it open", () => {
		render(
			<GroupItem defaultOpen>
				<GroupRow name="Notion" expands />
				<Expand>
					<Note>連線設定</Note>
				</Expand>
			</GroupItem>,
		)
		expect(screen.getByRole("button", { name: "Notion" })).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText("連線設定")).toBeInTheDocument()
	})

	test("controlled: open follows the parent, the row only asks", async () => {
		const onOpenChange = vi.fn()
		render(
			<GroupItem open={false} onOpenChange={onOpenChange}>
				<GroupRow name="Notion" expands />
				<Expand>
					<Note>連線設定</Note>
				</Expand>
			</GroupItem>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Notion" }))
		expect(onOpenChange).toHaveBeenCalledWith(true)
		expect(screen.queryByText("連線設定")).toBeNull()
	})

	test("Expand's own open still wins, and onPress runs next to the toggle", async () => {
		const onPress = vi.fn()
		render(
			<GroupItem>
				<GroupRow name="Notion" expands onPress={onPress} />
				<Expand open>
					<Note>一直開著</Note>
				</Expand>
			</GroupItem>,
		)
		expect(screen.getByText("一直開著")).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Notion" }))
		expect(onPress).toHaveBeenCalledOnce()
	})

	test("outside a GroupItem an Expand without open stays shut", () => {
		render(
			<Expand>
				<Note>看不到</Note>
			</Expand>,
		)
		expect(screen.queryByText("看不到")).toBeNull()
	})

	test("axe: open and shut items, a row with status and actions", async () => {
		const { container } = render(
			<Group header="連線" footer="連上的服務會出現在這裡。">
				<GroupItem defaultOpen>
					<GroupRow name="Notion" expands mark={<Mark letter="N" tint="black 20%" />}>
						<Status dot="filled" tone="success">
							連上了
						</Status>
					</GroupRow>
					<Expand>
						<Note err>權杖過期了。</Note>
						<Acts>
							<button type="button">重新連線</button>
						</Acts>
					</Expand>
				</GroupItem>
				<GroupItem>
					<GroupRow name="Linear" expands actions={<Tag>v2</Tag>} />
					<Expand>
						<Note>設定</Note>
					</Expand>
				</GroupItem>
				<Empty>還沒有別的。</Empty>
			</Group>,
		)
		await expectNoAxeViolations(container)
	})
})
