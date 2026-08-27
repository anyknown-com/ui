import type { Ref } from "react"

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
	if (typeof ref === "function") {
		ref(value)
		return
	}
	if (ref && typeof ref === "object") (ref as { current: T | null }).current = value
}
