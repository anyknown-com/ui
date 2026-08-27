import { useCallback, useRef, useState } from "react"

export function useControllableState<T>(
	controlled: T | undefined,
	defaultValue: T,
	onChange?: (value: T) => void,
): [T, (value: T | ((prev: T) => T)) => void] {
	const [uncontrolled, setUncontrolled] = useState(defaultValue)
	const value = controlled !== undefined ? controlled : uncontrolled
	const valueRef = useRef(value)
	valueRef.current = value

	const set = useCallback(
		(next: T | ((prev: T) => T)) => {
			const resolved = typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next
			valueRef.current = resolved
			setUncontrolled(resolved)
			onChange?.(resolved)
		},
		[onChange],
	)

	return [value, set]
}
