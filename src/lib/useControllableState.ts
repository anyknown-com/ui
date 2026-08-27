import { useCallback, useRef, useState } from "react"

export function useControllableState<T>(
	controlled: T | undefined,
	defaultValue: T,
	onChange?: (value: T) => void,
): [T, (value: T | ((prev: T) => T)) => void] {
	const [uncontrolled, setUncontrolled] = useState(defaultValue)
	const isControlled = controlled !== undefined
	const valueRef = useRef(uncontrolled)
	valueRef.current = isControlled ? controlled : uncontrolled

	const set = useCallback(
		(next: T | ((prev: T) => T)) => {
			const resolved = typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next
			if (!isControlled) setUncontrolled(resolved)
			onChange?.(resolved)
		},
		[isControlled, onChange],
	)

	return [valueRef.current, set]
}
