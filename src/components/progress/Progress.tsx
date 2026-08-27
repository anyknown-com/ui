import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { usePrefersReducedMotion } from "../../lib/motion"
import {
	BALL_STRANDS,
	LOOM_HEIGHT,
	LOOM_PATHS,
	LOOM_WIDTH,
	WEAVE_HEIGHT,
	WEAVE_WIDTH,
	ballDashOffset,
	knotPath,
	loomDashOffset,
	loomStageIndex,
	weaveFibres,
} from "../../lib/progress"
import { useAnimationFrame } from "../../lib/useAnimationFrame"
import { color, font, motion, radius, shadow, space } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const STAGES = ["掃描對話", "挑出耐久事實", "合併重複", "落盤固定"]

const styles = stylex.create({
	svg: { display: "block" },
	weave: { width: "100%", height: "auto" },
	fibre: { fill: "none", stroke: color.accent, strokeWidth: 1.7, strokeLinecap: "round" },
	knot: {
		fill: "none",
		stroke: color.accent,
		strokeWidth: 1.6,
		strokeLinecap: "round",
		strokeDasharray: "72 28",
	},
	strand: {
		fill: "none",
		stroke: color.accent,
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeDasharray: 100,
	},
	loomWrap: {
		position: "relative",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		overflow: "hidden",
		backgroundColor: color.surface,
	},
	loom: { width: "100%", height: "5.5rem", display: "block" },
	thread: {
		fill: "none",
		stroke: color.accent,
		strokeWidth: 1.3,
		strokeOpacity: 0.38,
		strokeDasharray: 100,
	},
	stage: {
		position: "absolute",
		inset: 0,
		margin: "auto",
		width: "fit-content",
		height: "fit-content",
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.full,
		color: color.text,
		boxShadow: shadow.raised,
		fontFamily: font.mono,
		fontSize: "0.72rem",
		fontWeight: 500,
		lineHeight: 1,
		letterSpacing: "0.04em",
		whiteSpace: "nowrap",
		fontVariantNumeric: "tabular-nums",
	},
	ringWrap: { position: "relative", display: "inline-grid", placeItems: "center" },
	ring: { rotate: "-90deg" },
	ringTrack: { stroke: color.bone },
	ringFill: {
		stroke: color.accent,
		strokeLinecap: "round",
		strokeDasharray: 100,
		transitionProperty: "stroke-dashoffset",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: motion.ease,
	},
	value: {
		position: "absolute",
		fontFamily: font.mono,
		fontSize: "0.75rem",
		fontWeight: 500,
		lineHeight: 1,
		color: color.textMuted,
		fontVariantNumeric: "tabular-nums",
	},
})

const SPINNER_SIZES = { sm: 18, md: 28, lg: 40 } as const

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export type SpinnerProps = {
	size?: keyof typeof SPINNER_SIZES
	label?: string
}

export function Spinner({ size = "md", label = "載入中" }: SpinnerProps) {
	const reduced = usePrefersReducedMotion()
	const [t, setT] = useState(1.7)
	useAnimationFrame(!reduced, (elapsed) => setT(elapsed / 400))
	const px = SPINNER_SIZES[size]

	return (
		<span role="status" aria-label={label}>
			<svg width={px} height={px} viewBox="0 0 24 24" aria-hidden="true" {...stylex.props(styles.svg)}>
				<path
					d={knotPath(t)}
					style={{ strokeDashoffset: reduced ? 0 : -t * 14 }}
					{...stylex.props(styles.knot)}
				/>
			</svg>
		</span>
	)
}

export type ProgressProps = {
	value?: number
	valueText?: string
	stages?: string[]
	"aria-label": string
}

export function Progress({ value, valueText, stages = STAGES, ...rest }: ProgressProps) {
	if (value == null) return <ProgressTidy stages={stages} {...rest} />
	const percent = clampPercent(value)
	return (
		<svg
			viewBox={`0 0 ${WEAVE_WIDTH} ${WEAVE_HEIGHT}`}
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
			aria-valuetext={valueText}
			{...rest}
			{...stylex.props(styles.svg, styles.weave)}
		>
			{weaveFibres(percent).map((fibre, index) => (
				<path key={index} d={fibre.d} style={{ strokeOpacity: fibre.opacity }} {...stylex.props(styles.fibre)} />
			))}
		</svg>
	)
}

function ProgressTidy({ stages, ...rest }: { stages: string[]; "aria-label": string }) {
	const reduced = usePrefersReducedMotion()
	const [percent, setPercent] = useState(reduced ? 100 : 0)
	useAnimationFrame(!reduced, (elapsed) => setPercent(((elapsed / 300) % 130) > 100 ? 100 : (elapsed / 300) % 130))

	const stage = stages[loomStageIndex(percent) % stages.length]

	return (
		<div role="progressbar" aria-valuemin={0} aria-valuemax={100} {...rest} {...stylex.props(styles.loomWrap)}>
			<svg
				viewBox={`0 0 ${LOOM_WIDTH} ${LOOM_HEIGHT}`}
				preserveAspectRatio="none"
				aria-hidden="true"
				{...stylex.props(styles.loom)}
			>
				{LOOM_PATHS.map((d, index) => (
					<path
						key={index}
						d={d}
						pathLength="100"
						style={{ strokeDashoffset: loomDashOffset(percent, index) }}
						{...stylex.props(styles.thread)}
					/>
				))}
			</svg>
			<span {...stylex.props(styles.stage)}>{`${stage} · ${Math.round(percent)}%`}</span>
		</div>
	)
}

export type ProgressBallProps = {
	value: number
	size?: number
	valueText?: string
	"aria-label": string
}

export function ProgressBall({ value, size = 48, valueText, ...rest }: ProgressBallProps) {
	const percent = clampPercent(value)
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
			aria-valuetext={valueText}
			{...rest}
			{...stylex.props(styles.svg)}
		>
			{BALL_STRANDS.map((d, index) => (
				<path
					key={index}
					d={d}
					pathLength="100"
					style={{ strokeDashoffset: ballDashOffset(percent, index) }}
					{...stylex.props(styles.strand)}
				/>
			))}
		</svg>
	)
}

export type ProgressRingProps = {
	value: number
	size?: number
	valueText?: string
	"aria-label": string
}

export function ProgressRing({ value, size = 56, valueText, ...rest }: ProgressRingProps) {
	const percent = clampPercent(value)
	return (
		<span
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
			aria-valuetext={valueText}
			{...rest}
			{...stylex.props(styles.ringWrap)}
		>
			<svg
				width={size}
				height={size}
				viewBox="0 0 36 36"
				fill="none"
				strokeWidth="3.5"
				aria-hidden="true"
				{...stylex.props(styles.svg, styles.ring)}
			>
				<circle cx="18" cy="18" r="15.9" {...stylex.props(styles.ringTrack)} />
				<circle
					cx="18"
					cy="18"
					r="15.9"
					pathLength="100"
					strokeDashoffset={100 - percent}
					{...stylex.props(styles.ringFill)}
				/>
			</svg>
			<span aria-hidden="true" {...stylex.props(styles.value)}>{`${Math.round(percent)}%`}</span>
		</span>
	)
}
