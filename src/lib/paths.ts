export const COIL_PATH = buildCoil()

function buildCoil(turns = 2.3, cx = 12, cy = 12, maxRadius = 6.4) {
	const total = turns * Math.PI * 2
	let d = ""
	for (let a = 0; a <= total; a += 0.22) {
		const r = 1 + (a / total) * (maxRadius - 1)
		d += `${d ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
	}
	return d
}

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
