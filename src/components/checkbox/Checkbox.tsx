import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useCallback, useId } from "react"
import { assignRef } from "../../lib/mergeRefs"
import { type StyleArg, styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

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
	input: { position: "absolute", opacity: 0, width: "1.05rem", height: "1.05rem", margin: 0 },
	box: {
		flex: "none",
		boxSizing: "border-box",
		width: "1.05rem",
		height: "1.05rem",
		marginTop: "0.16rem",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: color.borderControl,
		borderRadius: corner.small,
		backgroundColor: color.bg,
		transitionProperty: "border-color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":has(:focus-visible)": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	boxOn: { borderColor: color.accent, backgroundColor: color.accent },
	boxInvalid: { borderColor: color.danger },
	svg: { display: "block", width: "100%", height: "100%" },
	mark: {
		fill: "none",
		stroke: color.accentText,
		strokeWidth: 2.4,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeDasharray: 32,
		strokeDashoffset: 32,
		transitionProperty: "stroke-dashoffset",
		transitionDuration: { default: "160ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	markOn: { strokeDashoffset: 0 },
	labelText: { display: "block", fontWeight: 500, fontSize: type.t2, color: color.text },
	description: { display: "block", fontSize: type.t1, color: color.textMuted },
})

export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> & {
	indeterminate?: boolean
	label?: ReactNode
	description?: ReactNode
	onCheckedChange?: (checked: boolean) => void
	sx?: StyleArg
}

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
	const describedBy = [description != null ? descriptionId : null, field["aria-describedby"]]
		.filter(Boolean)
		.join(" ")

	return (
		<label {...stylex.props(styles.root, sx)}>
			<span {...stylex.props(styles.box, filled && styles.boxOn, invalid && styles.boxInvalid)}>
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
