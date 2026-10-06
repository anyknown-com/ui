import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId } from "react"
import { styled } from "../../lib/styled"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"
import { useRadioGroup } from "./RadioGroup"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	root: {
		display: "flex",
		gap: space.xs,
		alignItems: "flex-start",
		cursor: { default: "pointer", ":has(:disabled)": "not-allowed" },
		opacity: { default: 1, ":has(:disabled)": 0.5 },
		fontFamily: font.body,
	},
	card: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: corner.control,
		paddingBlock: space.sm,
		paddingInline: space.sm,
		transitionProperty: "border-color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
	},
	cardOn: { borderColor: color.accent, backgroundColor: color.accentSubtle },
	input: { position: "absolute", opacity: 0, width: "1.05rem", height: "1.05rem", margin: 0 },
	dot: {
		flex: "none",
		boxSizing: "border-box",
		display: "grid",
		placeItems: "center",
		width: "1.05rem",
		height: "1.05rem",
		marginTop: "0.16rem",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: color.borderControl,
		borderRadius: corner.pill,
		backgroundColor: color.bg,
		transitionProperty: "border-color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":has(:focus-visible)": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	// 選中是墨色實心,中間一顆 accentText 的點(跟 checkbox 的勾同一個配色)
	dotOn: { borderColor: color.accent, backgroundColor: color.accent },
	fill: {
		width: "0.4rem",
		height: "0.4rem",
		borderRadius: corner.pill,
		backgroundColor: color.accentText,
		scale: "0",
		transitionProperty: "scale",
		transitionDuration: { default: "160ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	fillOn: { scale: "1" },
	labelText: { display: "block", fontWeight: 500, fontSize: type.t2, color: color.text },
	description: { display: "block", fontSize: type.t1, color: color.textMuted },
})

export type RadioProps = Omit<ComponentProps<"input">, "type" | "value" | "children"> & {
	value: string
	label?: ReactNode
	description?: ReactNode
}

export function Radio({ value, label, description, onChange, disabled, ...props }: RadioProps) {
	const group = useRadioGroup()
	const base = useId()
	const labelId = `${base}label`
	const descriptionId = `${base}description`
	const { invalid: _invalid, id: _fieldId, ...field } = useFieldControl(props)
	const checked = group.value === value
	const describedBy = [description != null ? descriptionId : null, field["aria-describedby"]]
		.filter(Boolean)
		.join(" ")

	return (
		<label
			{...stylex.props(
				styles.root,
				group.variant === "card" && styles.card,
				group.variant === "card" && checked && styles.cardOn,
			)}
		>
			<span {...stylex.props(styles.dot, checked && styles.dotOn)}>
				<input
					type="radio"
					{...props}
					{...field}
					name={group.name}
					value={value}
					checked={checked}
					aria-labelledby={label != null ? labelId : undefined}
					aria-describedby={describedBy || undefined}
					disabled={disabled ?? field.disabled ?? group.disabled}
					onChange={(event) => {
						if (event.currentTarget.checked) group.select(value)
						onChange?.(event)
					}}
					{...styled(props, styles.input)}
				/>
				<span aria-hidden="true" {...stylex.props(styles.fill, checked && styles.fillOn)} />
			</span>
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
		</label>
	)
}
