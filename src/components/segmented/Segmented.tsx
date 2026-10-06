import * as stylex from "@stylexjs/stylex"
import type { KeyboardEvent } from "react"
import { press } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { breakpoint, color, corner, focusRing, font, radius, shadow, space, type } from "../../tokens.stylex"

/** `.seg`: a few words on a sunken track; the chosen one is a sheet of paper raised on it. */

const FORCED = "@media (forced-colors: active)"

const styles = stylex.create({
	root: {
		alignSelf: "flex-start",
		// 在 grid 裡也只包住自己的選項:軌道拉滿整列會像一條空的輸入框
		justifySelf: "start",
		backgroundColor: color.surface,
		borderRadius: corner.control,
		display: "inline-flex",
		gap: 2,
		maxWidth: "100%",
		overflowX: { default: "visible", [breakpoint.phone]: "auto" },
		padding: space.xxs,
		scrollbarWidth: "none",
	},
	item: {
		backgroundColor: { default: "transparent", ":hover": "transparent" },
		// 內層圓角 = 外框 12 − 內距 4
		borderRadius: radius.md,
		borderStyle: "none",
		borderWidth: 0,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: "pointer",
		fontFamily: font.body,
		fontSize: type.t2,
		height: { default: 28, [breakpoint.phone]: 40 },
		lineHeight: type.body,
		margin: 0,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -2,
		paddingBlock: 0,
		paddingInline: space.sm,
		whiteSpace: "nowrap",
	},
	// 白紙對 surface 軌道只有 1.09:1;外圈一條 borderControl 環讓選中的那格有 3:1 的邊。
	// forced-colors 會拿掉陰影、把底色洗掉:選中的那格改成 Highlight 底
	on: {
		backgroundColor: {
			default: color.surfaceRaised,
			":hover": color.surfaceRaised,
			[FORCED]: "Highlight",
		},
		boxShadow: `0 0 0 1px ${color.borderControl}, ${shadow.rest}`,
		color: { default: color.text, ":hover": color.text, [FORCED]: "HighlightText" },
		forcedColorAdjust: { default: "auto", [FORCED]: "none" },
		outline: {
			default: "none",
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid HighlightText`,
			},
		},
	},
	disabled: {
		cursor: "not-allowed",
		opacity: 0.4,
		color: { default: color.textMuted, ":hover": color.textMuted, [FORCED]: "GrayText" },
	},
})

/** One choice in a `Segmented`. */
export type SegmentedOption<T extends string> = {
	/** What `onValueChange` reports when this one is chosen. */
	value: T
	/** The word on the segment; also its accessible name. */
	label: string
	/** Can't be chosen; arrow keys skip it. */
	disabled?: boolean
}

export type SegmentedProps<T extends string> = {
	/** The chosen option, for a controlled control. Pair it with `onValueChange`. */
	value?: T
	/** The option chosen at first, for an uncontrolled control. @default the first option */
	defaultValue?: T
	/** Called with the option's value when the person picks another one. */
	onValueChange?: (value: T) => void
	/** @deprecated Use `onValueChange`; it is called with the same value. */
	onChange?: (value: T) => void
	/** The choices, in order. */
	options: SegmentedOption<T>[]
	/** The group's accessible name: what is being chosen ("Language"). */
	label: string
	/** No option can be chosen; the whole group is skipped by Tab. */
	disabled?: boolean
	sx?: stylex.StyleXStyles
}

/**
 * One of a few short options, side by side: a radio group drawn as a segmented track. Tab
 * lands on the chosen option; the arrow keys move the choice (and focus) to the next or
 * previous option, wrapping; Home and End go to the first and last.
 */
export function Segmented<T extends string>({
	value,
	defaultValue,
	onValueChange,
	onChange,
	options,
	label,
	disabled = false,
	sx,
}: SegmentedProps<T>) {
	const [selected, setSelected] = useControllableState<T | undefined>(
		value,
		defaultValue ?? options[0]?.value,
		(next) => {
			if (next === undefined) return
			onValueChange?.(next)
			onChange?.(next)
		},
	)
	const usable = (one: SegmentedOption<T>) => !disabled && !one.disabled
	// 沒有選中(或選中的被停用)時,Tab 落在第一個能選的
	const tabStop = options.some((one) => one.value === selected && usable(one))
		? selected
		: options.find(usable)?.value

	function choose(one: SegmentedOption<T>) {
		if (one.value !== selected) setSelected(one.value)
	}

	function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		const enabled = options.filter(usable)
		if (enabled.length === 0) return
		const at = enabled.findIndex((one) => one.value === (event.target as HTMLElement).dataset.value)
		const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
		let next: number
		switch (event.key) {
			case "ArrowRight":
				next = at + (rtl ? -1 : 1)
				break
			case "ArrowDown":
				next = at + 1
				break
			case "ArrowLeft":
				next = at + (rtl ? 1 : -1)
				break
			case "ArrowUp":
				next = at - 1
				break
			case "Home":
				next = 0
				break
			case "End":
				next = enabled.length - 1
				break
			default:
				return
		}
		event.preventDefault()
		const target = enabled[(next + enabled.length) % enabled.length]
		choose(target)
		const radios = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')
		for (const radio of radios) if (radio.dataset.value === target.value) radio.focus()
	}

	return (
		<div
			role="radiogroup"
			aria-label={label}
			aria-disabled={disabled || undefined}
			onKeyDown={onKeyDown}
			{...stylex.props(styles.root, sx)}
		>
			{options.map((one) => {
				const on = one.value === selected
				const off = !usable(one)
				return (
					<button
						key={one.value}
						type="button"
						role="radio"
						aria-checked={on}
						data-value={one.value}
						disabled={off}
						tabIndex={one.value === tabStop ? 0 : -1}
						onClick={() => choose(one)}
						{...stylex.props(styles.item, on && styles.on, off && styles.disabled, press.button)}
					>
						{one.label}
					</button>
				)
			})}
		</div>
	)
}
