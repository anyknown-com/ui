import * as stylex from "@stylexjs/stylex"
import { breakpoint, color, focusRing, font, type } from "../../tokens.stylex"
import type { ReactNode } from "react"
import { useControllableState } from "../../lib/useControllableState"
import { Ghost } from "../ghost/Ghost"
import { Chevron } from "../icon/Chevron"
import { CheckGlyph } from "../icon/glyphs"
import { Input, type InputProps } from "../input/Input"
import { Slider } from "../slider/Slider"
import { Textarea, type TextareaProps } from "../textarea/Textarea"

/**
 * The lines of a `Group`: 44px, 16px in, a hairline between them that stops 16px short of the
 * left edge. A cell is a setting to read, a way into a page, one choice of several, or a field.
 */

// iOS Safari 在 16px 以下的欄位 focus 時會放大整頁;手機上欄位一律 16px

const styles = stylex.create({
	hairline: {
		backgroundImage: {
			default: "none",
			":not(:first-child)": `linear-gradient(${color.border}, ${color.border})`,
		},
		backgroundPosition: "right top",
		backgroundRepeat: "no-repeat",
		backgroundSize: "calc(100% - 16px) 1px",
	},
	cell: {
		alignItems: "center",
		boxSizing: "border-box",
		color: color.text,
		display: "flex",
		fontSize: type.t3,
		fontWeight: 400,
		gap: 12,
		lineHeight: type.snug,
		minHeight: 44,
		paddingBlock: 10,
		paddingInline: 16,
		textAlign: "start",
		width: "100%",
	},
	press: {
		backgroundColor: { default: "transparent", ":hover": color.layer4 },
		borderRadius: 0,
		height: "auto",
		justifyContent: "flex-start",
		// 整列滿版的按鈕按下去不縮:縮 0.98 時兩邊會離開卡緣,看起來像列鬆掉了
		scale: "1",
	},
	text: { display: "flex", flex: 1, flexDirection: "column", gap: 2, minWidth: 0 },
	label: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	mono: { fontFamily: font.mono, fontSize: type.t2 },
	accent: { color: color.accent },
	danger: { color: color.danger },
	detail: { color: color.textMuted, fontSize: type.t2 },
	value: { color: color.textMuted, flexShrink: 0, whiteSpace: "nowrap" },
	warn: { color: color.warning },
	check: { color: color.accent, flexShrink: 0, height: 18, width: 18 },
	chevron: { color: color.textFaint, flexShrink: 0, height: 16, width: 16 },
	// 裡面的欄位拿掉了自己的框與環,焦點改由整列畫:底色一階不到 3:1,所以再加一圈 2px 的環
	inputCell: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":focus-within": color.layer4 },
		outline: { default: "none", ":focus-within": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -2,
		color: color.text,
		cursor: "text",
		display: "grid",
		fontSize: type.t3,
		gap: 12,
		gridTemplateColumns: "96px minmax(0, 1fr)",
		lineHeight: type.snug,
		minHeight: 44,
		paddingInline: 16,
	},
	inputLabel: { whiteSpace: "nowrap" },
	input: {
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderRadius: 0,
		borderWidth: 0,
		boxShadow: "none",
		fontSize: { default: type.t3, [breakpoint.phone]: type.phoneInput },
		height: 44,
		minHeight: 0,
		outline: "none",
		paddingBlock: 0,
		paddingInline: 0,
	},
	textCell: {
		backgroundColor: { default: "transparent", ":focus-within": color.layer4 },
		outline: { default: "none", ":focus-within": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -2,
		color: color.text,
		fontSize: type.t3,
		lineHeight: type.body,
		paddingBlock: 12,
		paddingInline: 16,
	},
	textarea: {
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderRadius: 0,
		borderWidth: 0,
		boxShadow: "none",
		fontSize: { default: type.t3, [breakpoint.phone]: type.phoneInput },
		lineHeight: type.body,
		minHeight: 0,
		outline: "none",
		paddingBlock: 0,
		paddingInline: 0,
		resize: "none",
	},
	sliderCell: {
		color: color.text,
		display: "flex",
		flexDirection: "column",
		fontSize: type.t3,
		gap: 10,
		lineHeight: type.snug,
		paddingBlock: 12,
		paddingInline: 16,
	},
	sliderLine: { display: "flex", justifyContent: "space-between" },
	sliderValue: { color: color.textMuted },
})

export type GroupCellProps = {
	/** An `IconTile`, a `LetterTile` or an `ActionIcon`. */
	icon?: ReactNode
	/** The cell's name. */
	label: ReactNode
	/** A muted second line under the label. */
	detail?: ReactNode
	/** A muted reading on the right, like the model in use. */
	value?: ReactNode
	/** A control on the right, like a `Switch`. */
	control?: ReactNode
	/** `accent` for an action that adds, `danger` for one that removes; neither gets a chevron. */
	tone?: "accent" | "danger"
	/** The value is a warning. */
	warn?: boolean
	/** One choice of several: `true` draws the check, `false` leaves room for none. No chevron. */
	checked?: boolean
	/** Keys, ids, hosts: the label in mono. */
	mono?: boolean
	/** The whole line is a button; unless it has a tone or is a choice, a chevron says it opens. */
	onPress?: () => void
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** One line of a `Group`: a setting, a choice or an action, with an icon, a label and a value or control on the right. */
export function GroupCell({
	icon,
	label,
	detail,
	value,
	control,
	tone,
	warn = false,
	checked,
	mono = false,
	onPress,
	sx,
}: GroupCellProps) {
	const chevron = onPress !== undefined && tone === undefined && checked === undefined

	const body = (
		<>
			{icon}
			<span {...stylex.props(styles.text)}>
				<span {...stylex.props(styles.label, mono && styles.mono, tone !== undefined && styles[tone])}>
					{label}
				</span>
				{detail !== undefined && <span {...stylex.props(styles.detail)}>{detail}</span>}
			</span>
			{value !== undefined && <span {...stylex.props(styles.value, warn && styles.warn)}>{value}</span>}
			{control}
			{checked === true && <CheckGlyph {...stylex.props(styles.check)} strokeWidth={2} />}
			{chevron && <Chevron direction="right" {...stylex.props(styles.chevron)} />}
		</>
	)

	if (onPress === undefined) return <div {...stylex.props(styles.hairline, styles.cell, sx)}>{body}</div>

	return (
		<Ghost onClick={onPress} aria-pressed={checked} sx={[styles.hairline, styles.cell, styles.press, sx]}>
			{body}
		</Ghost>
	)
}

export type InputCellProps = Omit<InputProps, "sx" | "size" | "aria-label"> & {
	/** Written on the left and read as the field's name. */
	label: string
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A one-line field: its name in a 96px column, the input borderless after it. */
export function InputCell({ label, sx, ...props }: InputCellProps) {
	return (
		<label {...stylex.props(styles.hairline, styles.inputCell, sx)}>
			<span {...stylex.props(styles.inputLabel)}>{label}</span>
			<Input {...props} aria-label={label} sx={styles.input} />
		</label>
	)
}

export type TextCellProps = Omit<TextareaProps, "sx"> & {
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A borderless text area that grows with what is written in it. */
export function TextCell({ sx, ...props }: TextCellProps) {
	return (
		<div {...stylex.props(styles.textCell, sx)}>
			<Textarea autoGrow {...props} sx={styles.textarea} />
		</div>
	)
}

export type SliderCellProps = {
	/** The setting's name, written on the left and read as the slider's name. */
	label: string
	/** The current value, for a controlled cell. Pair it with `onValueChange`. */
	value?: number
	/** The starting value of an uncontrolled cell. @default min */
	defaultValue?: number
	/** The lowest value. */
	min: number
	/** The highest value. */
	max: number
	/** Values snap to multiples of this, counted from `min`. */
	step: number
	/** The reading on the right of the label, and what a screen reader says for the value. */
	text: (value: number) => string
	/** Every value the slider moves to, as it moves. */
	onValueChange?: (value: number) => void
	/** @deprecated Use `onValueChange`; it is called with the same value. */
	onChange?: (value: number) => void
	/** Once per gesture: save here. See `Slider`. */
	onValueCommit?: (value: number) => void
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A label and its reading on one line, the slider under them. */
export function SliderCell({
	label,
	value,
	defaultValue,
	min,
	max,
	step,
	text,
	onValueChange,
	onChange,
	onValueCommit,
	sx,
}: SliderCellProps) {
	// 右邊的讀數要跟著拖,所以值放在這一層,不交給 Slider 自己管
	const [current, setCurrent] = useControllableState(value, defaultValue ?? min, (next: number) => {
		onValueChange?.(next)
		onChange?.(next)
	})
	return (
		<div {...stylex.props(styles.sliderCell, sx)}>
			<div {...stylex.props(styles.sliderLine)}>
				<span>{label}</span>
				<span {...stylex.props(styles.sliderValue)}>{text(current)}</span>
			</div>
			<Slider
				aria-label={label}
				min={min}
				max={max}
				step={step}
				value={current}
				valueText={text}
				onValueChange={setCurrent}
				onValueCommit={onValueCommit}
			/>
		</div>
	)
}
