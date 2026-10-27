import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type KeyboardEvent, type PointerEvent, useRef, useState } from "react"
import { defineStrings, useStrings } from "../../lib/i18n"
import { type StyleArg, styled } from "../../lib/styled"
import { color, focusRing, font, space, type } from "../../tokens.stylex"
import { axisTicks, formatNumber, fraction } from "./axis"

// The frame BarChart shares: three faint ticks, the marks in ink, the labels under them, one
// value at a time on hover or focus, and a table of every number for screen readers. No frame,
// fill or legend; colour is for status, so the marks are `text`.

const strings = defineStrings({
	"zh-TW": {
		bar: "長條圖",
		name: (chart: string, from: string, to: string) => `${chart}，${from} 到 ${to}`,
		label: "項目",
		value: "數值",
		valueIn: (unit: string) => `數值（${unit}）`,
	},
	en: {
		bar: "Bar chart",
		name: (chart: string, from: string, to: string) => `${chart}, ${from} to ${to}`,
		label: "Label",
		value: "Value",
		valueIn: (unit: string) => `Value (${unit})`,
	},
})

/** Labels shown under the chart at most; past this, every k-th one is shown. */
const MAX_LABELS = 7
/** A bar is 60% of its slot, and never wider than with six bars. */
const BAR = 0.6
const MIN_SLOTS = 6

const styles = stylex.create({
	root: {
		position: "relative",
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		columnGap: space.xs,
		rowGap: space.xxs,
		// Room for the top tick label and for a value above the highest mark.
		paddingBlockStart: space.sm,
		minWidth: 0,
		fontFamily: font.body,
		fontSize: type.t1,
		lineHeight: type.tight,
		fontVariantNumeric: "tabular-nums",
		color: color.textMuted,
	},
	plot: { position: "relative", minWidth: 0 },
	bar: { height: "7.5rem" },
	svg: { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" },
	tick: { stroke: color.washHover, strokeWidth: 1 },
	mark: { fill: color.text },
	// The tick labels: zero-height rows spread top, middle, bottom, so each centres on its line.
	ticks: { display: "flex", flexDirection: "column", justifyContent: "space-between" },
	tickLabel: {
		height: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		whiteSpace: "nowrap",
	},
	labels: { display: "flex", minWidth: 0 },
	// Unsafe centring (the default) lets a long label spill evenly into the empty slots beside it.
	label: { flex: "1 1 0", minWidth: 0, display: "flex", justifyContent: "center", whiteSpace: "nowrap" },
	hits: { position: "absolute", inset: 0 },
	hit: (left: string, width: string) => ({ position: "absolute", top: 0, bottom: 0, left, width }),
	focused: { outline: `${focusRing.width} solid ${color.focusRing}` },
	tip: (left: string, bottom: string) => ({
		position: "absolute",
		left,
		bottom: `calc(${bottom} + ${space.xxs})`,
		transform: "translateX(-50%)",
		color: color.text,
		whiteSpace: "nowrap",
		pointerEvents: "none",
	}),
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
})

export type ChartProps = Omit<ComponentProps<"div">, "children"> & {
	/** One name per value, in order, shown under the chart ("Mon", "10/20"). */
	labels: string[]
	/** The numbers, in the order of `labels`. */
	values: number[]
	/** The unit, written after a value with one space ("runs", "ms"). Shown with the value on hover or focus and in the table header. */
	unit?: string
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

type Kind = "bar"

const KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/** Draws `values` as `kind`; BarChart is a thin wrapper around it. */
export function Chart({
	kind,
	labels,
	values,
	unit,
	sx,
	"aria-label": ariaLabel,
	...props
}: ChartProps & { kind: Kind }) {
	const t = useStrings(strings)
	const [hover, setHover] = useState<number | null>(null)
	const [focus, setFocus] = useState<number | null>(null)
	const [stopAt, setStop] = useState(0)
	const rows = useRef<(HTMLTableRowElement | null)[]>([])

	const n = values.length
	const stop = Math.min(stopAt, Math.max(0, n - 1))
	const active = focus ?? hover
	const shown = active != null ? values[active] : undefined
	const slot = n > 0 ? 100 / n : 0
	const ticks = axisTicks(Math.min(0, ...values), Math.max(0, ...values))
	const y = (value: number) => 100 - fraction(value, ticks) * 100
	const every = Math.ceil(n / MAX_LABELS)
	const withUnit = (value: number) => (unit ? `${formatNumber(value)} ${unit}` : formatNumber(value))
	const name = ariaLabel ?? (n > 0 ? t.name(t[kind], labels[0] ?? "", labels[n - 1] ?? "") : t[kind])

	function move(event: KeyboardEvent, index: number) {
		const step = KEYS[event.key]
		const to = event.key === "Home" ? 0 : event.key === "End" ? n - 1 : step != null ? index + step : null
		if (to == null) return
		event.preventDefault()
		const next = Math.max(0, Math.min(n - 1, to))
		setStop(next)
		rows.current[next]?.focus()
	}

	// A mouse that leaves hides the value; a finger lifting off does not, so a tap keeps it shown.
	function leave(event: PointerEvent) {
		if (event.pointerType !== "touch") setHover(null)
	}

	const barWidth = Math.min(slot, 100 / MIN_SLOTS) * BAR
	const zero = y(0)

	return (
		<div {...props} {...styled(props, styles.root, sx)}>
			<div {...stylex.props(styles.plot, styles[kind])}>
				<svg
					role="img"
					aria-label={name}
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
					{...stylex.props(styles.svg)}
				>
					{[0, 50, 100].map((at) => (
						<line
							key={at}
							x1={0}
							x2={100}
							y1={at}
							y2={at}
							vectorEffect="non-scaling-stroke"
							shapeRendering="crispEdges"
							{...stylex.props(styles.tick)}
						/>
					))}
					{values.map((value, index) => (
						<rect
							// oxlint-disable-next-line react/no-array-index-key -- one bar per value, in order
							key={index}
							x={(index + 0.5) * slot - barWidth / 2}
							width={barWidth}
							y={Math.min(y(value), zero)}
							height={Math.abs(zero - y(value))}
							shapeRendering="crispEdges"
							{...stylex.props(styles.mark)}
						/>
					))}
				</svg>
				<div aria-hidden="true" {...stylex.props(styles.hits)}>
					{values.map((value, index) => (
						<span
							// oxlint-disable-next-line react/no-array-index-key -- one slot per value, in order
							key={index}
							data-part="chart-slot"
							title={`${labels[index] ?? ""} · ${withUnit(value)}`}
							onPointerEnter={() => setHover(index)}
							onPointerLeave={leave}
							{...stylex.props(styles.hit(`${index * slot}%`, `${slot}%`), focus === index && styles.focused)}
						/>
					))}
					{active != null && shown != null && (
						<span
							data-part="chart-value"
							{...stylex.props(styles.tip(`${(active + 0.5) * slot}%`, `${100 - Math.min(y(shown), zero)}%`))}
						>
							{withUnit(shown)}
						</span>
					)}
				</div>
			</div>
			<div aria-hidden="true" {...stylex.props(styles.ticks)}>
				{[ticks[2], ticks[1], ticks[0]].map((tick) => (
					<span key={tick} {...stylex.props(styles.tickLabel)}>
						{formatNumber(tick)}
					</span>
				))}
			</div>
			<div aria-hidden="true" {...stylex.props(styles.labels)}>
				{values.map((_, index) => (
					// oxlint-disable-next-line react/no-array-index-key -- one label slot per value, in order
					<span key={index} {...stylex.props(styles.label)}>
						{index % every === 0 ? labels[index] : null}
					</span>
				))}
			</div>
			<table {...stylex.props(styles.srOnly)}>
				<thead>
					<tr>
						<th scope="col">{t.label}</th>
						<th scope="col">{unit ? t.valueIn(unit) : t.value}</th>
					</tr>
				</thead>
				<tbody>
					{values.map((value, index) => (
						<tr
							// oxlint-disable-next-line react/no-array-index-key -- one row per value, in order
							key={index}
							ref={(row) => {
								rows.current[index] = row
							}}
							tabIndex={index === stop ? 0 : -1}
							onFocus={() => {
								setStop(index)
								setFocus(index)
							}}
							onBlur={() => setFocus(null)}
							onKeyDown={(event) => move(event, index)}
						>
							<th scope="row">{labels[index]}</th>
							<td>{formatNumber(value)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
