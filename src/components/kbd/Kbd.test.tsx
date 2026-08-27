import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { Kbd, KbdGroup, KbdToneContext } from "./Kbd"

describe("Kbd", () => {
	test("renders a semantic kbd element", () => {
		render(<Kbd>⌘</Kbd>)
		expect(screen.getByText("⌘").tagName).toBe("KBD")
	})

	test("a combo renders one kbd per key with no separator", () => {
		const { container } = render(<KbdGroup keys={["⌘", "⇧", "P"]} />)
		expect(container.querySelectorAll("kbd")).toHaveLength(3)
		expect(container.textContent).toBe("⌘⇧P")
	})

	test("a sequence renders the separator between keys", () => {
		const { container } = render(<KbdGroup keys={["g", "t"]} separator="然後" />)
		expect(container.querySelectorAll("kbd")).toHaveLength(2)
		expect(container.textContent).toBe("g然後t")
	})

	test("inverted tone comes from context, not a prop", () => {
		const { container: plain } = render(<Kbd>⌘</Kbd>)
		const { container: inverted } = render(
			<KbdToneContext value="inverted">
				<Kbd>⌘</Kbd>
			</KbdToneContext>,
		)
		expect(plain.querySelector("kbd")?.className).not.toBe(inverted.querySelector("kbd")?.className)
	})
})
