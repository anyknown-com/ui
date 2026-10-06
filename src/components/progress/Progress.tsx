import * as stylex from "@stylexjs/stylex"
import { useCallback, useState } from "react"
import { styled } from "../../lib/styled"
import { color, corner, font, motion, space, text, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const STAGES = ["掃描對話", "挑出要記的事", "合併重複", "存成記憶"]

// 進度 = 一條膠囊軌加一段填充:軌是凹下去的 accentSubtle 6px 帶,填充是實心 signal
// (進度條說的是 agent 正在做事),寬度就是讀數。不定量時同一段填充在軌上等速滑過。
// ring / ball 是讀數(context 用量)不是工作中,留墨色。全部 CSS,零 rAF。
const TRACK_H = 6
const RING = 60
const BAND = 6
const SWEEP_W = 40

const spin = stylex.keyframes({ from: { rotate: "0deg" }, to: { rotate: "360deg" } })
const sweep = stylex.keyframes({
	from: { insetInlineStart: `-${SWEEP_W}%` },
	to: { insetInlineStart: "100%" },
})

const styles = stylex.create({
	svg: { display: "block" },
	track: {
		// 軌是 span:不給 block,determinate 的 div 裡它是 inline,寬高都不生效、整條看不見
		display: "block",
		position: "relative",
		width: "100%",
		height: TRACK_H,
		boxSizing: "border-box",
		borderRadius: corner.pill,
		backgroundColor: color.accentSubtle,
		overflow: "hidden",
	},
	fill: {
		position: "absolute",
		top: 0,
		bottom: 0,
		insetInlineStart: 0,
		borderRadius: corner.pill,
		backgroundColor: color.signal,
		transitionProperty: "width",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "linear",
	},
	grow: (percent: number) => ({ width: `${percent}%` }),
	window: {
		width: `${SWEEP_W}%`,
		insetInlineStart: { default: null, [REDUCED]: 0 },
		animationName: { default: sweep, [REDUCED]: "none" },
		animationDuration: "1.8s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	tidy: { display: "grid", gap: space.xs },
	stage: {
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 500,
		lineHeight: 1,
		letterSpacing: "0.04em",
		color: color.textMuted,
		fontVariantNumeric: "tabular-nums",
	},
	ringWrap: { position: "relative", display: "inline-grid", placeItems: "center" },
	ringTrack: { fill: "none", stroke: color.border },
	ringArc: {
		fill: "none",
		stroke: color.accent,
		strokeLinecap: "round",
		transform: "rotate(-90deg)",
		transformBox: "fill-box",
		transformOrigin: "center",
		transitionProperty: "stroke-dasharray",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "linear",
	},
	spinArc: {
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		transformBox: "fill-box",
		transformOrigin: "center",
		animationName: { default: spin, [REDUCED]: "none" },
		animationDuration: "0.8s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	statusHost: { display: "inline-flex", color: color.textMuted },
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	value: {
		position: "absolute",
		fontFamily: font.mono,
		fontSize: text.xs,
		fontWeight: 500,
		lineHeight: 1,
		color: color.text,
		fontVariantNumeric: "tabular-nums",
	},
})

function Bar({ percent }: { percent?: number }) {
	return (
		<span {...stylex.props(styles.track)}>
			<span {...stylex.props(styles.fill, percent != null ? styles.grow(percent) : styles.window)} />
		</span>
	)
}

const SPINNER_SIZES = { sm: 18, md: 28, lg: 40 } as const

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export type SpinnerProps = {
	size?: keyof typeof SPINNER_SIZES
	label?: string
}

// spinner = 一段圓弧在轉:pathLength 100,72 長的弧留 28 的缺口。
export function Spinner({ size = "md", label = "載入中" }: SpinnerProps) {
	const px = SPINNER_SIZES[size]
	const band = px * 0.135
	const r = (px - band) / 2 - 0.5

	return (
		<span role="status" aria-label={label} {...stylex.props(styles.statusHost)}>
			<svg
				width={px}
				height={px}
				viewBox={`0 0 ${px} ${px}`}
				aria-hidden="true"
				{...stylex.props(styles.svg)}
			>
				<circle
					cx={px / 2}
					cy={px / 2}
					r={r}
					strokeWidth={band}
					pathLength="100"
					strokeDasharray="72 28"
					{...stylex.props(styles.spinArc)}
				/>
			</svg>
			<span {...stylex.props(styles.srOnly)}>{label}</span>
		</span>
	)
}

export type ProgressProps = {
	value?: number
	/** Human-readable reading, e.g. "3 則訊息交接中 · 64%". Required by NOTES for determinate progress. */
	valueText: string
	stages?: string[]
	className?: string
	"aria-label": string
}

export function Progress({ value, valueText, stages = STAGES, ...rest }: ProgressProps) {
	if (value == null) return <ProgressTidy stages={stages} valueText={valueText} {...rest} />
	const percent = clampPercent(value)
	return (
		<div
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
			aria-valuetext={valueText}
			{...rest}
			{...styled(rest, styles.svg)}
		>
			<Bar percent={percent} />
		</div>
	)
}

type ProgressTidyProps = { stages: string[]; valueText: string; className?: string; "aria-label": string }

// 不定量:沒有真的進度可報,所以不給 aria-valuenow,也不顯示百分比。
// 一段填充在軌道上走完再走一次,底下是現在在做什麼。
function ProgressTidy({ stages, valueText, ...rest }: ProgressTidyProps) {
	const [step, setStep] = useState(0)
	const cycle = useCallback((node: HTMLElement | null) => {
		if (!node) return
		const id = setInterval(() => setStep((current) => current + 1), 1800)
		return () => clearInterval(id)
	}, [])

	return (
		<div
			ref={cycle}
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuetext={valueText}
			{...rest}
			{...styled(rest, styles.tidy)}
		>
			<Bar />
			<span {...stylex.props(styles.stage)}>{stages[step % stages.length]}</span>
		</div>
	)
}

export type ProgressBallProps = {
	value: number
	size?: number
	valueText: string
	className?: string
	"aria-label": string
}

export function ProgressBall({ value, size = 48, valueText, ...rest }: ProgressBallProps) {
	const percent = clampPercent(value)
	const band = size * 0.12
	const r = size / 2 - band / 2 - 1
	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
			aria-valuetext={valueText}
			{...rest}
			{...styled(rest, styles.svg)}
		>
			<circle cx={size / 2} cy={size / 2} r={r} strokeWidth={band} {...stylex.props(styles.ringTrack)} />
			<circle
				cx={size / 2}
				cy={size / 2}
				r={r}
				strokeWidth={band}
				pathLength="100"
				strokeDasharray={`${percent} ${100 - percent}`}
				{...stylex.props(styles.ringArc)}
			/>
		</svg>
	)
}

export type ProgressRingProps = {
	value: number
	size?: number
	valueText: string
	className?: string
	"aria-label": string
}

export function ProgressRing({ value, size = RING, valueText, ...rest }: ProgressRingProps) {
	const percent = clampPercent(value)
	return (
		<span
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
			aria-valuetext={valueText}
			{...rest}
			{...styled(rest, styles.ringWrap)}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${RING} ${RING}`}
				aria-hidden="true"
				{...stylex.props(styles.svg)}
			>
				<circle
					cx={RING / 2}
					cy={RING / 2}
					r={RING / 2 - BAND / 2 - 1}
					strokeWidth={BAND}
					{...stylex.props(styles.ringTrack)}
				/>
				<circle
					cx={RING / 2}
					cy={RING / 2}
					r={RING / 2 - BAND / 2 - 1}
					strokeWidth={BAND}
					pathLength="100"
					strokeDasharray={`${percent} ${100 - percent}`}
					{...stylex.props(styles.ringArc)}
				/>
			</svg>
			<span aria-hidden="true" {...stylex.props(styles.value)}>{`${Math.round(percent)}%`}</span>
		</span>
	)
}
