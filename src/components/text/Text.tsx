import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ElementType } from "react"
import { color, font, text } from "../../tokens.stylex"

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
		fontWeight: 500,
		lineHeight: text.leadingTight,
		letterSpacing: "-0.01em",
	},
	title: {
		fontFamily: font.display,
		fontSize: text.xl,
		fontWeight: 500,
		lineHeight: text.leadingTight,
	},
	body: { fontSize: text.base },
	caption: { fontSize: text.sm, color: color.textMuted },
	mono: { fontFamily: font.mono, fontSize: text.sm },
})

type TextProps = ComponentProps<"p"> & {
	as?: ElementType
	variant?: "display" | "title" | "body" | "caption" | "mono"
}

export function Text({ as: Tag = "p", variant = "body", ...props }: TextProps) {
	return <Tag {...props} {...stylex.props(styles.base, styles[variant])} />
}
