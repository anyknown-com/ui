import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useCallback, useId } from "react"
import { assignRef } from "../../lib/mergeRefs"
import { type StyleArg, styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"
const HIT = "max(24px, 1.5rem)"

const CHECK_D = "M6 12.4 L10.2 16.6 L18.2 7.4"
const DASH_D = "M6.5 12 L17.5 12"

const styles = stylex.create({
	root: {
		display: "flex",
		gap: space.xs,
		alignItems: "flex-start",
		cursor: { default: "pointer", ":has(:disabled)": "not-allowed" },
		opacity: { default: 1, ":has(:disabled)": 0.5 },
		fontFamily: font.body,
	},
	// 看得到的方框 17px,可以按的原生 input 是蓋在上面、置中的 24px(WCAG 2.5.8),不影響版面
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
	box: {
		position: "relative",
		flex: "none",
		boxSizing: "border-box",
		width: "1.05rem",
		height: "1.05rem",
		marginTop: "0.16rem",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: { default: color.borderControl, [FORCED]: "ButtonText" },
		borderRadius: corner.small,
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
		// forced-colors 會把墨色底洗掉,勾選就看不出來:方框自己給系統色
		forcedColorAdjust: "none",
	},
	boxOn: {
		borderColor: { default: color.accent, [FORCED]: "Highlight" },
		backgroundColor: { default: color.accent, [FORCED]: "Highlight" },
	},
	boxInvalid: { borderColor: color.danger },
	boxDisabled: { borderColor: { default: color.borderControl, [FORCED]: "GrayText" } },
	boxOnDisabled: {
		borderColor: { default: color.accent, [FORCED]: "GrayText" },
		backgroundColor: { default: color.accent, [FORCED]: "GrayText" },
	},
	svg: { display: "block", width: "100%", height: "100%" },
	mark: {
		fill: "none",
		stroke: { default: color.accentText, [FORCED]: "HighlightText" },
		strokeWidth: 2.4,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeDasharray: 32,
		strokeDashoffset: 32,
		transitionProperty: "stroke-dashoffset",
		transitionDuration: { default: motion.quick, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	markOn: { strokeDashoffset: 0 },
	labelText: { display: "block", fontWeight: 500, fontSize: type.t2, color: color.text },
	description: { display: "block", fontSize: type.t1, color: color.textMuted },
})

export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> & {
	/** Shows a dash instead of a tick, for a "some but not all" parent box. @default false */
	indeterminate?: boolean
	/** The box's visible name, shown beside it and used as its accessible name. */
	label?: ReactNode
	/** A muted line under the label, linked to the box with `aria-describedby`. */
	description?: ReactNode
	/** The new checked state on every toggle, next to the native `onChange`. */
	onCheckedChange?: (checked: boolean) => void
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

/** A checkbox with an optional label and description. Use `checked` / `defaultChecked` as usual; inside a `Field` it is wired to the help and error. */
export function Checkbox({
	indeterminate = false,
	label,
	description,
	onCheckedChange,
	checked,
	defaultChecked,
	onChange,
	ref,
	sx,
	...props
}: CheckboxProps) {
	const base = useId()
	const labelId = `${base}label`
	const descriptionId = `${base}description`
	const { invalid, ...field } = useFieldControl(props)
	const [isChecked, setChecked] = useControllableState(checked, defaultChecked ?? false, onCheckedChange)

	// ref callback 管 indeterminate(不用 effect):indeterminate 變了 identity 變,
	// React 重跑 callback 就把新值寫回原生 input
	const setNode = useCallback(
		(element: HTMLInputElement | null) => {
			if (element) element.indeterminate = indeterminate
			assignRef(ref, element)
		},
		[ref, indeterminate],
	)

	const filled = isChecked || indeterminate
	const disabled = Boolean(field.disabled ?? props.disabled)
	const describedBy = [description != null ? descriptionId : null, field["aria-describedby"]]
		.filter(Boolean)
		.join(" ")

	return (
		<label {...stylex.props(styles.root, sx)}>
			<span
				{...stylex.props(
					styles.box,
					filled && styles.boxOn,
					invalid && styles.boxInvalid,
					disabled && (filled ? styles.boxOnDisabled : styles.boxDisabled),
				)}
			>
				<input
					type="checkbox"
					{...props}
					{...field}
					aria-invalid={invalid || undefined}
					aria-labelledby={label != null ? labelId : undefined}
					aria-describedby={describedBy || undefined}
					ref={setNode}
					checked={isChecked}
					onChange={(event) => {
						setChecked(event.currentTarget.checked)
						onChange?.(event)
					}}
					{...styled(props, styles.input)}
				/>
				<svg viewBox="0 0 24 24" aria-hidden="true" {...stylex.props(styles.svg)}>
					<path
						d={indeterminate ? DASH_D : CHECK_D}
						{...stylex.props(styles.mark, filled && styles.markOn)}
					/>
				</svg>
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
