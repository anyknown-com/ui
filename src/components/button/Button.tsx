import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { assignRef } from "../../lib/mergeRefs"
import { press, type StyleArg, styled } from "../../lib/styled"
import { color, corner, font, space, type } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		position: "relative",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: space.xs,
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: type.dense,
		borderRadius: corner.pill,
		borderWidth: 0,
		backgroundColor: "transparent",
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.5 },
		// 按下去壓一點點與轉場是共用的 press.button
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	// 膠囊三階 48 / 40 / 32,預設 40 是觸控的高。xs 28 只給擠的工具列,不在三階裡
	lg: {
		paddingBlock: space.xs,
		paddingInline: space.lg,
		minHeight: "3rem",
		fontSize: type.t3,
	},
	md: {
		paddingBlock: space.xs,
		paddingInline: space.md,
		minHeight: "2.5rem",
	},
	sm: {
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		minHeight: "2rem",
		fontSize: type.t2,
	},
	xs: {
		paddingBlock: 0,
		paddingInline: space.xs,
		minHeight: "1.75rem",
		fontSize: type.t1,
		gap: space.xxs,
	},
	// 圖示鈕:正圓,直徑跟著該階的高,沒有左右內距
	iconLg: { paddingInline: 0, width: "3rem" },
	iconMd: { paddingInline: 0, width: "2.5rem" },
	iconSm: { paddingInline: 0, width: "2rem" },
	iconXs: { paddingInline: 0, width: "1.75rem" },
	primary: {
		color: color.accentText,
		backgroundColor: {
			default: color.accent,
			":hover": `color-mix(in srgb, ${color.accent} 86%, ${color.bg})`,
		},
	},
	// 凹下去的一塊:accentSubtle 底、沒有框;hover 再深一階
	secondary: {
		color: color.text,
		backgroundColor: { default: color.accentSubtle, ":hover": color.layer5 },
	},
	ghost: {
		color: color.textMuted,
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
	},
	danger: {
		color: color.onDangerSolid,
		backgroundColor: {
			default: color.dangerSolid,
			":hover": `color-mix(in srgb, ${color.dangerSolid} 86%, ${color.bg})`,
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

export type ButtonProps = ComponentProps<"button"> & {
	variant?: Variant
	size?: "xs" | "sm" | "md" | "lg"
	/** Square, no side padding — for a button whose whole label is one icon. */
	icon?: boolean
	sx?: StyleArg
}

const ICON_SIZE = { xs: "iconXs", sm: "iconSm", md: "iconMd", lg: "iconLg" } as const
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
			{...styled(
				props,
				styles.base,
				styles[size],
				icon && styles[ICON_SIZE[size]],
				styles[variant],
				press.button,
				sx,
			)}
		>
			<span {...stylex.props(styles.label)}>{children}</span>
		</button>
	)
}
