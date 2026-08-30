import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { useSvgId } from "../../lib/svgId"
import { useControllableState } from "../../lib/useControllableState"
import { buildWeave, weaveRand } from "../../lib/weave"
import { color, font, motion, radius, space, text, yarn } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const DARK = "@media (prefers-color-scheme: dark)"

// 藥丸 42×20(1:1 CSS px),module scope 織一次(固定種子 → 恆定;純幾何,SSR 安全)
const CLOTH = buildWeave({ w: 42, h: 20, ox: 1, oy: 1 }, weaveRand())

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
	// 開:布從左織進來(wipe clip 的 width 推進,紗本身不動 — 同一塊布被逐漸織出);
	// 關:整塊布 scale 到 0 收掉,width/opacity 等 scale 跑完才歸零。
	// 藥丸形狀是另一支固定 clip:左圓角從第一幀就完整,前緣是織布機的直線 fell。
	cloth: {
		opacity: 0,
		scale: "0",
		transformBox: "fill-box",
		transformOrigin: "center",
		transitionProperty: "scale, opacity",
		transitionDuration: { default: "200ms, 0s", [REDUCED]: "0s" },
		transitionTimingFunction: "ease-in",
		transitionDelay: { default: "0s, 200ms", [REDUCED]: "0s" },
		filter: {
			default: "drop-shadow(0 1px 1.5px rgba(18, 60, 49, 0.30))",
			[DARK]: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))",
		},
	},
	clothOn: {
		opacity: 1,
		scale: "1",
		transitionDuration: { default: "0s, 0s", [REDUCED]: "0s" },
		transitionDelay: "0s",
	},
	pillclip: {
		width: 0,
		transitionProperty: "width",
		transitionDuration: { default: "0s", [REDUCED]: "0s" },
		transitionDelay: { default: "200ms", [REDUCED]: "0s" },
	},
	pillclipOn: {
		width: 42,
		transitionDuration: { default: "240ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.32, 0.85, 0.45, 1)",
		transitionDelay: "0s",
	},
	yarns: { fill: "none", strokeLinecap: "round" },
	un: { stroke: yarn.un },
	sh: { stroke: yarn.sh, opacity: 0.5 },
	y0: { stroke: yarn.y0 },
	y1: { stroke: yarn.y1 },
	y2: { stroke: yarn.y2 },
	y3: { stroke: yarn.y3 },
	y4: { stroke: yarn.y4 },
	hi: { stroke: yarn.hi, opacity: 0.45 },
	thumb: {
		fill: color.bg,
		stroke: color.borderStrong,
		strokeWidth: 1.6,
		translate: "0 0",
		transitionProperty: "translate, stroke, fill",
		transitionDuration: { default: `240ms, ${motion.normal}, ${motion.normal}`, [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	thumbOn: { translate: "22px 0", fill: color.surface, stroke: color.accent },
	labelText: { display: "block", fontWeight: 500, fontSize: text.sm, color: color.text },
	description: { display: "block", fontSize: text.xs, color: color.textMuted },
})

const BUCKETS = [styles.y0, styles.y1, styles.y2, styles.y3, styles.y4] as const

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
	const clipId = useSvgId("ak-weave")
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
					<path d="M11,11 H33" {...stylex.props(styles.guide)} />
					<g {...stylex.props(styles.cloth, isOn && styles.clothOn)}>
						<defs>
							<clipPath id={`${clipId}p`}>
								<rect x="1" y="1" width="42" height="20" rx="10" />
							</clipPath>
							<clipPath id={clipId}>
								<rect
									x="1"
									y="-3"
									height="28"
									{...stylex.props(styles.pillclip, isOn && styles.pillclipOn)}
								/>
							</clipPath>
						</defs>
						<g clipPath={`url(#${clipId}p)`}>
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
						</g>
					</g>
					<circle cx="11" cy="11" r="8.4" {...stylex.props(styles.thumb, isOn && styles.thumbOn)} />
				</svg>
			</span>
		</label>
	)
}
