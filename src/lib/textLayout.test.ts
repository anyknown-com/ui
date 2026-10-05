import * as pretext from "@chenglou/pretext"
import { afterEach, describe, expect, test, vi } from "vitest"
import {
	clearTextLayoutCache,
	getTextLayoutEngine,
	measureTextHeight,
	setTextLayoutEngine,
} from "./textLayout"

function fakeEngine() {
	return {
		prepare: vi.fn((text: string, font: string) => ({ text, font })),
		layout: vi.fn((_prepared: { text: string }, _width: number, lineHeight: number) => ({
			height: 3 * lineHeight,
			lineCount: 3,
		})),
		clearCache: vi.fn(),
	}
}

const options = { font: "14px Geist", width: 200, lineHeight: 20, whiteSpace: "pre-wrap" } as const

afterEach(() => setTextLayoutEngine(null))

describe("textLayout", () => {
	test("accepts the Pretext module namespace", () => {
		setTextLayoutEngine(pretext)
		expect(getTextLayoutEngine()).toBe(pretext)
	})

	test("returns null without an engine", () => {
		expect(measureTextHeight("hi", options)).toBeNull()
	})

	test("passes font, width, line height and white-space to the engine", () => {
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		expect(measureTextHeight("a\nb", options)).toBe(60)
		expect(engine.prepare).toHaveBeenCalledWith("a\nb", "14px Geist", { whiteSpace: "pre-wrap" })
		expect(engine.layout).toHaveBeenCalledWith({ text: "a\nb", font: "14px Geist" }, 200, 20)
	})

	test("prepares the same text and font once", () => {
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		measureTextHeight("same", options)
		measureTextHeight("same", { ...options, width: 120 })
		expect(engine.prepare).toHaveBeenCalledTimes(1)
		expect(engine.layout).toHaveBeenCalledTimes(2)

		measureTextHeight("same", { ...options, font: "16px Geist" })
		expect(engine.prepare).toHaveBeenCalledTimes(2)
	})

	test("clearing the cache prepares again and clears the engine cache", () => {
		const engine = fakeEngine()
		setTextLayoutEngine(engine)
		measureTextHeight("same", options)
		clearTextLayoutCache()
		measureTextHeight("same", options)
		expect(engine.prepare).toHaveBeenCalledTimes(2)
		expect(engine.clearCache).toHaveBeenCalledTimes(1)
	})
})
