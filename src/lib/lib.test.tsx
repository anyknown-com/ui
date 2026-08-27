import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { styled } from "./styled"
import { useControllableState } from "./useControllableState"

describe("useControllableState", () => {
	test("applies two functional updates in the same event", async () => {
		const onChange = vi.fn()
		function Counter() {
			const [count, setCount] = useControllableState<number>(undefined, 0, onChange)
			return (
				<button
					type="button"
					onClick={() => {
						setCount((c) => c + 1)
						setCount((c) => c + 1)
					}}
				>
					{count}
				</button>
			)
		}
		render(<Counter />)
		await userEvent.click(screen.getByRole("button"))
		expect(screen.getByRole("button")).toHaveTextContent("2")
		expect(onChange).toHaveBeenNthCalledWith(2, 2)
	})
})

describe("styled", () => {
	test("keeps the caller's className and style alongside the StyleX output", () => {
		const merged = styled({ className: "caller", style: { width: 10 } }, false)
		expect(merged.className).toContain("caller")
		expect(merged.style).toMatchObject({ width: 10 })
	})
})
