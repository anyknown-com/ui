import * as stylex from "@stylexjs/stylex"
import type { CompiledStyles, InlineStyles, StyleXArray } from "@stylexjs/stylex/lib/types/StyleXTypes"
import type { CSSProperties } from "react"

export type StyleArg = StyleXArray<
	(null | undefined | CompiledStyles) | boolean | Readonly<[CompiledStyles, InlineStyles]>
>

type CallerStyleProps = { className?: string; style?: CSSProperties }

/** Merges StyleX output with the caller's own className/style instead of replacing them. */
export function styled(
	caller: CallerStyleProps,
	...styles: StyleArg[]
): { className?: string; style?: CSSProperties } {
	const applied = stylex.props(...styles)
	const className = [applied.className, caller.className].filter(Boolean).join(" ")
	const hasStyle = applied.style != null || caller.style != null
	return {
		className: className || undefined,
		style: hasStyle ? { ...applied.style, ...caller.style } : undefined,
	}
}
