import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Switch } from "../switch/Switch"
import { Dot, Help, SettingsRow, SettingsRows, SettingsValue } from "./SettingsRows"

describe("SettingsRow", () => {
	test("the name and its help on the left, the control on the right", () => {
		const { container } = render(
			<SettingsRow label="語音喚醒" help="說「Anyknown」開始對話。">
				<Switch aria-label="語音喚醒" />
			</SettingsRow>,
		)
		const [key, control] = [...(container.firstElementChild?.children ?? [])]
		expect(key).toHaveTextContent("語音喚醒說「Anyknown」開始對話。")
		expect(control).toContainElement(screen.getByRole("switch"))
	})

	test("help and the control column are left out when not given", () => {
		const { container } = render(<SettingsRow label="版本" />)
		expect(container.firstElementChild?.children).toHaveLength(1)
		expect(container.firstElementChild?.firstElementChild?.children).toHaveLength(1)
	})

	test("Dot is decorative; Help and SettingsValue render their words", () => {
		const { container } = render(
			<SettingsRow
				label={
					<>
						API key <Dot /> <Help>已設定</Help>
					</>
				}
			>
				<SettingsValue>•••• 9b7c</SettingsValue>
			</SettingsRow>,
		)
		expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
		expect(screen.getByText("已設定")).toBeInTheDocument()
		expect(screen.getByText("•••• 9b7c")).toBeInTheDocument()
	})
})

test("axe: rows with a switch on and off, a value, a disabled control", async () => {
	const { container } = render(
		<SettingsRows>
			<SettingsRow label="語音喚醒" help="說「Anyknown」開始對話。">
				<Switch aria-label="語音喚醒" defaultChecked />
			</SettingsRow>
			<SettingsRow label="通知">
				<Switch aria-label="通知" />
			</SettingsRow>
			<SettingsRow label="同步">
				<Switch aria-label="同步" disabled />
			</SettingsRow>
			<SettingsRow label="API key">
				<SettingsValue>•••• 9b7c</SettingsValue>
			</SettingsRow>
		</SettingsRows>,
	)
	await expectNoAxeViolations(container)
})
