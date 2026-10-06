import { act, render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { Button } from "../components/button/Button"
import { Checkbox } from "../components/checkbox/Checkbox"
import { Dialog, DialogContent } from "../components/dialog/Dialog"
import { Input } from "../components/input/Input"
import { Field } from "../components/label/Field"
import { Switch } from "../components/switch/Switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "../components/tabs/Tabs"
import { Toaster, createToastManager } from "../components/toast/Toast"
import { axeViolations, expectNoAxeViolations } from "./axe"

// A sweep, not a spec: render one representative state of each component and let axe look
// for structural problems (names, roles, ARIA attributes, label wiring). Contrast and target
// size are out of reach in jsdom; see ./axe.ts.
describe("axe sweep", () => {
	test("the helper does catch a violation", async () => {
		render(<input />)
		const ids = (await axeViolations()).map((v) => v.id)
		expect(ids).toContain("label")
	})

	test("Button", async () => {
		render(
			<>
				<Button>儲存</Button>
				<Button variant="secondary" disabled>
					取消
				</Button>
			</>,
		)
		await expectNoAxeViolations()
	})

	test("Input in Field, with help and error", async () => {
		render(
			<Field label="Email" help="我們不會寄廣告。" error="格式不完整。" required>
				<Input type="email" defaultValue="a@" />
			</Field>,
		)
		await expectNoAxeViolations()
	})

	test("Checkbox and Switch", async () => {
		render(
			<>
				<Checkbox label="記住這台裝置" defaultChecked />
				<Switch label="語音喚醒" description="說「Anyknown」開始對話。" />
			</>,
		)
		await expectNoAxeViolations()
	})

	test("Tabs", async () => {
		render(
			<Tabs defaultValue="chat">
				<TabsList aria-label="Thread 檢視">
					<TabsTab value="chat">對話</TabsTab>
					<TabsTab value="memory">記憶</TabsTab>
				</TabsList>
				<TabsPanel value="chat">這個 thread 目前有 12 則訊息。</TabsPanel>
				<TabsPanel value="memory">沒有記憶。</TabsPanel>
			</Tabs>,
		)
		await expectNoAxeViolations()
	})

	test("Dialog, open", async () => {
		render(
			<Dialog defaultOpen>
				<DialogContent title="重新命名工作區" description="新名稱會同步到所有成員。">
					<Field label="名稱">
						<Input defaultValue="AnyKnown" />
					</Field>
				</DialogContent>
			</Dialog>,
		)
		await screen.findByRole("dialog")
		await expectNoAxeViolations()
	})

	test("Toast in a Toaster", async () => {
		const manager = createToastManager()
		render(<Toaster manager={manager} />)
		act(() => {
			manager.add({ title: "交接摘要已複製", description: "貼到任何地方都行。" })
			manager.add({ title: "上傳失敗", type: "danger" })
		})
		await screen.findByText("上傳失敗")
		await expectNoAxeViolations()
	})
})
