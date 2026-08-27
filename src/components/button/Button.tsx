import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: space.xs,
		fontFamily: font.body,
		fontSize: text.sm,
		fontWeight: 500,
		lineHeight: text.leadingTight,
		borderRadius: radius.md,
		borderWidth: 1,
		borderStyle: "solid",
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.5 },
		transitionProperty: "background-color, border-color, color",
		transitionDuration: motion.fast,
		transitionTimingFunction: motion.ease,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	md: {
		paddingBlock: space.xs,
		paddingInline: space.md,
		minHeight: "2.25rem",
	},
	sm: {
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		minHeight: "1.75rem",
		fontSize: text.xs,
	},
	primary: {
		backgroundColor: color.accent,
		borderColor: color.accent,
		color: color.accentText,
		opacity: { default: 1, ":hover": 0.9, ":disabled": 0.5 },
	},
	secondary: {
		backgroundColor: { default: color.surface, ":hover": color.accentSubtle },
		borderColor: color.border,
		color: color.text,
	},
	ghost: {
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		borderColor: "transparent",
		color: color.textMuted,
	},
	danger: {
		backgroundColor: color.danger,
		borderColor: color.danger,
		color: color.accentText,
	},
})

type ButtonProps = ComponentProps<"button"> & {
	variant?: "primary" | "secondary" | "ghost" | "danger"
	size?: "sm" | "md"
}

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
	return <button type="button" {...props} {...stylex.props(styles.base, styles[size], styles[variant])} />
}
