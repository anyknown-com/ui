import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ElementType } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, font, text, type } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		margin: 0,
		fontFamily: font.body,
		color: color.text,
		lineHeight: text.leadingNormal,
	},
	display: {
		fontFamily: font.display,
		fontSize: text.display,
		fontWeight: 600,
		lineHeight: text.leadingTight,
		letterSpacing: "-0.01em",
	},
	title: {
		fontFamily: font.display,
		fontSize: text.xl,
		fontWeight: 600,
		lineHeight: text.leadingTight,
	},
	// 內文 15px、行高 1.6 (docs/plans/02-tactile.md)
	body: { fontSize: type.t3, lineHeight: type.body },
	caption: { fontSize: text.sm, color: color.textMuted },
	mono: { fontFamily: font.mono, fontSize: text.sm },
})

type TextProps = ComponentProps<"p"> & {
	as?: ElementType
	variant?: "display" | "title" | "body" | "caption" | "mono"
	sx?: StyleArg
}

export function Text({ as: Tag = "p", variant = "body", sx, ...props }: TextProps) {
	return <Tag {...props} {...styled(props, styles.base, styles[variant], sx)} />
}
