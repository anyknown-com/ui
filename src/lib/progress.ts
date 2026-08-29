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
