import { DirectionProvider as BaseDirectionProvider } from "@base-ui/react/direction-provider"
import type { ReactNode } from "react"

export type DirectionProviderProps = {
	/** The reading direction of everything inside. @default "ltr" */
	direction?: "ltr" | "rtl"
	/** The part of the app that reads in this direction, usually all of it. */
	children?: ReactNode
}

/**
 * Tells the components inside which way the text reads. Under `"rtl"`, ArrowLeft moves to the
 * next tab, opens a dropdown submenu and raises a `Slider`; ArrowRight does the reverse.
 *
 * It renders no element and sets no `dir`: the browser lays out from the `dir` attribute, and
 * the components read their keys from this provider. An RTL app needs both, once, at the root.
 * Portalled layers (menus, toasts) inherit `dir` from `<html>`, so set it there.
 *
 * ```tsx
 * <html dir="rtl">…<DirectionProvider direction="rtl"><App /></DirectionProvider>
 * ```
 */
export function DirectionProvider({ direction = "ltr", children }: DirectionProviderProps) {
	return <BaseDirectionProvider direction={direction}>{children}</BaseDirectionProvider>
}
