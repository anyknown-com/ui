import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ElementType } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, font, type } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		margin: 0,
		fontFamily: font.body,
		color: color.text,
		lineHeight: type.snug,
	},
	display: {
		fontFamily: font.display,
		fontSize: type.t7,
		fontWeight: 600,
		lineHeight: type.dense,
		letterSpacing: "-0.01em",
	},
	title: {
		fontFamily: font.display,
		fontSize: type.t5,
		fontWeight: 600,
		lineHeight: type.dense,
	},
	// 內文 15px、行高 1.6 (docs/plans/02-tactile.md)
	body: { fontSize: type.t3, lineHeight: type.body },
	caption: { fontSize: type.t2, color: color.textMuted },
	mono: { fontFamily: font.mono, fontSize: type.t2 },
})

export type TextProps = ComponentProps<"p"> & {
	/** The element to render, such as `"h1"` or `"span"`. @default "p" */
	as?: ElementType
	/** The type style: `display` and `title` for headings, `body` for reading text, `caption` for muted small print, `mono` for code-like text. @default "body" */
	variant?: "display" | "title" | "body" | "caption" | "mono"
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

/** Text in one of the library's type styles, rendered as any element. */
export function Text({ as: Tag = "p", variant = "body", sx, ...props }: TextProps) {
	return <Tag {...props} {...styled(props, styles.base, styles[variant], sx)} />
}
