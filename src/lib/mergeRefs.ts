import type { Ref } from "react"

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
	if (typeof ref === "function") return ref(value)
	if (ref && typeof ref === "object") (ref as { current: T | null }).current = value
	return undefined
}
