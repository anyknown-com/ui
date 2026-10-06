import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId } from "react"
import { styled } from "../../lib/styled"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"
import { useRadioGroup } from "./RadioGroup"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"
const HIT = "max(24px, 1.5rem)"

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
	// 看得到的圓 17px,可以按的原生 input 是蓋在上面、置中的 24px(WCAG 2.5.8),不影響版面
	input: {
		position: "absolute",
		opacity: 0,
		width: HIT,
		height: HIT,
		insetBlockStart: `calc((100% - ${HIT}) / 2)`,
		insetInlineStart: `calc((100% - ${HIT}) / 2)`,
		margin: 0,
		cursor: "inherit",
	},
	dot: {
		position: "relative",
		flex: "none",
		boxSizing: "border-box",
		display: "grid",
		placeItems: "center",
		width: "1.05rem",
		height: "1.05rem",
		marginTop: "0.16rem",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: { default: color.borderControl, [FORCED]: "ButtonText" },
		borderRadius: corner.pill,
		backgroundColor: { default: color.bg, [FORCED]: "Canvas" },
		transitionProperty: "border-color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: {
			default: "none",
			":has(:focus-visible)": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: 2,
		// forced-colors 會把墨色底洗掉,選中就看不出來:圓點自己給系統色
		forcedColorAdjust: "none",
	},
	// 選中是墨色實心,中間一顆 accentText 的點(跟 checkbox 的勾同一個配色)
	dotOn: {
		borderColor: { default: color.accent, [FORCED]: "Highlight" },
		backgroundColor: { default: color.accent, [FORCED]: "Highlight" },
	},
	dotDisabled: { borderColor: { default: color.borderControl, [FORCED]: "GrayText" } },
	dotOnDisabled: {
		borderColor: { default: color.accent, [FORCED]: "GrayText" },
		backgroundColor: { default: color.accent, [FORCED]: "GrayText" },
	},
	fill: {
		width: "0.4rem",
		height: "0.4rem",
		borderRadius: corner.pill,
		backgroundColor: { default: color.accentText, [FORCED]: "HighlightText" },
		scale: "0",
		transitionProperty: "scale",
		transitionDuration: { default: motion.quick, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	fillOn: { scale: "1" },
	labelText: { display: "block", fontWeight: 500, fontSize: type.t2, color: color.text },
	description: { display: "block", fontSize: type.t1, color: color.textMuted },
})

export type RadioProps = Omit<ComponentProps<"input">, "type" | "value" | "children"> & {
	/** The value the group takes when this option is picked. */
	value: string
	/** The option's visible name, shown beside it and used as its accessible name. */
	label?: ReactNode
	/** A muted line under the label, linked to the option with `aria-describedby`. */
	description?: ReactNode
}

/** One option in a `RadioGroup`; it must be rendered inside one. */
export function Radio({ value, label, description, onChange, disabled, ...props }: RadioProps) {
	const group = useRadioGroup()
	const base = useId()
	const labelId = `${base}label`
	const descriptionId = `${base}description`
	const { invalid: _invalid, id: _fieldId, ...field } = useFieldControl(props)
	const checked = group.value === value
	const isDisabled = disabled ?? field.disabled ?? group.disabled
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
			<span
				{...stylex.props(
					styles.dot,
					checked && styles.dotOn,
					isDisabled && (checked ? styles.dotOnDisabled : styles.dotDisabled),
				)}
			>
				<input
					type="radio"
					{...props}
					{...field}
					name={group.name}
					value={value}
					checked={checked}
					aria-labelledby={label != null ? labelId : undefined}
					aria-describedby={describedBy || undefined}
					disabled={isDisabled}
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
