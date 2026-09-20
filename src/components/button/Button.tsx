import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, useCallback } from "react"
import { assignRef } from "../../lib/mergeRefs"
import { type SilkPalette, SilkBody } from "../../lib/silk"
import { type StyleArg, styled } from "../../lib/styled"
import {
	color,
	font,
	motion,
	space,
	text,
	yarn,
	yarnDanger,
	yarnGhost,
	yarnSecondary,
} from "../../tokens.stylex"

// 預設是平的實心:一個 background、hover 升一階。織體(TEXTURE-GUIDE:沒有
// background、實心由紗織成、動態全由觸點決定)改成 `woven` 才開 —— 一個畫面上
// 每顆小按鈕都是布,讀起來是一排條紋,不是一塊布。
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
		borderRadius: 8, // = radius.md;織線 clip 的 rx 同步寫死在 RADIUS
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
		backgroundColor: { default: color.accent, ":hover": yarn.y0 },
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
		backgroundColor: { default: color.danger, ":hover": yarnDanger.y0 },
	},
	// 「白底紅字」:份量走 ghost,語意走 danger token(和 interaction-card 收據列
	// rejected 的 ✓ 同一個 token)
	dangerGhost: {
		color: color.danger,
		backgroundColor: { default: "transparent", ":hover": color.dangerSubtle },
	},
	// 織體:沒有 background,filter = 整塊布的落影(§3.3);ghost 是疏織,不落影
	wovenPrimary: { backgroundColor: "transparent", filter: yarn.shadow },
	wovenSecondary: { backgroundColor: "transparent", filter: yarnSecondary.shadow },
	wovenGhost: { backgroundColor: "transparent", filter: yarnGhost.shadow },
	wovenDanger: { backgroundColor: "transparent", filter: yarnDanger.shadow },
	wovenDangerGhost: { backgroundColor: "transparent", filter: yarnGhost.shadow },
	silk: {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		overflow: "hidden",
		pointerEvents: "none",
	},
	label: { position: "relative", display: "inline-flex", alignItems: "center", gap: space.xs },
})

const RADIUS = 8

function palette(vars: typeof yarn): SilkPalette {
	return vars as unknown as SilkPalette
}

const SILK: Record<string, { palette: SilkPalette; ghost?: boolean; bandMax: number }> = {
	primary: { palette: palette(yarn), bandMax: 0.75 },
	secondary: { palette: palette(yarnSecondary), bandMax: 0.5 },
	ghost: { palette: palette(yarnGhost), ghost: true, bandMax: 0.5 },
	danger: { palette: palette(yarnDanger), bandMax: 0.75 },
	dangerGhost: { palette: palette(yarnGhost), ghost: true, bandMax: 0.5 },
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost"

type ButtonProps = ComponentProps<"button"> & {
	variant?: Variant
	size?: "xs" | "sm" | "md"
	/** Square, no side padding — for a button whose whole label is one icon. */
	icon?: boolean
	/** The woven body (TEXTURE-GUIDE): for the one ceremonial action on a screen, not a row of controls. */
	woven?: boolean
	sx?: StyleArg
}

const ICON_SIZE = { xs: "iconXs", sm: "iconSm", md: "iconMd" } as const
const WOVEN = {
	primary: "wovenPrimary",
	secondary: "wovenSecondary",
	ghost: "wovenGhost",
	danger: "wovenDanger",
	dangerGhost: "wovenDangerGhost",
} as const

export function Button({
	variant = "primary",
	size = "md",
	icon = false,
	woven = false,
	children,
	ref,
	sx,
	...props
}: ButtonProps) {
	// ref callback + cleanup(React 19)管生命週期,不用 effect;
	// useCallback 鎖 identity,只有 variant 變了才重建織體
	const silk = useCallback(
		(node: SVGSVGElement | null) => {
			if (!node) return
			const body = new SilkBody(node.parentElement as HTMLElement, node, {
				...SILK[variant],
				mode: "press",
				radius: RADIUS,
			})
			return () => body.destroy()
		},
		[variant],
	)

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
				woven && styles[WOVEN[variant]],
				sx,
			)}
		>
			{woven && <svg ref={silk} aria-hidden="true" {...stylex.props(styles.silk)} />}
			<span {...stylex.props(styles.label)}>{children}</span>
		</button>
	)
}
