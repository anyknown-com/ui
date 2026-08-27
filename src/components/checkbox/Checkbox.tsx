import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useCallback } from "react"
import { FabricPattern } from "../../lib/Fabric"
import { assignRef } from "../../lib/mergeRefs"
import { useSvgId } from "../../lib/svgId"
import { useControllableState } from "../../lib/useControllableState"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

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
	input: { position: "absolute", opacity: 0, width: "1.05rem", height: "1.05rem", margin: 0 },
	box: {
		flex: "none",
		width: "1.05rem",
		height: "1.05rem",
		marginTop: "0.16rem",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.borderStrong,
		borderRadius: radius.sm,
		backgroundColor: color.surface,
		overflow: "hidden",
		transitionProperty: "border-color",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		outline: { default: "none", ":has(:focus-visible)": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	boxOn: { borderColor: color.accent },
	svg: { display: "block", width: "100%", height: "100%" },
	weave: {
		width: 0,
		height: 24,
		transitionProperty: "width",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.32, 0.85, 0.45, 1)",
	},
	weaveOn: { width: 24 },
	mark: { stroke: color.accent, strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" },
	check: {
		strokeDasharray: 24,
		strokeDashoffset: 24,
		transitionProperty: "stroke-dashoffset",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
		transitionDelay: { default: "110ms", [REDUCED]: "0s" },
	},
	dash: {
		strokeDasharray: 14,
		strokeDashoffset: 14,
		transitionProperty: "stroke-dashoffset",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
		transitionDelay: { default: "110ms", [REDUCED]: "0s" },
	},
	drawn: { strokeDashoffset: 0 },
	labelText: { display: "block", fontWeight: 500, fontSize: text.sm, color: color.text },
	description: { display: "block", fontSize: text.xs, color: color.textMuted },
})

export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> & {
	indeterminate?: boolean
	label?: ReactNode
	description?: ReactNode
	onCheckedChange?: (checked: boolean) => void
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
	...props
}: CheckboxProps) {
	const patternId = useSvgId("ak-fabric")
	const [isChecked, setChecked] = useControllableState(checked, defaultChecked ?? false, onCheckedChange)

	const setNode = useCallback(
		(node: HTMLInputElement | null) => {
			if (node) node.indeterminate = indeterminate
			return assignRef(ref, node)
		},
		[indeterminate, ref],
	)

	const filled = isChecked || indeterminate

	return (
		<label {...stylex.props(styles.root)}>
			<span {...stylex.props(styles.box, filled && styles.boxOn)}>
				<input
					type="checkbox"
					{...props}
					ref={setNode}
					checked={isChecked}
					onChange={(event) => {
						setChecked(event.currentTarget.checked)
						onChange?.(event)
					}}
					{...stylex.props(styles.input)}
				/>
				<svg viewBox="0 0 24 24" aria-hidden="true" {...stylex.props(styles.svg)}>
					<FabricPattern id={patternId} />
					<rect rx="3" fill={`url(#${patternId})`} {...stylex.props(styles.weave, filled && styles.weaveOn)} />
					<g transform="translate(4.2 4.2) scale(.65)" {...stylex.props(styles.mark)}>
						{indeterminate ? (
							<path d="M3.5 12h17" {...stylex.props(styles.dash, styles.drawn)} />
						) : (
							<path
								d="M2.5 12.5 9 19 21.5 4.5"
								{...stylex.props(styles.check, isChecked && styles.drawn)}
							/>
						)}
					</g>
				</svg>
			</span>
			{(label != null || description != null) && (
				<span>
					{label != null && <span {...stylex.props(styles.labelText)}>{label}</span>}
					{description != null && <span {...stylex.props(styles.description)}>{description}</span>}
				</span>
			)}
		</label>
	)
}
