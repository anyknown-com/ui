import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest"
import { setTextLayoutEngine } from "../../lib/textLayout"
import { Textarea } from "./Textarea"

describe("Textarea", () => {
	test("renders and accepts multiline input", async () => {
		render(<Textarea aria-label="回報問題" />)
		const area = screen.getByRole("textbox", { name: "回報問題" })
		await userEvent.type(area, "line1{enter}line2")
		expect(area).toHaveValue("line1\nline2")
	})

	test("invalid sets aria-invalid", () => {
		render(<Textarea aria-label="備註" invalid />)
		expect(screen.getByRole("textbox", { name: "備註" })).toHaveAttribute("aria-invalid", "true")
	})

	test("forwards ref", () => {
		const ref = createRef<HTMLTextAreaElement>()
		render(<Textarea aria-label="備註" ref={ref} autoGrow />)
		expect(ref.current).toBe(screen.getByRole("textbox", { name: "備註" }))
	})
})

// jsdom 沒有 layout:computed style、寬度、scrollHeight、ResizeObserver 都要自己給
const LINE = 20
const FRAME = 6 + 6 + 1 + 1 // padding + border, border-box
const area = () => screen.getByRole<HTMLTextAreaElement>("textbox")

function fakeEngine() {
	return {
		prepare: vi.fn((text: string) => text),
		layout: vi.fn((text: string, _width: number, lineHeight: number) => {
			const lineCount = text.split("\n").length
			return { height: lineCount * lineHeight, lineCount }
		}),
	}
}

describe("Textarea autoGrow", () => {
	let fieldSizing = false
	let width = 300
	let scrollHeight = 0
	let resizeObservers: (() => void)[] = []

	beforeEach(() => {
		fieldSizing = false
		width = 300
		scrollHeight = 0
		resizeObservers = []
		vi.spyOn(CSS, "supports").mockImplementation(() => fieldSizing)
		vi.spyOn(window, "getComputedStyle").mockReturnValue({
			lineHeight: `${LINE}px`,
			fontSize: "14px",
			fontStyle: "normal",
			fontWeight: "400",
			fontFamily: "Geist",
			paddingTop: "6px",
			paddingBottom: "6px",
			paddingLeft: "10px",
			paddingRight: "10px",
			borderTopWidth: "1px",
			borderBottomWidth: "1px",
			boxSizing: "border-box",
		} as CSSStyleDeclaration)
		vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width)
		vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight)
		vi.stubGlobal(
			"ResizeObserver",
			class {
				constructor(callback: () => void) {
					resizeObservers.push(callback)
				}
				observe() {}
				disconnect() {}
			},
		)
	})

	afterEach(() => {
		setTextLayoutEngine(null)
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	test("leaves sizing to CSS when field-sizing is supported", () => {
		fieldSizing = true
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		render(<Textarea aria-label="長高" autoGrow maxRows={6} defaultValue={"a\nb\nc"} />)
		expect(area().style.height).toBe("")
		expect(engine.prepare).not.toHaveBeenCalled()
	})

	test("does nothing without autoGrow", () => {
		render(<Textarea aria-label="固定" defaultValue={"a\nb\nc"} />)
		expect(area().style.height).toBe("")
	})

	test("sizes from the engine with the computed font and content width", () => {
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		render(<Textarea aria-label="長高" autoGrow defaultValue={"a\nb\nc"} />)
		expect(area().style.height).toBe(`${3 * LINE + FRAME}px`)
		expect(engine.prepare).toHaveBeenCalledWith("a\nb\nc", "normal 400 14px Geist", {
			whiteSpace: "pre-wrap",
		})
		expect(engine.layout).toHaveBeenCalledWith("a\nb\nc", 280, LINE)
	})

	test("counts the line after a trailing newline", () => {
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		render(<Textarea aria-label="長高" autoGrow defaultValue={"a\n"} />)
		expect(engine.prepare).toHaveBeenCalledWith("a\n ", expect.any(String), expect.anything())
		expect(area().style.height).toBe(`${2 * LINE + FRAME}px`)
	})

	test("clamps the engine height to maxRows", () => {
		setTextLayoutEngine(fakeEngine())
		render(<Textarea aria-label="長高" autoGrow maxRows={3} defaultValue={"1\n2\n3\n4\n5"} />)
		expect(area().style.height).toBe(`${3 * LINE + FRAME}px`)
	})

	test("grows while typing (uncontrolled)", async () => {
		setTextLayoutEngine(fakeEngine())
		render(<Textarea aria-label="長高" autoGrow />)
		expect(area().style.height).toBe(`${LINE + FRAME}px`)
		await userEvent.type(area(), "a{enter}b")
		expect(area().style.height).toBe(`${2 * LINE + FRAME}px`)
	})

	test("follows the value prop (controlled)", () => {
		setTextLayoutEngine(fakeEngine())
		const { rerender } = render(<Textarea aria-label="長高" autoGrow value="a" onChange={() => {}} />)
		expect(area().style.height).toBe(`${LINE + FRAME}px`)
		rerender(<Textarea aria-label="長高" autoGrow value={"a\nb\nc\nd"} onChange={() => {}} />)
		expect(area().style.height).toBe(`${4 * LINE + FRAME}px`)
		rerender(<Textarea aria-label="長高" autoGrow value="" onChange={() => {}} />)
		expect(area().style.height).toBe(`${LINE + FRAME}px`)
	})

	test("re-measures on the next frame when the width changes", () => {
		const frames: FrameRequestCallback[] = []
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback))
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		render(<Textarea aria-label="長高" autoGrow defaultValue="a" />)
		act(() => resizeObservers.at(-1)!())
		expect(frames).toHaveLength(0) // 高度改變也會觸發,寬度沒變就不量

		width = 160
		act(() => resizeObservers.at(-1)!())
		expect(engine.layout).not.toHaveBeenLastCalledWith("a", 140, LINE)
		act(() => frames.at(-1)!(0))
		expect(engine.layout).toHaveBeenLastCalledWith("a", 140, LINE)
	})

	test("falls back to scrollHeight without an engine", () => {
		scrollHeight = 92
		render(<Textarea aria-label="長高" autoGrow maxRows={8} defaultValue={"a\nb\nc\nd"} />)
		expect(area().style.height).toBe(`${92 + 2}px`)
	})

	test("clamps the scrollHeight fallback to maxRows", () => {
		scrollHeight = 400
		render(<Textarea aria-label="長高" autoGrow maxRows={4} defaultValue="long" />)
		expect(area().style.height).toBe(`${4 * LINE + FRAME}px`)
	})

	test("waits for web fonts before trusting the engine", async () => {
		let loaded!: () => void
		const ready = new Promise<void>((resolve) => {
			loaded = resolve
		})
		// jsdom 沒有 document.fonts
		Object.defineProperty(document, "fonts", {
			configurable: true,
			value: { status: "loading", ready, addEventListener: vi.fn(), removeEventListener: vi.fn() },
		})
		onTestFinished(() => {
			Reflect.deleteProperty(document, "fonts")
		})
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		scrollHeight = 50
		render(<Textarea aria-label="長高" autoGrow defaultValue={"a\nb"} />)
		expect(engine.prepare).not.toHaveBeenCalled()
		expect(area().style.height).toBe("52px")

		await act(async () => {
			loaded()
			await ready
		})
		expect(area().style.height).toBe(`${2 * LINE + FRAME}px`)
	})
})
