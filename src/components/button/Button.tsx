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

// 織成的實心(TEXTURE-GUIDE):沒有 background,實心由紗織成;
// 動態全由觸點決定 — 帶動 + 窩 + 掃光(press 全套),幾何在 client 端由
// SilkBody 以固定種子現織(同尺寸恆定)。reduced-motion 時靜態織紋。
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
		transitionProperty: "color",
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
	// filter = 整塊布的落影(§3.3);ghost 是疏織,不落影
	primary: { color: color.accentText, filter: yarn.shadow },
	secondary: { color: color.text, filter: yarnSecondary.shadow },
	ghost: { color: color.textMuted, filter: yarnGhost.shadow },
	danger: { color: color.accentText, filter: yarnDanger.shadow },
	// 「白底紅字」的織體版:份量走 ghost 疏織(不與 primary 打架),
	// 語意走 danger token(和 interaction-card 收據列 rejected 的 ✓ 同一個 token)
	dangerGhost: { color: color.danger, filter: yarnGhost.shadow },
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

type ButtonProps = ComponentProps<"button"> & {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "dangerGhost"
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
			{...styled(props, styles.base, styles[size], icon && styles[ICON_SIZE[size]], styles[variant], sx)}
		>
			<svg ref={silk} aria-hidden="true" {...stylex.props(styles.silk)} />
			<span {...stylex.props(styles.label)}>{children}</span>
		</button>
	)
}
