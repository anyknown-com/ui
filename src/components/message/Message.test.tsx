import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { InlineCode } from "../code-block/CodeBlock"
import { AssistantMessage, TextPart, Thread, UserMessage } from "./Message"

describe("Message", () => {
	test("renders user and assistant turns in order", () => {
		render(
			<Thread>
				<UserMessage>幫我看一下 thread reducer</UserMessage>
				<AssistantMessage>
					<TextPart>
						規則在 <InlineCode>selectVisibleMessages</InlineCode>
					</TextPart>
				</AssistantMessage>
			</Thread>,
		)
		expect(screen.getByText("幫我看一下 thread reducer")).toBeInTheDocument()
		expect(screen.getByText("selectVisibleMessages").tagName).toBe("CODE")
	})

	test("pending puts its label inside the live region so it is announced", () => {
		render(
			<Thread>
				<AssistantMessage pending />
			</Thread>,
		)
		expect(screen.getByRole("status")).toHaveTextContent("回覆中")
	})

	test("each turn names its author for linear reading", () => {
		render(
			<Thread>
				<UserMessage>問題</UserMessage>
				<AssistantMessage>
					<TextPart>回答</TextPart>
				</AssistantMessage>
			</Thread>,
		)
		expect(screen.getByText("你說:")).toBeInTheDocument()
		expect(screen.getByText("助理說:")).toBeInTheDocument()
	})

	test("built-in words follow the locale; labels and single-word props win", () => {
		render(
			<LocaleProvider locale="en">
				<Thread>
					<UserMessage>Question</UserMessage>
					<UserMessage authorLabel="Ann said:">Again</UserMessage>
					<AssistantMessage pending labels={{ assistantAuthor: "Agent said:" }} />
				</Thread>
			</LocaleProvider>,
		)
		expect(screen.getByText("You said:")).toBeInTheDocument()
		expect(screen.getByText("Ann said:")).toBeInTheDocument()
		expect(screen.getByText("Agent said:")).toBeInTheDocument()
		expect(screen.getByRole("status")).toHaveTextContent("Replying")
	})

	test("has no axe violations for user, assistant, streaming and pending turns", async () => {
		const { container } = render(
			<Thread>
				<UserMessage>問題</UserMessage>
				<AssistantMessage>
					<TextPart>完成的回覆</TextPart>
				</AssistantMessage>
				<AssistantMessage streaming>
					<TextPart>寫到一半</TextPart>
				</AssistantMessage>
				<AssistantMessage pending />
			</Thread>,
		)
		await expectNoAxeViolations(container)
	})

	test("the streaming cursor is decorative and only on the last part", () => {
		render(
			<Thread>
				<AssistantMessage streaming>
					<TextPart>第一段</TextPart>
					<TextPart>第二段</TextPart>
				</AssistantMessage>
			</Thread>,
		)
		const cursor = screen.getByText("第二段").querySelector("[aria-hidden='true']")
		expect(cursor).not.toBeNull()
		expect(screen.getByText("第一段").querySelector("[aria-hidden='true']")).toBeNull()
	})

	test("no cursor when not streaming", () => {
		const { container } = render(
			<Thread>
				<AssistantMessage>
					<TextPart>完成的回覆</TextPart>
				</AssistantMessage>
			</Thread>,
		)
		expect(container.querySelector("p [aria-hidden='true']")).toBeNull()
	})
})

describe("Message regressions", () => {
	test("the cursor lands on the last text part even with a trailing action bar", () => {
		render(
			<Thread>
				<AssistantMessage streaming>
					<TextPart>正文</TextPart>
					<div data-testid="bar">動作列</div>
				</AssistantMessage>
			</Thread>,
		)
		expect(screen.getByText("正文").querySelector("[aria-hidden='true']")).not.toBeNull()
	})

	test("a caller's ref reaches the thread element", () => {
		let node: HTMLDivElement | null = null
		render(
			<Thread
				ref={(element) => {
					node = element
				}}
			>
				<UserMessage>問題</UserMessage>
			</Thread>,
		)
		expect(node).not.toBeNull()
	})
})
