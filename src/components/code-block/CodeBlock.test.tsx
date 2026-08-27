import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { CodeBlock, InlineCode } from "./CodeBlock"

const CODE = `export function useChildSession(callID: string) {\n  return null\n}`

describe("CodeBlock", () => {
	test("shows the language label and the code", () => {
		render(<CodeBlock lang="ts" code={CODE} />)
		expect(screen.getByText("ts")).toBeInTheDocument()
		expect(screen.getByText(/useChildSession/)).toBeInTheDocument()
	})

	test("the scrollable region is keyboard reachable and labelled", () => {
		render(<CodeBlock lang="bash" code="pnpm test" />)
		const region = screen.getByRole("region", { name: "bash 程式碼" })
		expect(region).toHaveAttribute("tabindex", "0")
	})

	test("copy writes the code and confirms in words", async () => {
		const spy = vi.fn().mockResolvedValue(undefined)
		Object.assign(navigator, { clipboard: { writeText: spy } })
		render(<CodeBlock lang="ts" code={CODE} />)
		await userEvent.click(screen.getByRole("button", { name: "複製" }))
		expect(spy).toHaveBeenCalledWith(CODE)
		expect(await screen.findByRole("button", { name: "已複製 ✓" })).toBeInTheDocument()
	})

	test("the streaming cursor is decorative", () => {
		const { container } = render(<CodeBlock lang="ts" code="bus.emit(" streaming />)
		expect(container.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(0)
	})

	test("inline code renders a code element", () => {
		render(<InlineCode>turn.ts</InlineCode>)
		expect(screen.getByText("turn.ts").tagName).toBe("CODE")
	})
})
