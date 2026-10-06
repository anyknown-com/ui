import * as stylex from "@stylexjs/stylex"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import type { ButtonHTMLAttributes, Ref } from "react"

/** `.ghost`: a word that is a button. 28px, muted until the pointer is on it; `danger` is warning. */

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const PHONE = "@media (max-width: 45rem)"

const styles = stylex.create({
	root: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":hover": color.layer3 },
		borderRadius: corner.pill,
		borderStyle: "none",
		borderWidth: 0,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: { default: "pointer", ":disabled": "default" },
		display: "inline-flex",
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 400,
		gap: space.xxs,
		height: 28,
		lineHeight: type.body,
		margin: 0,
		minHeight: { default: 0, [PHONE]: 40 },
		opacity: { default: 1, ":disabled": 0.4 },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
		paddingBlock: 0,
		paddingInline: space.xs,
		textDecoration: "none",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionProperty: "background-color, color",
		transitionTimingFunction: motion.easeOut,
		whiteSpace: "nowrap",
	},
	danger: {
		backgroundColor: {
			default: "transparent",
			":hover": `color-mix(in srgb, ${color.warning} 10%, transparent)`,
		},
		color: { default: color.warning, ":hover": color.warning },
	},
})

export type GhostProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
	danger?: boolean
	ref?: Ref<HTMLButtonElement>
	sx?: stylex.StyleXStyles
}

export function Ghost({ danger = false, sx, ...props }: GhostProps) {
	return <button type="button" {...props} {...stylex.props(styles.root, danger && styles.danger, sx)} />
}

export type GhostLinkProps = {
	href: string
	children: React.ReactNode
	external?: boolean
	sx?: stylex.StyleXStyles
}

/** The same word, as a link that leaves the app. */
export function GhostLink({ href, children, external = false, sx }: GhostLinkProps) {
	return (
		<a
			href={href}
			{...(external ? { target: "_blank", rel: "noreferrer" } : {})}
			{...stylex.props(styles.root, sx)}
		>
			{children}
		</a>
	)
}
