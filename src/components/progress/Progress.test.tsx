import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { BALL_STRANDS, LOOM_PATHS, ballDashOffset, loomDashOffset, weaveFibres } from "../../lib/progress"
import { Progress, ProgressBall, ProgressRing, Spinner } from "./Progress"

describe("progress geometry", () => {
	test("weave draws five fibres of decreasing opacity", () => {
		const fibres = weaveFibres(50)
		expect(fibres).toHaveLength(5)
		expect(fibres[0].opacity).toBeGreaterThan(fibres[4].opacity)
		expect(fibres[0].d.startsWith("M0,")).toBe(true)
	})

	test("weave tightens as the front advances", () => {
		expect(weaveFibres(0)[0].d).not.toBe(weaveFibres(100)[0].d)
	})

	test("the ball winds strand by strand and finishes with an outline", () => {
		expect(BALL_STRANDS).toHaveLength(25)
		expect(BALL_STRANDS.at(-1)).toContain("A9.3,9.3")
		expect(ballDashOffset(0, 0)).toBe(100)
		expect(ballDashOffset(100, BALL_STRANDS.length - 1)).toBe(0)
	})

	test("the loom lays eight layers, two passes of four directions", () => {
		expect(LOOM_PATHS).toHaveLength(8)
		expect(LOOM_PATHS[0]).toBe(LOOM_PATHS[4])
		expect(loomDashOffset(0, 0)).toBe(100)
		expect(loomDashOffset(100, 7)).toBe(0)
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

	test("without a value it renders the tidy loom and sets no valuenow", () => {
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

describe("ProgressRing", () => {
	test("shows an exact reading with a human-readable valuetext", () => {
		render(<ProgressRing value={42} aria-label="context 用量" valueText="128k context 已用 42%" />)
		const ring = screen.getByRole("progressbar", { name: "context 用量" })
		expect(ring).toHaveAttribute("aria-valuetext", "128k context 已用 42%")
		expect(ring).toHaveTextContent("42%")
	})

	test("the fill arc is offset by the remaining percentage", () => {
		const { container } = render(
			<ProgressRing value={42} valueText="128k context 已用 42%" aria-label="context 用量" />,
		)
		const circles = container.querySelectorAll("circle")
		expect(circles[1]).toHaveAttribute("stroke-dashoffset", "58")
	})
})

describe("Progress regressions", () => {
	test("the spinner's label is inside its live region, not only its name", () => {
		render(<Spinner label="載入中" />)
		expect(screen.getByRole("status", { name: "載入中" })).toHaveTextContent("載入中")
	})
})
