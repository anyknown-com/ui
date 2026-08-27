import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { voicePath } from "../../lib/voice"
import { VoiceIndicator } from "./VoiceIndicator"

describe("voicePath", () => {
	test("idle is a straight line", () => {
		expect(voicePath("idle", 0)).toBe("M2,12 L46,12")
	})

	test("each active state draws a different curve", () => {
		const listening = voicePath("listening", 1)
		const thinking = voicePath("thinking", 1)
		const speaking = voicePath("speaking", 1)
		expect(new Set([listening, thinking, speaking]).size).toBe(3)
		expect(listening.startsWith("M2,")).toBe(true)
	})

	test("listening amplitude follows the level", () => {
		expect(voicePath("listening", 1, 0.1)).not.toBe(voicePath("listening", 1, 0.9))
	})
})

describe("VoiceIndicator", () => {
	test("the visualisation is decorative and the state is a status", () => {
		const { container } = render(<VoiceIndicator state="listening" />)
		expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
		expect(screen.getByRole("status")).toHaveTextContent("聆聽中")
	})

	test("speaking says barge-in is possible", () => {
		render(<VoiceIndicator state="speaking" />)
		expect(screen.getByRole("status")).toHaveTextContent("插話會打斷")
	})

	test("idle reads as standing by", () => {
		render(<VoiceIndicator state="idle" />)
		expect(screen.getByRole("status")).toHaveTextContent("通話待命 · 閒置")
	})

	test("a reduced-motion text label is rendered for every active state", () => {
		const { container, unmount } = render(<VoiceIndicator state="thinking" />)
		expect(container.textContent).toContain("思考中")
		unmount()
		render(<VoiceIndicator state="idle" />)
		expect(screen.queryAllByText("閒置")).toHaveLength(1)
	})

	test("is not interactive", () => {
		render(<VoiceIndicator state="listening" />)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})
})
