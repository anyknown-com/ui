const TAU = Math.PI * 2

export type VoiceState = "idle" | "listening" | "thinking" | "speaking"

function sample(fn: (x: number) => number) {
	let d = ""
	for (let x = 2; x <= 46; x += 1.5) d += `${d ? "L" : "M"}${x},${fn(x).toFixed(1)}`
	return d
}

// One fibre, four states: flat at rest, vibrating with the mic level while
// listening, coiled into a rolling telephone cord while thinking, and carrying
// a travelling wave while speaking.
export function voicePath(state: VoiceState, t: number, level = 0.4): string {
	if (state === "idle") return "M2,12 L46,12"

	if (state === "thinking") {
		let d = ""
		const loops = 3
		const span = 36
		for (let a = -0.6; a <= loops * TAU + 0.6; a += 0.12) {
			const b = 4 + 0.5 * Math.sin(t * 1.8)
			const x = 6 + (span * a) / (loops * TAU) - b * 0.55 * Math.sin(a + t * 2)
			const y = 13.5 - b * 0.75 * Math.cos(a + t * 2)
			d += `${d ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`
		}
		return d
	}

	if (state === "listening") {
		return sample((x) => 12 + 8.5 * level * Math.sin((x / 48) * Math.PI) * Math.sin(x / 2.6 + t * 7))
	}

	return sample((x) => 12 + 5.5 * Math.sin((x / 48) * Math.PI) * Math.sin((x / 7.5) * TAU - t * 5))
}
