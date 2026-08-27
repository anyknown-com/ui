import { useCallback, useEffect, useRef, useState } from "react"

export function useCopy(resetAfterMs = 2000) {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => () => clearTimeout(timer.current), [])

	const copy = useCallback(
		async (value: string) => {
			try {
				await navigator.clipboard.writeText(value)
			} catch {
				return false
			}
			setCopied(true)
			clearTimeout(timer.current)
			timer.current = setTimeout(() => setCopied(false), resetAfterMs)
			return true
		},
		[resetAfterMs],
	)

	return { copied, copy }
}
