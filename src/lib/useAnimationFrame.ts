import { useEffect, useRef } from "react"

export function useAnimationFrame(active: boolean, onFrame: (elapsedMs: number) => void) {
	const callback = useRef(onFrame)
	callback.current = onFrame

	useEffect(() => {
		if (!active) return
		let frame = 0
		let start = 0
		const tick = (now: number) => {
			if (!start) start = now
			callback.current(now - start)
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [active])
}
