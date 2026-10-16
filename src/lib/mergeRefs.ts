import type { Ref } from "react"

/**
 * Point `ref` at `value`. Returns the cleanup to hand back from a React 19 ref callback: the one
 * the caller's callback returned, or one that clears the ref. A `null` value is the old detach
 * call and returns nothing.
 */
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null): (() => void) | undefined {
	if (typeof ref === "function") {
		const cleanup = ref(value)
		if (value === null) return undefined
		return typeof cleanup === "function" ? cleanup : () => ref(null)
	}
	if (ref && typeof ref === "object") {
		const holder = ref as { current: T | null }
		holder.current = value
		if (value === null) return undefined
		return () => {
			holder.current = null
		}
	}
	return undefined
}
