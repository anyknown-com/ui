const TAU = Math.PI * 2

function seeded(seed: number) {
	return () => (seed = (seed * 16807) % 2147483647) / 2147483647
}

const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
const smoothstep = (t: number) => {
	const x = clamp01(t)
	return x * x * (3 - 2 * x)
}

// weave — five fibres that run loose ahead of the progress front and tighten
// into a regular braid behind it. The front overscans by 70px so 100% is
// tight across the full width.
export const WEAVE_WIDTH = 400
export const WEAVE_HEIGHT = 26
const WEAVE_FIBRES = (() => {
	const rand = seeded(42)
	return Array.from({ length: 5 }, (_, i) => ({
		phase: (i / 5) * TAU,
		looseLength: 100 + rand() * 80,
		looseAmplitude: 4.5 + rand() * 3.5,
		loosePhase: rand() * TAU,
		wobblePhase: rand() * TAU,
		opacity: 1 - i * 0.15,
	}))
})()

export type WeaveFibre = { d: string; opacity: number }

export function weaveFibres(percent: number): WeaveFibre[] {
	const front = clamp01(percent / 100) * (WEAVE_WIDTH + 70)
	return WEAVE_FIBRES.map((fibre) => {
		let d = ""
		for (let x = 0; x <= WEAVE_WIDTH; x += 6) {
			const loose =
				13 +
				fibre.looseAmplitude * Math.sin((x / fibre.looseLength) * TAU + fibre.loosePhase) +
				2.6 * Math.sin((x / 53) * TAU + fibre.wobblePhase)
			const tight = 13 + 6.4 * Math.sin((x / 26) * TAU + fibre.phase)
			const y = loose + (tight - loose) * smoothstep((front - x) / 70)
			d += `${x ? "L" : "M"}${x},${y.toFixed(1)}`
		}
		return { d, opacity: fibre.opacity }
	})
}

// yarn determinate — how a ball of yarn is actually wound: a bundle of parallel
// great-circle arcs in one direction, then the next bundle turned, and an
// outline circle to finish.
export const BALL_STRANDS = (() => {
	const radius = 9.3
	const centre = 12
	const families = [25, 70, 115, 160].map((deg) => (deg * Math.PI) / 180)
	const offsets = [-6.6, -3.4, -0.8, 1.8, 4.4, 7]
	const strands: string[] = []
	for (const theta of families) {
		const normal = [Math.cos(theta), Math.sin(theta)]
		const along = [-Math.sin(theta), Math.cos(theta)]
		for (const offset of offsets) {
			const half = Math.sqrt(radius * radius - offset * offset)
			const mx = centre + normal[0] * offset
			const my = centre + normal[1] * offset
			const bulge = offset * 0.62
			const cx = mx + normal[0] * bulge
			const cy = my + normal[1] * bulge
			strands.push(
				`M${(mx - along[0] * half).toFixed(2)},${(my - along[1] * half).toFixed(2)} Q${cx.toFixed(2)},${cy.toFixed(2)} ${(mx + along[0] * half).toFixed(2)},${(my + along[1] * half).toFixed(2)}`,
			)
		}
	}
	strands.push(`M${centre},${centre - radius} A${radius},${radius} 0 1 1 ${centre - 0.01},${centre - radius}`)
	return strands
})()

export function ballDashOffset(percent: number, index: number): number {
	return 100 - Math.max(0, Math.min(100, percent * BALL_STRANDS.length - index * 100))
}

// yarn indeterminate — one cord fighting itself: a lissajous knot whose phases
// drift at different rates, redrawn per frame.
export function knotPath(t: number): string {
	let d = ""
	for (let a = 0; a <= TAU + 0.001; a += 0.14) {
		const x = 12 + 6.3 * Math.sin(2 * a + t * 0.9) + 2.9 * Math.sin(5 * a + t * 1.7)
		const y = 12 + 6.3 * Math.cos(3 * a + t * 1.3) + 2.9 * Math.cos(2 * a + t * 0.6)
		d += `${d ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`
	}
	return d
}

// tidy — a loom: horizontal, vertical and both diagonals laid down layer by
// layer, two passes, until the cloth is full.
export const LOOM_WIDTH = 400
export const LOOM_HEIGHT = 90
export const LOOM_LAYERS = 8

const LOOM_DIRECTIONS = [
	() => {
		let d = ""
		for (let y = 6; y <= 84; y += 8) d += `M0,${y} L400,${y} `
		return d
	},
	() => {
		let d = ""
		for (let x = 6; x <= 394; x += 11) d += `M${x},0 L${x},90 `
		return d
	},
	() => {
		let d = ""
		for (let c = -84; c <= 396; c += 15) d += `M${c},90 L${c + 90},0 `
		return d
	},
	() => {
		let d = ""
		for (let c = -84; c <= 396; c += 15) d += `M${c},0 L${c + 90},90 `
		return d
	},
]

export const LOOM_PATHS = Array.from({ length: LOOM_LAYERS }, (_, i) => LOOM_DIRECTIONS[i % 4]())

export function loomDashOffset(percent: number, index: number): number {
	return 100 - Math.max(0, Math.min(100, (percent / (100 / LOOM_LAYERS) - index) * 100))
}

export function loomStageIndex(percent: number): number {
	return Math.min(LOOM_LAYERS - 1, Math.floor(percent / (100 / LOOM_LAYERS)))
}
