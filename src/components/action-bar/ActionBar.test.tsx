import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { AssistantMessage, TextPart, Thread } from "../message/Message"
import { ActionBar } from "./ActionBar"

function writeText(spy: ReturnType<typeof vi.fn>) {
	Object.assign(navigator, { clipboard: { writeText: spy } })
}

describe("ActionBar", () => {
	test("is a labelled toolbar", () => {
		render(
			<Thread>
				<AssistantMessage>
					<TextPart>回覆內容</TextPart>
					<ActionBar>
						<ActionBar.Copy />
					</ActionBar>
				</AssistantMessage>
			</Thread>,
		)
		expect(screen.getByRole("toolbar", { name: "訊息動作" })).toBeInTheDocument()
	})

	test("copy takes the message text and confirms in words", async () => {
		const spy = vi.fn().mockResolvedValue(undefined)
		writeText(spy)
		render(
			<Thread>
				<AssistantMessage>
					<TextPart>補好了,三個 case 都綠。</TextPart>
					<ActionBar>
						<ActionBar.Copy />
					</ActionBar>
				</AssistantMessage>
			</Thread>,
		)
		await userEvent.click(screen.getByRole("button", { name: "複製" }))
		expect(spy).toHaveBeenCalledWith(expect.stringContaining("補好了"))
		expect(await screen.findByRole("button", { name: "已複製 ✓" })).toBeInTheDocument()
	})

	test("regenerate only appears when the caller renders it", async () => {
		const onRegenerate = vi.fn()
		render(
			<Thread>
				<AssistantMessage>
					<TextPart>最後一則</TextPart>
					<ActionBar>
						<ActionBar.Copy />
						<ActionBar.Regenerate onRegenerate={onRegenerate} />
					</ActionBar>
				</AssistantMessage>
			</Thread>,
		)
		await userEvent.click(screen.getByRole("button", { name: "重新生成" }))
		expect(onRegenerate).toHaveBeenCalledTimes(1)
	})

	test("buttons are reachable by keyboard", async () => {
		render(
			<Thread>
				<AssistantMessage>
					<TextPart>內容</TextPart>
					<ActionBar>
						<ActionBar.Copy />
					</ActionBar>
				</AssistantMessage>
			</Thread>,
		)
		await userEvent.tab()
		await waitFor(() => expect(screen.getByRole("button", { name: "複製" })).toHaveFocus())
	})
})

function Row({ dir }: { dir?: "rtl" }) {
	return (
		<div dir={dir}>
			<button type="button">before</button>
			<Bar visible />
			<button type="button">after</button>
		</div>
	)
}

describe("ActionBar keyboard (APG toolbar)", () => {
	test("the bar is one tab stop; arrows, Home and End move inside it and wrap", async () => {
		render(<Row />)
		const [copy, regenerate, like] = [
			screen.getByRole("button", { name: "複製" }),
			screen.getByRole("button", { name: "重新生成" }),
			screen.getByRole("button", { name: "讚" }),
		]
		await userEvent.tab()
		await userEvent.tab()
		expect(copy).toHaveFocus()
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "after" })).toHaveFocus()

		await userEvent.tab({ shift: true })
		expect(copy).toHaveFocus()
		await userEvent.keyboard("{ArrowRight}")
		expect(regenerate).toHaveFocus()
		await userEvent.keyboard("{End}")
		expect(like).toHaveFocus()
		await userEvent.keyboard("{ArrowRight}")
		expect(copy).toHaveFocus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(like).toHaveFocus()
		await userEvent.keyboard("{Home}")
		expect(copy).toHaveFocus()
	})

	test("Tab comes back to the button used last", async () => {
		render(<Row />)
		await userEvent.tab()
		await userEvent.tab()
		await userEvent.keyboard("{ArrowRight}")
		await userEvent.tab()
		await userEvent.tab({ shift: true })
		expect(screen.getByRole("button", { name: "重新生成" })).toHaveFocus()
		expect(screen.getByRole("button", { name: "複製" })).toHaveAttribute("tabindex", "-1")
	})

	test("under dir=rtl, ArrowLeft goes to the next button", async () => {
		render(<Row dir="rtl" />)
		await userEvent.tab()
		await userEvent.tab()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("button", { name: "重新生成" })).toHaveFocus()
		await userEvent.keyboard("{ArrowRight}{ArrowRight}")
		expect(screen.getByRole("button", { name: "讚" })).toHaveFocus()
	})

	test("a button that turns disabled leaves the arrow order", async () => {
		const { rerender } = render(
			<ActionBar visible>
				<ActionBar.Button>a</ActionBar.Button>
				<ActionBar.Button>b</ActionBar.Button>
				<ActionBar.Button>c</ActionBar.Button>
			</ActionBar>,
		)
		rerender(
			<ActionBar visible>
				<ActionBar.Button>a</ActionBar.Button>
				<ActionBar.Button disabled>b</ActionBar.Button>
				<ActionBar.Button>c</ActionBar.Button>
			</ActionBar>,
		)
		await userEvent.tab()
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("button", { name: "c" })).toHaveFocus()
	})
})

describe("ActionBar axe", () => {
	test("has no axe violations, hidden and shown, before and after a copy", async () => {
		writeText(vi.fn().mockResolvedValue(undefined))
		const { container, rerender } = render(<Bar visible={false} />)
		await expectNoAxeViolations(container)
		rerender(<Bar visible />)
		await userEvent.click(screen.getByRole("button", { name: "複製" }))
		await screen.findByRole("button", { name: "已複製 ✓" })
		await expectNoAxeViolations(container)
	})
})

function Bar({ visible }: { visible: boolean }) {
	return (
		<Thread>
			<AssistantMessage>
				<TextPart>內容</TextPart>
				<ActionBar visible={visible}>
					<ActionBar.Copy />
					<ActionBar.Regenerate onRegenerate={() => {}} />
					<ActionBar.Button aria-label="讚" icon={<svg aria-hidden="true" />} />
				</ActionBar>
			</AssistantMessage>
		</Thread>
	)
}

describe("ActionBar targets", () => {
	test("every button, icon-only included, is at least 24×24", () => {
		render(
			<Thread>
				<AssistantMessage>
					<TextPart>內容</TextPart>
					<ActionBar>
						<ActionBar.Copy />
						<ActionBar.Regenerate onRegenerate={() => {}} />
						<ActionBar.Button aria-label="讚" icon={<svg aria-hidden="true" />} />
					</ActionBar>
				</AssistantMessage>
			</Thread>,
		)
		for (const button of screen.getAllByRole("button"))
			expect(button).toHaveStyle({ minHeight: "24px", minWidth: "24px" })
	})
})

describe("ActionBar words", () => {
	test("reads English under an en LocaleProvider", async () => {
		writeText(vi.fn().mockResolvedValue(undefined))
		render(
			<LocaleProvider locale="en">
				<Thread>
					<AssistantMessage>
						<TextPart>reply</TextPart>
						<ActionBar>
							<ActionBar.Copy />
							<ActionBar.Regenerate onRegenerate={() => {}} />
						</ActionBar>
					</AssistantMessage>
				</Thread>
			</LocaleProvider>,
		)
		expect(screen.getByRole("toolbar", { name: "Message actions" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Regenerate" })).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Copy" }))
		expect(await screen.findByRole("button", { name: "Copied ✓" })).toBeInTheDocument()
	})

	test("the bar's labels reach its actions, and an action's own label wins", () => {
		render(
			<Thread>
				<AssistantMessage>
					<TextPart>內容</TextPart>
					<ActionBar labels={{ toolbar: "工具", copy: "拷貝", regenerate: "再來" }}>
						<ActionBar.Copy />
						<ActionBar.Regenerate onRegenerate={() => {}} label="重寫" />
					</ActionBar>
				</AssistantMessage>
			</Thread>,
		)
		expect(screen.getByRole("toolbar", { name: "工具" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "拷貝" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "重寫" })).toBeInTheDocument()
	})
})

describe("ActionBar regressions", () => {
	test("copy takes only the message's text parts, not the hidden label or the bar", async () => {
		const spy = vi.fn().mockResolvedValue(undefined)
		writeText(spy)
		render(
			<Thread>
				<AssistantMessage>
					<TextPart>第一段</TextPart>
					<TextPart>第二段</TextPart>
					<ActionBar>
						<ActionBar.Copy />
					</ActionBar>
				</AssistantMessage>
			</Thread>,
		)
		await userEvent.click(screen.getByRole("button", { name: "複製" }))
		expect(spy).toHaveBeenCalledWith("第一段\n\n第二段")
	})
})
