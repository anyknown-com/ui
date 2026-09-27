import * as stylex from "@stylexjs/stylex"
import { type PointerEvent as ReactPointerEvent, type ReactNode, useId, useRef, useState } from "react"
import type { StyleArg } from "../../lib/styled"
import { color, font, motion, radius, shadow, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const ARROW_FRACTION = 0.05

const styles = stylex.create({
	root: { display: "flex", flexDirection: "column", gap: space.xs, fontFamily: font.body },
	label: { fontSize: text.sm, fontWeight: 500, color: color.text },
	control: {
		position: "relative",
		height: "1.5rem",
		borderRadius: radius.full,
		backgroundColor: color.layer4,
		cursor: "pointer",
		touchAction: "none",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	disabled: { cursor: "not-allowed", opacity: 0.5 },
	fill: {
		position: "absolute",
		insetInlineStart: 0,
		insetBlock: 0,
		borderRadius: radius.full,
		backgroundColor: color.borderStrong,
	},
	thumb: {
		position: "absolute",
		insetBlock: "0.2rem",
		width: "1.6rem",
		borderRadius: radius.md,
		backgroundColor: color.surfaceRaised,
		boxShadow: shadow.raised,
		transitionProperty: "inset-inline-start",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	still: { transitionDuration: { default: "0s", [REDUCED]: "0s" } },
	grown: (ratio: number) => ({ width: `calc(1.6rem + (100% - 1.6rem) * ${ratio})` }),
	slid: (ratio: number) => ({ insetInlineStart: `calc((100% - 1.6rem) * ${ratio})` }),
})

function snap(raw: number, min: number, max: number, step: number): number {
	const clamped = Math.min(max, Math.max(min, raw))
	if (step <= 0) return clamped
	const decimals = (String(step).split(".")[1] ?? "").length
	const stepped = min + Math.round((clamped - min) / step) * step
	return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals))
}

export type SliderProps = {
	value: number
	onChange: (value: number) => void
	/**
	 * The value a gesture ended on: once when a drag lets go, once per key that moved it. Nothing
	 * when the gesture left the value where it started. Save here, not in `onChange`.
	 */
	onValueCommit?: (value: number) => void
	/** @default 0 */
	min?: number
	/** @default 1 */
	max?: number
	/** @default 0.01 */
	step?: number
	label?: ReactNode
	"aria-label"?: string
	/** 唸出來的值 —— 0.62 要唸成「多」不是「零點六二」。 */
	valueText?: (value: number) => string
	disabled?: boolean
	sx?: StyleArg
}

export function Slider({
	value,
	onChange,
	onValueCommit,
	min = 0,
	max = 1,
	step = 0.01,
	label,
	valueText,
	disabled = false,
	sx,
	"aria-label": ariaLabel,
}: SliderProps) {
	const labelId = useId()
	const control = useRef<HTMLDivElement>(null)
	const thumb = useRef<HTMLSpanElement>(null)
	const [dragging, setDragging] = useState(false)
	const gesture = useRef({ from: 0, to: 0 })

	const current = snap(value, min, max, step)
	const ratio = max === min ? 0 : (current - min) / (max - min)

	function emit(raw: number) {
		const next = snap(raw, min, max, step)
		gesture.current.to = next
		if (next !== current) onChange(next)
	}

	function begin() {
		gesture.current = { from: current, to: current }
	}

	function commit() {
		const { from, to } = gesture.current
		if (to !== from) onValueCommit?.(to)
	}

	function release() {
		if (!dragging) return
		setDragging(false)
		commit()
	}

	function ratioAt(clientX: number) {
		const track = control.current
		const knob = thumb.current
		if (track == null || knob == null) return ratio
		const rect = track.getBoundingClientRect()
		const span = rect.width - knob.offsetWidth
		if (span <= 0) return ratio
		return (clientX - rect.left - knob.offsetWidth / 2) / span
	}

	function drag(event: ReactPointerEvent<HTMLDivElement>) {
		emit(min + ratioAt(event.clientX) * (max - min))
	}

	return (
		<div {...stylex.props(styles.root, sx)}>
			{label != null && (
				<span id={labelId} {...stylex.props(styles.label)}>
					{label}
				</span>
			)}
			<div
				ref={control}
				role="slider"
				tabIndex={disabled ? -1 : 0}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={current}
				aria-valuetext={valueText?.(current)}
				aria-orientation="horizontal"
				aria-disabled={disabled || undefined}
				aria-labelledby={label != null ? labelId : undefined}
				aria-label={ariaLabel}
				onPointerDown={(event) => {
					if (disabled) return
					event.currentTarget.setPointerCapture(event.pointerId)
					event.currentTarget.focus()
					setDragging(true)
					begin()
					drag(event)
				}}
				onPointerMove={(event) => {
					if (dragging) drag(event)
				}}
				onPointerUp={release}
				onPointerCancel={release}
				onKeyDown={(event) => {
					if (disabled) return
					const nudge = (max - min) * ARROW_FRACTION
					begin()
					if (event.key === "ArrowRight" || event.key === "ArrowUp") emit(current + nudge)
					else if (event.key === "ArrowLeft" || event.key === "ArrowDown") emit(current - nudge)
					else if (event.key === "Home") emit(min)
					else if (event.key === "End") emit(max)
					else return
					event.preventDefault()
					commit()
				}}
				{...stylex.props(styles.control, disabled && styles.disabled)}
			>
				<span aria-hidden="true" {...stylex.props(styles.fill, styles.grown(ratio))} />
				<span
					ref={thumb}
					aria-hidden="true"
					{...stylex.props(styles.thumb, dragging && styles.still, styles.slid(ratio))}
				/>
			</div>
		</div>
	)
}
