import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId } from "react"
import { styled } from "../../lib/styled"
import { useSvgId } from "../../lib/svgId"
import { buildWeave, weaveRand } from "../../lib/weave"
import { color, font, motion, radius, space, text, yarn } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"
import { useRadioGroup } from "./RadioGroup"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

// 鏡頭 dot:布像背景一樣在後面延伸(與 checkbox 同源幾何,module scope 織一次),
// 圓形只是取景框 — 選中 = 孔徑(circle r)從 0 打開,布本身完全不動。
// 孔徑只開到 r 6.8:維持 radio 的標準構成(外環 + surface 空隙 + 內實心圓)。
const CLOTH = buildWeave({ w: 14.8, h: 14.8, s: 24 / 14.8 }, weaveRand())

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
		borderRadius: radius.md,
		paddingBlock: space.sm,
		paddingInline: space.sm,
		transitionProperty: "border-color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
	},
	cardOn: { borderColor: color.accent, backgroundColor: color.accentSubtle },
	input: { position: "absolute", opacity: 0, width: "1.05rem", height: "1.05rem", margin: 0 },
	dot: {
		flex: "none",
		width: "1.05rem",
		height: "1.05rem",
		marginTop: "0.16rem",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.borderStrong,
		borderRadius: radius.full,
		backgroundColor: color.surface,
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":has(:focus-visible)": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	dotOn: { borderColor: color.accent },
	svg: { display: "block", width: "100%", height: "100%" },
	lens: {
		r: "0px",
		transitionProperty: "r",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.32, 0.85, 0.45, 1)",
	},
	lensOn: { r: "6.8px" },
	yarns: { fill: "none", strokeLinecap: "round" },
	un: { stroke: yarn.un },
	sh: { stroke: yarn.sh, opacity: 0.5 },
	y0: { stroke: yarn.y0 },
	y1: { stroke: yarn.y1 },
	y2: { stroke: yarn.y2 },
	y3: { stroke: yarn.y3 },
	y4: { stroke: yarn.y4 },
	hi: { stroke: yarn.hi, opacity: 0.45 },
	labelText: { display: "block", fontWeight: 500, fontSize: text.sm, color: color.text },
	description: { display: "block", fontSize: text.xs, color: color.textMuted },
})

const BUCKETS = [styles.y0, styles.y1, styles.y2, styles.y3, styles.y4] as const

export type RadioProps = Omit<ComponentProps<"input">, "type" | "value" | "children"> & {
	value: string
	label?: ReactNode
	description?: ReactNode
}

export function Radio({ value, label, description, onChange, disabled, ...props }: RadioProps) {
	const group = useRadioGroup()
	const clipId = useSvgId("ak-lens")
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
				<svg viewBox="0 0 24 24" aria-hidden="true" {...stylex.props(styles.svg)}>
					<defs>
						<clipPath id={clipId}>
							<circle cx="12" cy="12" {...stylex.props(styles.lens, checked && styles.lensOn)} />
						</clipPath>
					</defs>
					<g clipPath={`url(#${clipId})`} {...stylex.props(styles.yarns)}>
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
