import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { PayloadBlock } from "./PayloadBlock"

const CODE = JSON.stringify({ url: "https://example.com" }, null, 2)

describe("PayloadBlock", () => {
	test("沒有 highlight 就是純文字", () => {
		const { container } = render(<PayloadBlock code={CODE} />)
		expect(container.querySelector("pre")).toHaveTextContent('"url": "https://example.com"')
	})

	test("highlight 畫出來的東西取代純文字", () => {
		const highlight = vi.fn((code: string) => <code data-testid="lit">{code.length}</code>)
		render(<PayloadBlock code={CODE} highlight={highlight} />)
		expect(highlight).toHaveBeenCalledWith(CODE)
		expect(screen.getByTestId("lit")).toHaveTextContent(String(CODE.length))
	})

	test("複製整段,按鈕改說已複製", async () => {
		const user = userEvent.setup()
		const writeText = vi.spyOn(navigator.clipboard, "writeText")
		render(<PayloadBlock code={CODE} />)
		await user.click(screen.getByRole("button", { name: "複製" }))
		expect(writeText).toHaveBeenCalledWith(CODE)
		expect(await screen.findByRole("button", { name: "已複製" })).toBeInTheDocument()
	})
})
