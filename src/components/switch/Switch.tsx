import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId } from "react"
import { FabricPattern } from "../../lib/Fabric"
import { styled } from "../../lib/styled"
import { useSvgId } from "../../lib/svgId"
import { useControllableState } from "../../lib/useControllableState"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	root: {
		display: "flex",
		gap: space.sm,
		alignItems: "flex-start",
		justifyContent: "space-between",
		cursor: { default: "pointer", ":has(:disabled)": "not-allowed" },
		opacity: { default: 1, ":has(:disabled)": 0.5 },
		fontFamily: font.body,
	},
	input: { position: "absolute", opacity: 0, width: "2.75rem", height: "1.4rem", margin: 0 },
	track: {
		flex: "none",
		width: "2.75rem",
		height: "1.4rem",
		marginTop: "0.1rem",
		borderRadius: radius.full,
		outline: { default: "none", ":has(:focus-visible)": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	svg: { width: "100%", height: "100%", display: "block", overflow: "visible" },
	guide: { stroke: color.borderStrong, strokeWidth: 1.5, strokeLinecap: "round", fill: "none" },
	pill: {
		stroke: color.accent,
		strokeWidth: 1.3,
		width: 0,
		opacity: 0,
		scale: 0,
		transformBox: "fill-box",
		transformOrigin: "center",
		transitionProperty: "scale, width, opacity",
		transitionDuration: { default: `${motion.normal}, 0s, 0s`, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-in",
		transitionDelay: { default: `0s, ${motion.normal}, ${motion.normal}`, [REDUCED]: "0s" },
	},
	pillOn: {
		width: 42,
		opacity: 1,
		scale: 1,
		transitionProperty: "width, scale, opacity",
		transitionDuration: { default: "240ms, 0s, 0s", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.32, 0.85, 0.45, 1)",
		transitionDelay: "0s",
	},
	thumb: {
		fill: color.bg,
		stroke: color.borderStrong,
		strokeWidth: 1.6,
		translate: "0 0",
		transitionProperty: "translate, stroke, fill",
		transitionDuration: { default: `250ms, ${motion.normal}, ${motion.normal}`, [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.34, 1.45, 0.6, 1)",
		transitionDelay: { default: "20ms, 0s, 0s", [REDUCED]: "0s" },
	},
	thumbOn: { translate: "22px 0", fill: color.surface, stroke: color.accent },
	labelText: { display: "block", fontWeight: 500, fontSize: text.sm, color: color.text },
	description: { display: "block", fontSize: text.xs, color: color.textMuted },
})

export type SwitchProps = Omit<ComponentProps<"input">, "type" | "role" | "children"> & {
	label?: ReactNode
	description?: ReactNode
	onCheckedChange?: (checked: boolean) => void
}

export function Switch({
	label,
	description,
	onCheckedChange,
	checked,
	defaultChecked,
	onChange,
	...props
}: SwitchProps) {
	const patternId = useSvgId("ak-fabric")
	const base = useId()
	const labelId = `${base}label`
	const descriptionId = `${base}description`
	const { invalid, ...field } = useFieldControl(props)
	const describedBy = [description != null ? descriptionId : null, field["aria-describedby"]]
		.filter(Boolean)
		.join(" ")
	const [isOn, setOn] = useControllableState(checked, defaultChecked ?? false, onCheckedChange)

	return (
		<label {...stylex.props(styles.root)}>
			{(label != null || description != null) && (
				<span>
					{label != null && (
						<span id={labelId} {...stylex.props(styles.labelText)}>
							{label}
						</span>
					)}
					{description != null && (
						<span id={descriptionId} {...stylex.props(styles.description)}>
							{description}
						</span>
					)}
				</span>
			)}
			<span {...stylex.props(styles.track)}>
				<input
					type="checkbox"
					role="switch"
					{...props}
					{...field}
					aria-invalid={invalid || undefined}
					aria-labelledby={label != null ? labelId : undefined}
					aria-describedby={describedBy || undefined}
					checked={isOn}
					aria-checked={isOn}
					onChange={(event) => {
						setOn(event.currentTarget.checked)
						onChange?.(event)
					}}
					{...styled(props, styles.input)}
				/>
				<svg viewBox="0 0 44 22" aria-hidden="true" {...stylex.props(styles.svg)}>
					<FabricPattern id={patternId} />
					<path d="M11,11 H33" {...stylex.props(styles.guide)} />
					<rect
						x="1"
						y="1"
						height="20"
						rx="10"
						fill={`url(#${patternId})`}
						{...stylex.props(styles.pill, isOn && styles.pillOn)}
					/>
					<circle cx="11" cy="11" r="8.4" {...stylex.props(styles.thumb, isOn && styles.thumbOn)} />
				</svg>
			</span>
		</label>
	)
}
