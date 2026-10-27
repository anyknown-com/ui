// The y axis that BarChart and LineChart share: three round ticks and how a number is written.

/** Step sizes, times a power of ten, that read as round numbers. */
const NICE = [1, 2, 2.5, 3, 4, 5, 6, 8, 10]

/** The smallest round step that is at least `raw` (> 0). */
function niceStep(raw: number): number {
	const power = 10 ** Math.floor(Math.log10(raw))
	const nice = NICE.find((n) => n * power >= raw * (1 - 1e-9)) ?? 10
	return nice * power
}

/** Drops float noise such as 0.30000000000000004. */
const clean = (n: number) => Number(n.toPrecision(12))

/**
 * Three evenly spaced round ticks, low to high, that cover `min` to `max`. The chart's y range
 * is exactly low to high, so the ticks sit at the bottom, the middle and the top.
 */
export function axisTicks(min: number, max: number): [number, number, number] {
	const top = max > min ? max : min + (Math.abs(min) || 1)
	let step = niceStep((top - min) / 2)
	let low = Math.floor(min / step + 1e-9) * step
	while (low + 2 * step < top) {
		step = niceStep(step * 1.01)
		low = Math.floor(min / step + 1e-9) * step
	}
	return [clean(low), clean(low + step), clean(low + 2 * step)]
}

/** Where `value` sits between the lowest and highest tick: 0 at the bottom, 1 at the top. */
export function fraction(value: number, ticks: readonly number[]): number {
	const low = ticks[0] ?? 0
	const high = ticks[ticks.length - 1] ?? 1
	return (value - low) / (high - low)
}

const NUMBER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

/** A number with thousands separators and at most two decimals ("1,200", "0.25"). */
export function formatNumber(value: number): string {
	return NUMBER.format(value)
}
