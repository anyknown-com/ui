import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { BALL_STRANDS, ballDashOffset } from "../../lib/progress"
import { Progress, ProgressBall, ProgressRing, Spinner } from "./Progress"

describe("progress geometry", () => {
	test("the ball winds strand by strand and finishes with an outline", () => {
		expect(BALL_STRANDS).toHaveLength(25)
		expect(BALL_STRANDS.at(-1)).toContain("A9.3,9.3")
		expect(ballDashOffset(0, 0)).toBe(100)
		expect(ballDashOffset(100, BALL_STRANDS.length - 1)).toBe(0)
	})
})

describe("Progress", () => {
	test("weave exposes determinate progressbar semantics", () => {
		render(<Progress value={64} aria-label="同步 thread" valueText="3 則訊息交接中" />)
		const bar = screen.getByRole("progressbar", { name: "同步 thread" })
		expect(bar).toHaveAttribute("aria-valuenow", "64")
		expect(bar).toHaveAttribute("aria-valuemin", "0")
		expect(bar).toHaveAttribute("aria-valuemax", "100")
		expect(bar).toHaveAttribute("aria-valuetext", "3 則訊息交接中")
	})

	test("clamps out-of-range values", () => {
		render(<Progress value={140} valueText="同步中 100%" aria-label="同步" />)
		expect(screen.getByRole("progressbar", { name: "同步" })).toHaveAttribute("aria-valuenow", "100")
	})

	test("without a value it renders the waiting cloth and sets no valuenow", () => {
		render(<Progress valueText="整理記憶中" aria-label="整理記憶" />)
		const bar = screen.getByRole("progressbar", { name: "整理記憶" })
		expect(bar).not.toHaveAttribute("aria-valuenow")
		expect(bar).toHaveAttribute("aria-valuetext", "整理記憶中")
		expect(bar).toHaveTextContent("掃描對話")
		expect(bar).not.toHaveTextContent("%")
	})
})

describe("Spinner", () => {
	test("is a status region with a label", () => {
		render(<Spinner label="載入中" />)
		expect(screen.getByRole("status", { name: "載入中" })).toBeInTheDocument()
	})

	test("does not expose progressbar semantics", () => {
		render(<Spinner />)
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
	})
})

describe("ProgressBall", () => {
	test("exposes determinate semantics and one path per strand", () => {
		const { container } = render(<ProgressBall value={64} valueText="下載模型 64%" aria-label="下載模型" />)
		expect(screen.getByRole("progressbar", { name: "下載模型" })).toHaveAttribute("aria-valuenow", "64")
		expect(container.querySelectorAll("path")).toHaveLength(BALL_STRANDS.length)
	})
})

function arc(value: number) {
	const { container, unmount } = render(
		<ProgressRing value={value} valueText="128k context" aria-label="context 用量" />,
	)
	const d = container.querySelector("clipPath path")?.getAttribute("d") ?? ""
	unmount()
	return d
}

describe("ProgressRing", () => {
	test("shows an exact reading with a human-readable valuetext", () => {
		render(<ProgressRing value={42} aria-label="context 用量" valueText="128k context 已用 42%" />)
		const ring = screen.getByRole("progressbar", { name: "context 用量" })
		expect(ring).toHaveAttribute("aria-valuetext", "128k context 已用 42%")
		expect(ring).toHaveTextContent("42%")
	})

	test("the arc window opens with the percentage", () => {
		expect(arc(20)).not.toBe(arc(80))
		expect(arc(0)).not.toBe(arc(100))
		expect(arc(50)).toMatch(/^M[\d.,]+A/)
	})
})

describe("Progress regressions", () => {
	test("the spinner's label is inside its live region, not only its name", () => {
		render(<Spinner label="載入中" />)
		expect(screen.getByRole("status", { name: "載入中" })).toHaveTextContent("載入中")
	})
})
