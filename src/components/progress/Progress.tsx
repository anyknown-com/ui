import * as stylex from "@stylexjs/stylex"
import { useCallback, useMemo, useState } from "react"
import { BALL_STRANDS, ballDashOffset } from "../../lib/progress"
import { styled } from "../../lib/styled"
import { useSvgId } from "../../lib/svgId"
import { type WeaveLayers, buildWeave, weaveRand } from "../../lib/weave"
import { color, font, motion, radius, space, yarn } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const STAGES = ["掃描對話", "挑出耐久事實", "合併重複", "落盤固定"]

// 進度 = 一個容器裡長出一塊布:布就是 button 那塊(TEXTURE-GUIDE §3、種子 10075、
// 同一組 yarn 色票與落影),容器是凹進去的軌。填充只是寬度往右長,布本身不動也不縮放 ——
// 露出多少就是織到哪裡。環形同理:同一塊布在後面,弧形只是取景框(和 radio 的鏡頭一樣)。
// 全部 CSS,零 rAF。
const TRACK_H = 20
const PAD = 2
const CLOTH_H = TRACK_H - 2 - PAD * 2
const RING = 60
const BAND = 9

const spin = stylex.keyframes({ from: { rotate: "0deg" }, to: { rotate: "360deg" } })
const sweep = stylex.keyframes({ from: { insetInlineStart: "-32%" }, to: { insetInlineStart: "100%" } })

const styles = stylex.create({
	svg: { display: "block" },
	track: {
		display: "flex",
		alignItems: "center",
		width: "100%",
		height: TRACK_H,
		boxSizing: "border-box",
		padding: PAD,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.full,
		backgroundColor: color.bg,
		overflow: "hidden",
	},
	body: {
		position: "relative",
		height: CLOTH_H,
		borderRadius: radius.full,
		overflow: "hidden",
		filter: yarn.shadow,
		transitionProperty: "width",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "linear",
	},
	grow: (percent: number) => ({ width: `${percent}%` }),
	window: {
		width: "32%",
		insetInlineStart: 0,
		animationName: { default: sweep, [REDUCED]: "none" },
		animationDuration: "1.8s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	cloth: { fill: "none", strokeLinecap: "round" },
	fUn: { stroke: yarn.un },
	fSh: { stroke: yarn.sh, opacity: 0.5 },
	fY0: { stroke: yarn.y0 },
	fY1: { stroke: yarn.y1 },
	fY2: { stroke: yarn.y2 },
	fY3: { stroke: yarn.y3 },
	fY4: { stroke: yarn.y4 },
	fHi: { stroke: yarn.hi, opacity: 0.45 },
	tidy: { display: "grid", gap: space.xs },
	stage: {
		fontFamily: font.mono,
		fontSize: "0.72rem",
		fontWeight: 500,
		lineHeight: 1,
		letterSpacing: "0.04em",
		color: color.textMuted,
		fontVariantNumeric: "tabular-nums",
	},
	ringWrap: { position: "relative", display: "inline-grid", placeItems: "center" },
	ringTrack: { fill: "none", stroke: color.bone },
	ringCloth: { filter: yarn.shadow },
	spin: {
		transformBox: "fill-box",
		transformOrigin: "center",
		animationName: { default: spin, [REDUCED]: "none" },
		animationDuration: "0.9s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	strand: {
		fill: "none",
		stroke: color.accent,
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeDasharray: 100,
	},
	statusHost: { display: "inline-flex" },
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
		fontSize: "0.75rem",
		fontWeight: 500,
		lineHeight: 1,
		color: color.text,
		fontVariantNumeric: "tabular-nums",
	},
})

const BUCKETS = [styles.fY0, styles.fY1, styles.fY2, styles.fY3, styles.fY4] as const

function Cloth({ layers }: { layers: WeaveLayers }) {
	return (
		<>
			<g {...stylex.props(styles.fUn)}>
				{layers.under.map((strand, index) => (
					<path key={index} d={strand.d} strokeWidth={strand.sw} />
				))}
			</g>
			<g {...stylex.props(styles.fSh)}>
				{layers.seams.map((strand, index) => (
					<path key={index} d={strand.d} strokeWidth={strand.sw} />
				))}
			</g>
			{layers.face.map((strand, index) => (
				<path key={index} d={strand.d} strokeWidth={strand.sw} {...stylex.props(BUCKETS[strand.bucket])} />
			))}
			<g {...stylex.props(styles.fHi)}>
				{layers.hi.map((strand, index) => (
					<path key={index} d={strand.d} strokeWidth={strand.sw} />
				))}
			</g>
		</>
	)
}

// 量到容器內寬才織(ref callback + ResizeObserver,不用 effect);布永遠是整條軌的寬度,
// 所以填充長出來時露出的是同一塊布的更多段,不是把布拉長。
function Bar({ percent }: { percent?: number }) {
	const [inner, setInner] = useState(0)
	const measure = useCallback((node: HTMLElement | null) => {
		if (!node) return
		const read = () =>
			setInner((current) => {
				const next = node.clientWidth - PAD * 2
				return current === next ? current : next
			})
		read()
		const observer = new ResizeObserver(read)
		observer.observe(node)
		return () => observer.disconnect()
	}, [])
	const cloth = useMemo(() => (inner > 0 ? buildWeave({ w: inner, h: CLOTH_H }, weaveRand()) : null), [inner])

	return (
		<span ref={measure} {...stylex.props(styles.track)}>
			{cloth != null && (
				<span
					{...stylex.props(styles.body, percent != null ? styles.grow(percent) : styles.window, styles.cloth)}
				>
					<svg
						width={inner}
						height={CLOTH_H}
						viewBox={`0 0 ${inner} ${CLOTH_H}`}
						aria-hidden="true"
						{...stylex.props(styles.svg, styles.cloth)}
					>
						<Cloth layers={cloth} />
					</svg>
				</span>
			)}
		</span>
	)
}

// 環形:同一塊布在後面,弧形取景框開到 percent(和 radio 的鏡頭同一個邏輯)
function ringSector(percent: number): string {
	const centre = RING / 2
	const outer = centre - 1
	const nner = outer - BAND
	const sweepDeg = Math.min(359.99, (percent / 100) * 360)
	const a0 = -Math.PI / 2
	const a1 = a0 + (sweepDeg * Math.PI) / 180
	const large = sweepDeg > 180 ? 1 : 0
	const point = (r: number, angle: number) =>
		`${(centre + r * Math.cos(angle)).toFixed(2)},${(centre + r * Math.sin(angle)).toFixed(2)}`
	return [
		`M${point(outer, a0)}`,
		`A${outer},${outer} 0 ${large} 1 ${point(outer, a1)}`,
		`L${point(nner, a1)}`,
		`A${nner},${nner} 0 ${large} 0 ${point(nner, a0)}`,
		"Z",
	].join("")
}

const SPINNER_SIZES = { sm: 18, md: 28, lg: 40 } as const

// spinner = 一段布做的弧在轉。布在後面不動(每個尺寸在 module scope 各織一塊,
// SSR 安全),轉的是遮罩上那道弧 —— 和 radio 的鏡頭、tabs 的取景窗同一個邏輯。
const SPINNER_CLOTH = {
	sm: buildWeave({ w: SPINNER_SIZES.sm, h: SPINNER_SIZES.sm }, weaveRand()),
	md: buildWeave({ w: SPINNER_SIZES.md, h: SPINNER_SIZES.md }, weaveRand()),
	lg: buildWeave({ w: SPINNER_SIZES.lg, h: SPINNER_SIZES.lg }, weaveRand()),
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export type SpinnerProps = {
	size?: keyof typeof SPINNER_SIZES
	label?: string
}

export function Spinner({ size = "md", label = "載入中" }: SpinnerProps) {
	const maskId = useSvgId("ak-spin")
	const px = SPINNER_SIZES[size]
	const band = px * 0.135
	const radius = (px - band) / 2 - 0.5

	return (
		<span role="status" aria-label={label} {...stylex.props(styles.statusHost)}>
			<svg
				width={px}
				height={px}
				viewBox={`0 0 ${px} ${px}`}
				aria-hidden="true"
				{...stylex.props(styles.svg)}
			>
				<defs>
					<mask id={maskId}>
						<circle
							cx={px / 2}
							cy={px / 2}
							r={radius}
							fill="none"
							stroke="#fff"
							strokeWidth={band}
							strokeLinecap="round"
							pathLength="100"
							strokeDasharray="72 28"
							{...stylex.props(styles.spin)}
						/>
					</mask>
				</defs>
				<g mask={`url(#${maskId})`} {...stylex.props(styles.cloth)}>
					<Cloth layers={SPINNER_CLOTH[size]} />
				</g>
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
// 一段布在軌道上走完再走一次,底下是現在在做什麼。
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
			{...styled(rest, styles.svg)}
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
	valueText: string
	className?: string
	"aria-label": string
}

export function ProgressRing({ value, size = RING, valueText, ...rest }: ProgressRingProps) {
	const percent = clampPercent(value)
	const clipId = useSvgId("ak-ring")
	const cloth = useMemo(() => buildWeave({ w: RING, h: RING }, weaveRand()), [])
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
				<defs>
					<clipPath id={clipId}>
						<path d={ringSector(percent)} />
					</clipPath>
				</defs>
				<circle
					cx={RING / 2}
					cy={RING / 2}
					r={RING / 2 - 1 - BAND / 2}
					strokeWidth={BAND}
					{...stylex.props(styles.ringTrack)}
				/>
				<g clipPath={`url(#${clipId})`} {...stylex.props(styles.cloth, styles.ringCloth)}>
					<Cloth layers={cloth} />
				</g>
			</svg>
			<span aria-hidden="true" {...stylex.props(styles.value)}>{`${Math.round(percent)}%`}</span>
		</span>
	)
}
