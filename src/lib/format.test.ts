import { describe, expect, test } from "vitest"
import { formatBytes, formatDuration } from "./format"

describe("formatBytes", () => {
	test("formats each unit", () => {
		expect(formatBytes(512)).toBe("512 B")
		expect(formatBytes(2400)).toBe("2.3 KB")
		expect(formatBytes(2_400_000)).toBe("2.3 MB")
		expect(formatBytes(40_000_000)).toBe("38 MB")
	})

	test("picks the unit after rounding, not before", () => {
		expect(formatBytes(1_048_575)).toBe("1.0 MB")
		expect(formatBytes(1_073_741_823)).toBe("1.0 GB")
	})

	test("survives degenerate input", () => {
		expect(formatBytes(0)).toBe("0 B")
		expect(formatBytes(0.5)).toBe("1 B")
		expect(formatBytes(-1)).toBe("0 B")
		expect(formatBytes(Number.NaN)).toBe("0 B")
	})
})

describe("formatDuration", () => {
	test("formats milliseconds, seconds and minutes", () => {
		expect(formatDuration(300)).toBe("300ms")
		expect(formatDuration(8100)).toBe("8.1s")
		expect(formatDuration(125_000)).toBe("2m 5s")
	})

	test("never puts 60 in the seconds slot", () => {
		expect(formatDuration(119_500)).toBe("2m 0s")
		expect(formatDuration(3_599_999)).toBe("60m 0s")
		expect(formatDuration(59_950)).toBe("1m 0s")
	})

	test("survives degenerate input", () => {
		expect(formatDuration(0)).toBe("0ms")
		expect(formatDuration(-1)).toBe("0ms")
		expect(formatDuration(Number.NaN)).toBe("0ms")
	})
})
