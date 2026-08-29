import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useCallback, useId } from "react"
import { assignRef } from "../../lib/mergeRefs"
import { styled } from "../../lib/styled"
import { useSvgId } from "../../lib/svgId"
import { useControllableState } from "../../lib/useControllableState"
import { buildThread, buildWeave, weaveRand } from "../../lib/weave"
import { color, font, motion, radius, space, text, yarn } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

// 布與縫線在 module scope 織一次(固定種子、固定尺寸 → 恆定;純幾何,SSR 安全)。
// 格子顯示 14.8 CSS px(1.05rem − 2px border),viewBox 24 → s = 24/14.8,
// 螢幕上紗的粗細行距與 button 等粗。勾/橫線 = 縫在布上的線,與布共用同一支 rand 序列。
const rand = weaveRand()
const CLOTH = buildWeave({ w: 14.8, h: 14.8, s: 24 / 14.8 }, rand)
const CHECK_D = buildThread(
	[
		[5.83, 12.33],
		[10.05, 16.55],
		[18.18, 7.13],
	],
	rand,
)
const DASH_D = buildThread(
	[
		[6.48, 12],
		[17.53, 12],
	],
	rand,
)

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
	// 勾選 = 布織進格子:clip rect 的 width 從左往右推進,紗本身不動;
	// 縫線掛同一個 clip — 前緣推到哪,布和勾一起被織出來
	weave: {
		width: 0,
		height: 24,
		transitionProperty: "width",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.32, 0.85, 0.45, 1)",
	},
	weaveOn: { width: 24 },
	cloth: { fill: "none", strokeLinecap: "round" },
	un: { stroke: yarn.un },
	sh: { stroke: yarn.sh, opacity: 0.5 },
	y0: { stroke: yarn.y0 },
	y1: { stroke: yarn.y1 },
	y2: { stroke: yarn.y2 },
	y3: { stroke: yarn.y3 },
	y4: { stroke: yarn.y4 },
	hi: { stroke: yarn.hi, opacity: 0.45 },
	mark: { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" },
	threadShadow: { stroke: "rgba(9, 20, 16, 0.32)" },
	threadCore: { stroke: color.accentText },
	labelText: { display: "block", fontWeight: 500, fontSize: text.sm, color: color.text },
	description: { display: "block", fontSize: text.xs, color: color.textMuted },
})

const BUCKETS = [styles.y0, styles.y1, styles.y2, styles.y3, styles.y4] as const

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
	const clipId = useSvgId("ak-weave")
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
		<label {...stylex.props(styles.root)}>
			<span {...stylex.props(styles.box, filled && styles.boxOn)}>
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
					<defs>
						<clipPath id={clipId}>
							<rect rx="3" {...stylex.props(styles.weave, filled && styles.weaveOn)} />
						</clipPath>
					</defs>
					<g clipPath={`url(#${clipId})`}>
						<g {...stylex.props(styles.cloth)}>
							<g {...stylex.props(styles.un)}>
								{CLOTH.under.map((t, i) => (
									<path key={i} d={t.d} strokeWidth={t.sw} />
								))}
							</g>
							<g {...stylex.props(styles.sh)}>
								{CLOTH.seams.map((t, i) => (
									<path key={i} d={t.d} strokeWidth={t.sw} />
								))}
							</g>
							{CLOTH.face.map((t, i) => (
								<path key={i} d={t.d} strokeWidth={t.sw} {...stylex.props(BUCKETS[t.bucket])} />
							))}
							<g {...stylex.props(styles.hi)}>
								{CLOTH.hi.map((t, i) => (
									<path key={i} d={t.d} strokeWidth={t.sw} />
								))}
							</g>
						</g>
						<g {...stylex.props(styles.mark)}>
							<path
								d={indeterminate ? DASH_D : CHECK_D}
								strokeWidth="2.1"
								transform="translate(0.35 0.5)"
								{...stylex.props(styles.threadShadow)}
							/>
							<path
								d={indeterminate ? DASH_D : CHECK_D}
								strokeWidth="1.95"
								{...stylex.props(styles.threadCore)}
							/>
						</g>
					</g>
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
