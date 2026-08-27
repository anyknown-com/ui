import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
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

	test("pending renders a status dot with a readable label", () => {
		render(
			<Thread>
				<AssistantMessage pending />
			</Thread>,
		)
		expect(screen.getByRole("status", { name: "回覆中" })).toBeInTheDocument()
	})

	test("the streaming cursor is decorative and only on the last part", () => {
		const { container } = render(
			<Thread>
				<AssistantMessage streaming>
					<TextPart>第一段</TextPart>
					<TextPart>第二段</TextPart>
				</AssistantMessage>
			</Thread>,
		)
		const cursors = container.querySelectorAll("[aria-hidden='true']")
		expect(cursors).toHaveLength(1)
		expect(screen.getByText("第二段").contains(cursors[0])).toBe(true)
	})

	test("no cursor when not streaming", () => {
		const { container } = render(
			<Thread>
				<AssistantMessage>
					<TextPart>完成的回覆</TextPart>
				</AssistantMessage>
			</Thread>,
		)
		expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(0)
	})
})
