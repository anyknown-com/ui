import * as stylex from "@stylexjs/stylex"
import { type PointerEvent as ReactPointerEvent, type ReactNode, useId, useRef, useState } from "react"
import type { StyleArg } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"
const ARROW_FRACTION = 0.05
const PAGE_FRACTION = 0.1

const styles = stylex.create({
	root: { display: "flex", flexDirection: "column", gap: space.xs, fontFamily: font.body },
	label: { fontSize: type.t2, fontWeight: 500, color: color.text },
	control: {
		position: "relative",
		height: "1.5rem",
		borderRadius: corner.pill,
		backgroundColor: { default: color.layer4, [FORCED]: "Canvas" },
		cursor: "pointer",
		touchAction: "none",
		outline: {
			default: "none",
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: 2,
		// forced-colors 會把底色洗成 Canvas、拿掉填充:這裡自己給系統色,軌道多一圈 ButtonText 的框
		forcedColorAdjust: "none",
		borderStyle: "solid",
		borderWidth: { default: 0, [FORCED]: 1 },
		borderColor: "ButtonText",
	},
	disabled: { cursor: "not-allowed", opacity: 0.5, borderColor: "GrayText" },
	// 值 = 墨色實心,跟 switch 開的軌道同一個配色;鈕永遠包在填充的末端裡
	fill: {
		position: "absolute",
		insetInlineStart: 0,
		insetBlock: 0,
		borderRadius: corner.pill,
		backgroundColor: { default: color.accent, [FORCED]: "Highlight" },
		// 跟鈕同一個時長與曲線:只有鈕在動的話,點一下軌道時填充先跳到位、鈕才慢慢跟上
		transitionProperty: "width",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	// 鈕是 accentText 的圓,外圈一環墨色把它跟軌道隔開(跟 switch 開的鈕同色)
	thumb: {
		position: "absolute",
		insetBlock: 0,
		boxSizing: "border-box",
		width: "1.5rem",
		borderWidth: "0.2rem",
		borderStyle: "solid",
		borderColor: { default: color.accent, [FORCED]: "Highlight" },
		borderRadius: corner.pill,
		backgroundColor: { default: color.accentText, [FORCED]: "Canvas" },
		transitionProperty: "inset-inline-start",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	fillDisabled: { backgroundColor: { default: color.accent, [FORCED]: "GrayText" } },
	thumbDisabled: { borderColor: { default: color.accent, [FORCED]: "GrayText" } },
	still: { transitionDuration: { default: "0s", [REDUCED]: "0s" } },
	grown: (ratio: number) => ({ width: `calc(1.5rem + (100% - 1.5rem) * ${ratio})` }),
	slid: (ratio: number) => ({ insetInlineStart: `calc((100% - 1.5rem) * ${ratio})` }),
})

function snap(raw: number, min: number, max: number, step: number): number {
	const clamped = Math.min(max, Math.max(min, raw))
	if (step <= 0) return clamped
	const decimals = (String(step).split(".")[1] ?? "").length
	const stepped = min + Math.round((clamped - min) / step) * step
	return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals))
}

export type SliderProps = {
	/** The current value, for a controlled slider. Pair it with `onValueChange`. */
	value?: number
	/** The starting value of an uncontrolled slider. @default min */
	defaultValue?: number
	/** Every value the slider moves to, as it moves: each pointer move, each key. */
	onValueChange?: (value: number) => void
	/** @deprecated Use `onValueChange`; it is called with the same value. */
	onChange?: (value: number) => void
	/**
	 * The value a gesture ended on: once when a drag lets go, once per key that moved it. Nothing
	 * when the gesture left the value where it started. Save here, not in `onValueChange`.
	 */
	onValueCommit?: (value: number) => void
	/** The lowest value. @default 0 */
	min?: number
	/** The highest value. @default 1 */
	max?: number
	/** Values snap to multiples of this, counted from `min`; 0 does not snap. @default 0.01 */
	step?: number
	/** How far PageUp and PageDown move the value. @default 10% of the range */
	largeStep?: number
	/** A visible name above the track; it also names the slider. */
	label?: ReactNode
	/** The slider's name when there is no visible `label`. */
	"aria-label"?: string
	/** What a screen reader says for a value: 0.62 should read "more", not "zero point six two". */
	valueText?: (value: number) => string
	/** Out of the tab order, deaf to pointer and keys, drawn faded. */
	disabled?: boolean
	sx?: StyleArg
}

/**
 * A value on a range, dragged along a track or moved with the keys: arrows move 5% of the
 * range, PageUp / PageDown `largeStep`, Home / End to either end.
 */
export function Slider({
	value,
	defaultValue,
	onValueChange,
	onChange,
	onValueCommit,
	min = 0,
	max = 1,
	step = 0.01,
	largeStep,
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
	const [raw, setValue] = useControllableState(value, defaultValue ?? min, (next: number) => {
		onValueChange?.(next)
		onChange?.(next)
	})

	const current = snap(raw, min, max, step)
	const ratio = max === min ? 0 : (current - min) / (max - min)

	function emit(next: number) {
		const snapped = snap(next, min, max, step)
		gesture.current.to = snapped
		if (snapped !== current) setValue(snapped)
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
					const page = largeStep ?? (max - min) * PAGE_FRACTION
					begin()
					if (event.key === "ArrowRight" || event.key === "ArrowUp") emit(current + nudge)
					else if (event.key === "ArrowLeft" || event.key === "ArrowDown") emit(current - nudge)
					else if (event.key === "PageUp") emit(current + page)
					else if (event.key === "PageDown") emit(current - page)
					else if (event.key === "Home") emit(min)
					else if (event.key === "End") emit(max)
					else return
					event.preventDefault()
					commit()
				}}
				{...stylex.props(styles.control, disabled && styles.disabled)}
			>
				<span
					aria-hidden="true"
					{...stylex.props(
						styles.fill,
						disabled && styles.fillDisabled,
						dragging && styles.still,
						styles.grown(ratio),
					)}
				/>
				<span
					ref={thumb}
					aria-hidden="true"
					{...stylex.props(
						styles.thumb,
						disabled && styles.thumbDisabled,
						dragging && styles.still,
						styles.slid(ratio),
					)}
				/>
			</div>
		</div>
	)
}
