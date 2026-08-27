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
