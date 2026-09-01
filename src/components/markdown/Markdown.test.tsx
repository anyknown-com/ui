import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { Markdown } from "./Markdown"

// jsdom builds MathML elements without a `style` object, so Temml's own `node.style[x] = …` throws
// there and nowhere else. What belongs to this component is *what it asks Temml for* and what it
// shows while Temml is still loading; the MathML itself is Temml's job and the browser's.
const calls = vi.hoisted(() => [] as { tex: string; display: boolean }[])
vi.mock("temml", () => ({
	default: {
		render(tex: string, node: HTMLElement, options?: { displayMode?: boolean }) {
			calls.push({ tex, display: options?.displayMode ?? false })
			node.textContent = `⟨math⟩${tex}`
		},
	},
}))

describe("Markdown", () => {
	test("renders the inline marks a message actually uses", () => {
		render(<Markdown>{"**粗** 跟 `code` 跟 ~~刪掉~~"}</Markdown>)
		expect(screen.getByText("粗").tagName).toBe("STRONG")
		expect(screen.getByText("code").tagName).toBe("CODE")
		expect(screen.getByText("刪掉").tagName).toBe("DEL")
	})

	test("a lone newline is a line break, because this is a message and not a document", () => {
		const { container } = render(<Markdown>{"第一行\n第二行"}</Markdown>)
		expect(container.querySelectorAll("br")).toHaveLength(1)
	})

	test("a fenced block becomes a code block that keeps its language", () => {
		render(<Markdown>{"```ts\nconst a = 1\n```"}</Markdown>)
		expect(screen.getByText("ts")).toBeInTheDocument()
		expect(screen.getByText(/const a = 1/)).toBeInTheDocument()
	})

	test("a table scrolls inside its own box instead of widening the message", () => {
		const { container } = render(<Markdown>{"| a | b |\n| --- | ---: |\n| 1 | 2 |"}</Markdown>)
		const table = container.querySelector("table")
		expect(table).toBeInTheDocument()
		// The wrapper is what scrolls; the table itself must not be allowed to shrink.
		expect(table?.parentElement?.className).toBeTruthy()
		expect(screen.getByText("2")).toHaveStyle({ textAlign: "end" })
	})

	test("task list items keep their checkbox state", () => {
		render(<Markdown>{"- [x] 做完了\n- [ ] 還沒"}</Markdown>)
		const boxes = screen.getAllByRole("checkbox")
		expect(boxes).toHaveLength(2)
		expect(boxes[0]).toBeChecked()
		expect(boxes[1]).not.toBeChecked()
	})

	test("links open in a new tab without handing it window.opener", () => {
		render(<Markdown>{"[看這裡](https://anyknown.com)"}</Markdown>)
		const link = screen.getByRole("link", { name: "看這裡" })
		expect(link).toHaveAttribute("target", "_blank")
		expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow")
	})

	test("html is shown as source, never parsed", () => {
		const { container } = render(<Markdown>{"<script>alert(1)</script>\n\n<b>粗嗎</b>"}</Markdown>)
		expect(container.querySelector("script")).toBeNull()
		expect(container.querySelector("b")).toBeNull()
		expect(screen.getByText(/alert\(1\)/)).toBeInTheDocument()
	})

	test("a block of raw html lands in a code block, so it matches the rest of the message", () => {
		render(<Markdown>{"<script>alert(1)</script>"}</Markdown>)
		expect(screen.getByText("html")).toBeInTheDocument()
	})

	test("inline html stays inline, as text", () => {
		// marked calls a lone `<b>…</b>` inline html, so it is shown in place rather than lifted
		// into a block of its own — either way it is text, never markup.
		const { container } = render(<Markdown>{"很<b>粗</b>吧"}</Markdown>)
		expect(container.querySelector("b")).toBeNull()
		expect(container.textContent).toContain("<b>")
	})

	test("the task box is the design system's, not the browser's", () => {
		const { container } = render(<Markdown>{"- [x] 做完了"}</Markdown>)
		// A native <input type=checkbox> paints itself in the OS accent colour and ignores the
		// theme entirely; the design system's own draws its cloth as an svg next to the input.
		expect(container.querySelector("svg")).toBeInTheDocument()
	})

	test("renderBlock takes over a fence, and falling through still shows the source", () => {
		render(
			<Markdown renderBlock={({ lang, code }) => (lang === "mermaid" ? <p>圖:{code}</p> : undefined)}>
				{"```mermaid\ngraph TD\n```\n\n```py\nx = 1\n```"}
			</Markdown>,
		)
		expect(screen.getByText(/圖:graph TD/)).toBeInTheDocument()
		// The one it declined is still a code block.
		expect(screen.getByText("py")).toBeInTheDocument()
	})

	describe("maths", () => {
		beforeEach(() => {
			calls.length = 0
		})

		test("$…$ is handed to the renderer as inline maths", async () => {
			render(<Markdown>{"能量是 $E = mc^2$ 沒錯"}</Markdown>)
			await waitFor(() => expect(calls).toHaveLength(1))
			expect(calls[0]).toEqual({ tex: "E = mc^2", display: false })
		})

		test("$$…$$ is display maths", async () => {
			render(<Markdown>{"$$\\int_0^1 x\\,dx$$"}</Markdown>)
			await waitFor(() => expect(calls).toHaveLength(1))
			expect(calls[0]?.display).toBe(true)
		})

		test("\\( … \\) works too, because half the models write it that way", async () => {
			render(<Markdown>{"寫成 \\(a^2 + b^2\\) 也行"}</Markdown>)
			await waitFor(() => expect(calls).toHaveLength(1))
			expect(calls[0]).toEqual({ tex: "a^2 + b^2", display: false })
		})

		test("money is not maths, and does not get broken across lines", () => {
			const { container } = render(<Markdown>{"從 $5 漲到 $10"}</Markdown>)
			expect(calls).toHaveLength(0)
			// The `$` used to be handed to marked as a split point, which turned the space before it
			// into a <br>.
			expect(container.querySelectorAll("br")).toHaveLength(0)
			expect(screen.getByText("從 $5 漲到 $10")).toBeInTheDocument()
		})

		test("the source is what shows until the renderer arrives", () => {
			render(<Markdown>{"$E = mc^2$"}</Markdown>)
			// Synchronously — before the dynamic import resolves — the TeX itself is on screen, so a
			// failed or slow load never leaves a blank gap in the message.
			expect(screen.getByText("E = mc^2")).toBeInTheDocument()
		})
	})
})
