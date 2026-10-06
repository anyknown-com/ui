import * as stylex from "@stylexjs/stylex"
import { color, corner, font, motion, radius, shadow, space, type } from "../../tokens.stylex"

/** `.seg`: a few words on a sunken track; the chosen one is a sheet of paper raised on it. */

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const PHONE = "@media (max-width: 45rem)"

const styles = stylex.create({
	root: {
		alignSelf: "flex-start",
		// 在 grid 裡也只包住自己的選項:軌道拉滿整列會像一條空的輸入框
		justifySelf: "start",
		backgroundColor: color.surface,
		borderRadius: corner.control,
		display: "inline-flex",
		gap: 2,
		maxWidth: "100%",
		overflowX: { default: "visible", [PHONE]: "auto" },
		padding: space.xxs,
		scrollbarWidth: "none",
	},
	item: {
		backgroundColor: { default: "transparent", ":hover": "transparent" },
		// 內層圓角 = 外框 12 − 內距 4
		borderRadius: radius.md,
		borderStyle: "none",
		borderWidth: 0,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: "pointer",
		fontFamily: font.body,
		fontSize: type.t2,
		height: { default: 28, [PHONE]: 40 },
		lineHeight: type.body,
		margin: 0,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
		paddingBlock: 0,
		paddingInline: space.sm,
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionProperty: "background-color, color, box-shadow",
		whiteSpace: "nowrap",
	},
	on: { backgroundColor: color.surfaceRaised, boxShadow: shadow.rest, color: color.text },
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
