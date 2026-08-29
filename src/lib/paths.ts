export const UNWEAVE_PATH = buildUnweave()

function buildUnweave(width = 320, amplitude = 1.4, period = 34, mid = 3, step = 10) {
	let d = ""
	for (let x = 0; x <= width; x += step) {
		d += `${d ? "L" : "M"}${x},${(mid + amplitude * Math.sin(x / period)).toFixed(1)}`
	}
	return d
}

// Handoff receipt — two loose ends knotted together when the row opens.
export const KNOT_LEAD = "M1 7h13"
export const KNOT_LOOP = "M1 8 C3 3 8.5 2 10 5.5 C11.5 9 6.5 11 5 7.5 C3.8 4.7 8 2.5 14 7.5"
