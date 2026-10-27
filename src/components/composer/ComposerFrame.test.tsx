import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { ComposerFrame } from "./ComposerFrame"

describe("ComposerFrame", () => {
	test("draws its children", () => {
		render(
			<ComposerFrame>
				<textarea aria-label="訊息" />
			</ComposerFrame>,
		)
		expect(screen.getByRole("textbox", { name: "訊息" })).toBeInTheDocument()
	})

	test("dragging marks the frame and changes its look", () => {
		const { container, rerender } = render(<ComposerFrame>x</ComposerFrame>)
		const frame = container.firstElementChild as HTMLElement
		const idle = frame.className
		expect(frame).not.toHaveAttribute("data-dragging")
		rerender(<ComposerFrame dragging>x</ComposerFrame>)
		expect(frame).toHaveAttribute("data-dragging", "true")
		expect(frame.className).not.toBe(idle)
	})
})
