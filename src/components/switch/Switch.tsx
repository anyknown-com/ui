import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, font, motion, shadow, space, text } from "../../tokens.stylex"
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
		position: "relative",
		boxSizing: "border-box",
		width: "2.75rem",
		height: "1.4rem",
		marginTop: "0.1rem",
		borderRadius: corner.pill,
		backgroundColor: color.borderControl,
		transitionProperty: "background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":has(:focus-visible)": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	trackOn: { backgroundColor: color.accent },
	thumb: {
		position: "absolute",
		insetBlockStart: 2,
		insetInlineStart: 2,
		width: "calc(1.4rem - 4px)",
		height: "calc(1.4rem - 4px)",
		borderRadius: corner.pill,
		backgroundColor: "#FFFFFF",
		boxShadow: shadow.rest,
		translate: "0 0",
		transitionProperty: "translate, background-color",
		transitionDuration: { default: "180ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	thumbOn: { translate: "1.35rem 0", backgroundColor: color.accentText },
	labelText: { display: "block", fontWeight: 500, fontSize: text.sm, color: color.text },
	description: { display: "block", fontSize: text.xs, color: color.textMuted },
})

export type SwitchProps = Omit<ComponentProps<"input">, "type" | "role" | "children"> & {
	label?: ReactNode
	description?: ReactNode
	onCheckedChange?: (checked: boolean) => void
	sx?: StyleArg
}

export function Switch({
	label,
	description,
	onCheckedChange,
	checked,
	defaultChecked,
	onChange,
	sx,
	...props
}: SwitchProps) {
	const base = useId()
	const labelId = `${base}label`
	const descriptionId = `${base}description`
	const { invalid, ...field } = useFieldControl(props)
	const describedBy = [description != null ? descriptionId : null, field["aria-describedby"]]
		.filter(Boolean)
		.join(" ")
	const [isOn, setOn] = useControllableState(checked, defaultChecked ?? false, onCheckedChange)

	return (
		<label {...stylex.props(styles.root, sx)}>
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
			<span {...stylex.props(styles.track, isOn && styles.trackOn)}>
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
				<span aria-hidden="true" {...stylex.props(styles.thumb, isOn && styles.thumbOn)} />
			</span>
		</label>
	)
}
