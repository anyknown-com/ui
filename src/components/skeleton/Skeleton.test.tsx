import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { Skeleton, SkeletonGroup, ThreadSkeleton } from "./Skeleton"

describe("Skeleton", () => {
	test("each bone is hidden from the accessibility tree", () => {
		const { container } = render(<Skeleton width="70%" />)
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
	})

	test("a group announces loading once", () => {
		render(
			<SkeletonGroup label="thread 載入中">
				<Skeleton />
				<Skeleton width="92%" />
			</SkeletonGroup>,
		)
		const status = screen.getByRole("status", { name: "thread 載入中" })
		expect(status.querySelectorAll("[role='status']")).toHaveLength(0)
		expect(status).toHaveTextContent("thread 載入中")
	})

	// StyleX dynamic styles land as CSS custom properties on the element.
	test("a circle skeleton takes an explicit size", () => {
		const { container } = render(<Skeleton shape="circle" size={36} />)
		const style = container.firstElementChild?.getAttribute("style") ?? ""
		expect(style).toContain("36px")
	})

	test("the thread preset renders one group with the requested number of turns", () => {
		render(<ThreadSkeleton messages={3} />)
		const status = screen.getByRole("status", { name: "thread 載入中" })
		// first child is the visually-hidden label the live region announces
		expect(status.children).toHaveLength(4)
	})
})
