import * as stylex from "@stylexjs/stylex"
import { press } from "../../lib/styled"
import { color, corner, font, ink, type } from "../../tokens.stylex"
import { Tooltip } from "../tooltip/Tooltip"
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react"

/**
 * `.ib`: a circle that holds one glyph. Nothing at rest, an ink wash under the pointer, the
 * name in a tooltip; a badge in the corner when it counts something.
 */

const styles = stylex.create({
	root: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":hover": ink.n8 },
		borderRadius: corner.pill,
		borderStyle: "none",
		borderWidth: 0,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: "pointer",
		display: "inline-grid",
		flex: "none",
		fontFamily: "inherit",
		fontSize: "inherit",
		height: "2.25rem",
		justifyItems: "center",
		lineHeight: "inherit",
		margin: 0,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
		padding: 0,
		placeItems: "center",
		position: "relative",
		width: "2.25rem",
	},
	current: { color: color.text },
	open: { backgroundColor: ink.n8, color: color.text },
	sm: { height: "2rem", width: "2rem" },
	xs: { height: "1.75rem", width: "1.75rem" },
	badge: {
		backgroundColor: color.accent,
		borderRadius: corner.pill,
		color: color.accentText,
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 500,
		height: 16,
		insetInlineEnd: 2,
		lineHeight: "16px",
		minWidth: 16,
		paddingInline: 4,
		position: "absolute",
		textAlign: "center",
		top: 2,
	},
})

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
	/** The only place the name is written: the tooltip and the accessible name. */
	label: string
	side?: "top" | "bottom" | "left" | "right"
	/** `aria-current`: the page this button stands for is the one open. */
	current?: boolean
	/** Pressed open: the popover it owns is showing. */
	open?: boolean
	size?: "md" | "sm" | "xs"
	badge?: number
	children: ReactNode
	ref?: Ref<HTMLButtonElement>
	sx?: stylex.StyleXStyles
}

export function IconButton({
	label,
	side = "right",
	current = false,
	open = false,
	size = "md",
	badge,
	children,
	sx,
	className,
	style,
	...props
}: IconButtonProps) {
	// A tooltip renders its trigger through the child and hands it a class and a style; merged.
	const own = stylex.props(
		styles.root,
		current && styles.current,
		open && styles.open,
		size === "sm" && styles.sm,
		size === "xs" && styles.xs,
		press.button,
		sx,
	)

	const button = (
		<button
			type="button"
			aria-label={label}
			{...(current ? { "aria-current": "page" as const } : {})}
			{...props}
			className={[own.className, className].filter(Boolean).join(" ")}
			style={{ ...own.style, ...style }}
		>
			{children}
			{badge !== undefined && badge > 0 && <span {...stylex.props(styles.badge)}>{badge}</span>}
		</button>
	)

	if (open) return button

	return (
		<Tooltip content={label} side={side}>
			{button}
		</Tooltip>
	)
}
