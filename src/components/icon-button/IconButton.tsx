import * as stylex from "@stylexjs/stylex"
import { press } from "../../lib/styled"
import { color, corner, focusRing, space } from "../../tokens.stylex"
import { Tooltip } from "../tooltip/Tooltip"
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react"

const FORCED = "@media (forced-colors: active)"

/**
 * `.ib`: a circle that holds one glyph. Nothing at rest, an ink wash under the pointer, the
 * name in a tooltip; a 6px signal dot in the corner when it counts something.
 */

const styles = stylex.create({
	root: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":hover": color.wash },
		borderRadius: corner.shape,
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
		// Forced colors drop the hover wash, which is the only edge the circle has: draw one instead.
		outline: {
			default: "none",
			":hover:not(:disabled)": { default: null, [FORCED]: "1px solid ButtonText" },
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: 2,
		padding: 0,
		placeItems: "center",
		position: "relative",
		width: "2.25rem",
	},
	current: { color: color.text },
	open: { backgroundColor: color.wash, color: color.text },
	sm: { height: "2rem", width: "2rem" },
	xs: { height: "1.75rem", width: "1.75rem" },
	// 數字不畫,只有一顆 6px 的 signal 點說「有新的」
	badge: {
		backgroundColor: color.signal,
		borderRadius: corner.shape,
		// 數字只給讀屏器:字級 0,畫出來的只有那顆點
		fontSize: 0,
		height: 6,
		lineHeight: 0,
		overflow: "hidden",
		insetInlineEnd: space.xxs,
		position: "absolute",
		top: space.xxs,
		width: 6,
	},
})

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
	/** The only place the name is written: the tooltip and the accessible name. */
	label: string
	/** Which side of the button the tooltip opens on. @default "right" */
	side?: "top" | "bottom" | "left" | "right"
	/** `aria-current`: the page this button stands for is the one open. */
	current?: boolean
	/** Pressed open: the popover it owns is showing. */
	open?: boolean
	/** The circle's diameter: `md` 36px, `sm` 32px, `xs` 28px. @default "md" */
	size?: "md" | "sm" | "xs"
	/** A 6px signal dot in the corner when the count is above 0; the number is only read aloud. */
	badge?: number
	/** The one icon the button shows. */
	children: ReactNode
	/** A ref to the `<button>` element. */
	ref?: Ref<HTMLButtonElement>
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A round button that holds one icon, named by a tooltip. Native `<button>` props pass through. */
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
