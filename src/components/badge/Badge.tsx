import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StyleArg, reset, styled } from "../../lib/styled"
import { color, font, radius, space, text } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		fontFamily: font.body,
		fontSize: text.xs,
		fontWeight: 500,
		lineHeight: 1,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		borderRadius: radius.full,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "transparent",
	},
	neutral: { backgroundColor: color.surface, borderColor: color.border, color: color.textMuted },
	accent: { backgroundColor: color.accentSubtle, color: color.accent },
	success: { backgroundColor: color.success, color: color.bg },
	danger: { backgroundColor: color.dangerSubtle, color: color.danger },
	outline: { borderColor: color.borderStrong, color: color.text },
	mono: {
		fontFamily: font.mono,
		backgroundColor: color.surface,
		borderColor: color.border,
		color: color.textMuted,
		letterSpacing: "0.02em",
	},
	dot: {
		width: "0.4rem",
		height: "0.4rem",
		borderRadius: radius.full,
		backgroundColor: "currentColor",
		flex: "none",
	},
	dotAccent: { color: color.accent },
	dotFaint: { color: color.textFaint },
	dotDanger: { color: color.danger },
	dotWarning: { color: color.warning },
	count: { fontFamily: font.mono, fontSize: "0.7rem", fontWeight: 600, lineHeight: 1 },
	remove: {
		position: "relative",
		display: "grid",
		placeItems: "center",
		width: "1rem",
		height: "1rem",
		// 圓鈕比字高:負的 block margin 讓它不撐高 chip(跟其他 badge 等高)
		marginBlock: "-0.2rem",
		marginInlineEnd: "-0.2rem",
		borderRadius: radius.full,
		cursor: "pointer",
		color: "inherit",
		opacity: { default: 0.7, ":hover": 1, ":focus-visible": 1 },
		backgroundColor: {
			default: "transparent",
			":hover": "color-mix(in srgb, currentColor 14%, transparent)",
		},
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 1,
		// 看起來 16px、可點 24px(WCAG 2.2 target size),不影響版面
		"::after": { content: '""', position: "absolute", inset: "-0.25rem" },
	},
})

const DOT_TONES = {
	accent: styles.dotAccent,
	faint: styles.dotFaint,
	danger: styles.dotDanger,
	warning: styles.dotWarning,
} as const

export type BadgeProps = Omit<ComponentProps<"span">, "color"> & {
	variant?: "neutral" | "accent" | "success" | "danger" | "outline" | "mono"
	dot?: keyof typeof DOT_TONES
	count?: number
	sx?: StyleArg
}

export function Badge({ variant = "neutral", dot, count, children, sx, ...props }: BadgeProps) {
	return (
		<span {...props} {...styled(props, styles.base, styles[variant], sx)}>
			{dot != null && <span aria-hidden="true" {...stylex.props(styles.dot, DOT_TONES[dot])} />}
			{children}
			{count != null && <span {...stylex.props(styles.count)}>{count}</span>}
		</span>
	)
}

export type ChipProps = BadgeProps & {
	onRemove?: () => void
	removeLabel: string
}

export function Chip({ onRemove, removeLabel, variant = "outline", children, ...props }: ChipProps) {
	return (
		<Badge variant={variant} {...props}>
			{children}
			{onRemove != null && (
				<button
					type="button"
					aria-label={removeLabel}
					onClick={onRemove}
					{...stylex.props(reset.control, styles.remove)}
				>
					<svg
						width="8"
						height="8"
						viewBox="0 0 8 8"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						aria-hidden="true"
					>
						<path d="m1 1 6 6M7 1 1 7" />
					</svg>
				</button>
			)}
		</Badge>
	)
}
