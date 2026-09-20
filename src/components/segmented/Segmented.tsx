import * as stylex from "@stylexjs/stylex"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"

/** `.seg`: a few words in one outline; the chosen one sits on a layer. */

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const PHONE = "@media (max-width: 45rem)"

const styles = stylex.create({
	root: {
		alignSelf: "flex-start",
		borderRadius: corner.md,
		boxShadow: `inset 0 0 0 1px ${color.border}`,
		display: "inline-flex",
		gap: 2,
		maxWidth: "100%",
		overflowX: { default: "visible", [PHONE]: "auto" },
		padding: 2,
		scrollbarWidth: "none",
	},
	item: {
		backgroundColor: { default: "transparent", ":hover": "transparent" },
		borderRadius: corner.sm,
		borderStyle: "none",
		borderWidth: 0,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: "pointer",
		fontFamily: font.body,
		fontSize: type.t2,
		height: { default: 28, [PHONE]: 40 },
		lineHeight: type.body,
		margin: 0,
		outline: { default: "none", ":focus-visible": `2px solid ${color.accent}` },
		outlineOffset: -2,
		paddingBlock: 0,
		paddingInline: space.sm,
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionProperty: "background-color, color",
		whiteSpace: "nowrap",
	},
	on: { backgroundColor: color.layer4, color: color.text },
})

export type SegmentedProps<T extends string> = {
	value: T
	options: { value: T; label: string }[]
	onChange: (value: T) => void
	label: string
	sx?: stylex.StyleXStyles
}

export function Segmented<T extends string>({ value, options, onChange, label, sx }: SegmentedProps<T>) {
	return (
		<div aria-label={label} {...stylex.props(styles.root, sx)}>
			{options.map((one) => (
				<button
					key={one.value}
					type="button"
					aria-pressed={one.value === value}
					onClick={() => onChange(one.value)}
					{...stylex.props(styles.item, one.value === value && styles.on)}
				>
					{one.label}
				</button>
			))}
		</div>
	)
}
