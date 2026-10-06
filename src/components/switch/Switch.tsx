import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, font, motion, shadow, space, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"

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
	// 軌道只有 22px 高:可以按的原生 input 上下各多一點,湊滿 24px(WCAG 2.5.8),不影響版面
	input: {
		position: "absolute",
		opacity: 0,
		width: "100%",
		height: "max(24px, 1.5rem)",
		insetBlockStart: "calc((100% - max(24px, 1.5rem)) / 2)",
		insetInlineStart: 0,
		margin: 0,
		cursor: "inherit",
	},
	track: {
		flex: "none",
		position: "relative",
		boxSizing: "border-box",
		width: "2.75rem",
		height: "1.4rem",
		marginTop: "0.1rem",
		borderRadius: corner.pill,
		backgroundColor: { default: color.borderControl, [FORCED]: "Canvas" },
		transitionProperty: "background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: {
			default: "none",
			":has(:focus-visible)": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: 3,
		// forced-colors 會把軌道的底色洗掉,開關就看不出來:軌道加一圈框,自己給系統色
		forcedColorAdjust: "none",
		borderStyle: "solid",
		borderWidth: { default: 0, [FORCED]: 1 },
		borderColor: "ButtonText",
	},
	trackOn: {
		backgroundColor: { default: color.accent, [FORCED]: "Highlight" },
		borderColor: "Highlight",
	},
	trackDisabled: { borderColor: "GrayText" },
	trackOnDisabled: {
		backgroundColor: { default: color.accent, [FORCED]: "GrayText" },
		borderColor: "GrayText",
	},
	thumb: {
		position: "absolute",
		// forced-colors 多了 1px 的框,鈕往內縮 1px 才不貼邊
		insetBlockStart: { default: 2, [FORCED]: 1 },
		insetInlineStart: { default: 2, [FORCED]: 1 },
		width: "calc(1.4rem - 4px)",
		height: "calc(1.4rem - 4px)",
		borderRadius: corner.pill,
		// literal-ok: the thumb stays white on both track colours, in both themes
		backgroundColor: { default: "#FFFFFF", [FORCED]: "ButtonText" },
		boxShadow: shadow.rest,
		// 用邏輯方向的 inset 移動,不用 translate:translate 是物理的 x,RTL 時鈕會往軌道外跑
		transitionProperty: "inset-inline-start, background-color",
		transitionDuration: { default: motion.quick, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	// 軌道 2.75rem − 鈕 (1.4rem − 4px) − 2px 的邊 = 1.35rem + 2px
	thumbOn: {
		insetInlineStart: { default: "calc(1.35rem + 2px)", [FORCED]: "1.35rem" },
		backgroundColor: { default: color.accentText, [FORCED]: "HighlightText" },
	},
	thumbDisabled: { backgroundColor: { default: "#FFFFFF", [FORCED]: "GrayText" } }, // literal-ok: same white thumb
	thumbOnDisabled: { backgroundColor: { default: color.accentText, [FORCED]: "Canvas" } },
	labelText: { display: "block", fontWeight: 500, fontSize: type.t2, color: color.text },
	description: { display: "block", fontSize: type.t1, color: color.textMuted },
})

export type SwitchProps = Omit<ComponentProps<"input">, "type" | "role" | "children"> & {
	/** The switch's visible name, shown before it and used as its accessible name. */
	label?: ReactNode
	/** A muted line under the label, linked to the switch with `aria-describedby`. */
	description?: ReactNode
	/** The new on/off state on every toggle, next to the native `onChange`. */
	onCheckedChange?: (checked: boolean) => void
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

/** An on/off toggle for a setting that takes effect at once. Use `checked` / `defaultChecked` as usual. */
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
	const disabled = Boolean(field.disabled ?? props.disabled)

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
			<span
				{...stylex.props(
					styles.track,
					isOn && styles.trackOn,
					disabled && (isOn ? styles.trackOnDisabled : styles.trackDisabled),
				)}
			>
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
				<span
					aria-hidden="true"
					{...stylex.props(
						styles.thumb,
						isOn && styles.thumbOn,
						disabled && (isOn ? styles.thumbOnDisabled : styles.thumbDisabled),
					)}
				/>
			</span>
		</label>
	)
}
