import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { assignRef } from "../../lib/mergeRefs"
import { type StyleArg, styled } from "../../lib/styled"
import { color, corner, font, motion, space, text } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		position: "relative",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: space.xs,
		fontFamily: font.body,
		fontSize: text.sm,
		fontWeight: 500,
		lineHeight: text.leadingTight,
		borderRadius: corner.btn,
		borderWidth: 0,
		backgroundColor: "transparent",
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.5 },
		transitionProperty: "color, background-color",
		transitionDuration: { default: motion.fast, "@media (prefers-reduced-motion: reduce)": "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
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
	xs: {
		paddingBlock: 0,
		paddingInline: space.xs,
		minHeight: "1.5rem",
		fontSize: text.xs,
		gap: space.xxs,
	},
	// 圖示鈕:正方,邊長跟著該階的高,沒有左右內距
	iconMd: { paddingInline: 0, width: "2.25rem" },
	iconSm: { paddingInline: 0, width: "1.75rem" },
	iconXs: { paddingInline: 0, width: "1.5rem" },
	primary: {
		color: color.accentText,
		backgroundColor: {
			default: color.accent,
			":hover": `color-mix(in srgb, ${color.accent} 86%, ${color.bg})`,
		},
	},
	secondary: {
		color: color.text,
		backgroundColor: { default: color.bone, ":hover": color.layer5 },
	},
	ghost: {
		color: color.textMuted,
		backgroundColor: { default: "transparent", ":hover": color.bone },
	},
	danger: {
		color: color.accentText,
		backgroundColor: {
			default: color.danger,
			":hover": `color-mix(in srgb, ${color.danger} 86%, ${color.bg})`,
		},
	},
	// 「白底紅字」:份量走 ghost,語意走 danger token(和 interaction-card 收據列
	// rejected 的 ✓ 同一個 token)
	dangerGhost: {
		color: color.danger,
		backgroundColor: { default: "transparent", ":hover": color.dangerSubtle },
	},
	label: { position: "relative", display: "inline-flex", alignItems: "center", gap: space.xs },
})

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost"

type ButtonProps = ComponentProps<"button"> & {
	variant?: Variant
	size?: "xs" | "sm" | "md"
	/** Square, no side padding — for a button whose whole label is one icon. */
	icon?: boolean
	sx?: StyleArg
}

const ICON_SIZE = { xs: "iconXs", sm: "iconSm", md: "iconMd" } as const
export function Button({
	variant = "primary",
	size = "md",
	icon = false,
	children,
	ref,
	sx,
	...props
}: ButtonProps) {
	return (
		<button
			type="button"
			{...props}
			ref={(element) => assignRef(ref, element)}
			{...styled(props, styles.base, styles[size], icon && styles[ICON_SIZE[size]], styles[variant], sx)}
		>
			<span {...stylex.props(styles.label)}>{children}</span>
		</button>
	)
}
