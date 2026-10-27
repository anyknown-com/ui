import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ReactNode } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { breakpoint, color, corner, focusRing, font, shadow, space, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

const FORCED = "@media (forced-colors: active)"

// 輸入框是浮起來的一格:surfaceRaised 底 + shadow.float,沒有框;邊界由陰影分出來。
// focus 是 2px 實心 focusRing。forced colors 時陰影消失,所以只在那時畫一圈透明 1px 邊
// (高對比下會顯示成系統色)。invalid 只設 aria-invalid;紅字在 Field 的 error,
// forced colors 下改畫 2px 虛線框。
/** The shared text-control styles (`base`, `invalid`, `md`, `sm`) that `Input` and `Textarea` are built from. */
export const controlStyles = stylex.create({
	base: {
		width: "100%",
		// 沒有 border-box,minHeight 2.5rem 是「內容」40px,再加 padding+border;
		// 元件不能靠 app 端有沒有 `*{box-sizing:border-box}` reset
		boxSizing: "border-box",
		backgroundColor: color.surfaceRaised,
		boxShadow: shadow.float,
		borderWidth: { default: 0, [FORCED]: 1 },
		borderStyle: "solid",
		borderColor: "transparent",
		borderRadius: corner.shape,
		color: color.text,
		fontFamily: font.body,
		// iOS Safari 在 16px 以下的欄位 focus 時會放大整頁;手機上一律 16px,不靠 maximum-scale
		fontSize: { default: type.t2, [breakpoint.phone]: type.phoneInput },
		// 單行控件的行高只要裝得下字:行高一大,md 會被撐得比 button 的 2.5rem 高
		// (Textarea 自己蓋回 leadingRelaxed,多行照樣好讀)
		lineHeight: type.dense,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 0,
		cursor: { default: "auto", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.5 },
		"::placeholder": { color: color.textMuted },
	},
	invalid: {
		borderStyle: { default: "solid", [FORCED]: "dashed" },
		borderWidth: { default: 0, [FORCED]: 2 },
	},
	// 跟 button 的 40 / 32 對齊
	md: { minHeight: "2.5rem", paddingBlock: space.xs, paddingInline: space.sm },
	sm: {
		minHeight: "2rem",
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		fontSize: { default: type.t2, [breakpoint.phone]: type.phoneInput },
	},
})

const styles = stylex.create({
	mono: { fontFamily: font.mono },
	affix: { position: "relative", display: "block", width: "100%" },
	icon: {
		position: "absolute",
		insetInlineStart: space.xs,
		insetBlockStart: "50%",
		transform: "translateY(-50%)",
		display: "flex",
		color: color.textMuted,
		pointerEvents: "none",
	},
	withIconMd: { paddingInlineStart: space.xl },
	withIconSm: { paddingInlineStart: space.lg },
})

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
	/** `md` is 40px, the height of a `md` button; `sm` is 32px. @default "md" */
	size?: "sm" | "md"
	/** Sets `aria-invalid`. Inside a `Field` with an `error`, it is set for you. */
	invalid?: boolean
	/** Keys, URLs, ids: anything read character by character. */
	mono?: boolean
	/** An icon inside the start edge (a search glyph); decorative, hidden from screen readers. */
	leadingIcon?: ReactNode
	/** The new text on every edit, next to the native `onChange`. Use `value` / `defaultValue` as usual. */
	onValueChange?: (value: string) => void
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

/** A one-line text field. Native `<input>` props pass through; inside a `Field` it is wired to the label, help and error. */
export function Input({
	size = "md",
	invalid,
	mono = false,
	leadingIcon,
	onValueChange,
	onChange,
	sx,
	...props
}: InputProps) {
	const { invalid: fieldInvalid, ...field } = useFieldControl(props)
	const isInvalid = invalid ?? fieldInvalid
	const input = (
		<input
			{...props}
			{...field}
			onChange={(event) => {
				onChange?.(event)
				onValueChange?.(event.currentTarget.value)
			}}
			aria-invalid={isInvalid || undefined}
			{...styled(
				props,
				controlStyles.base,
				controlStyles[size],
				isInvalid && controlStyles.invalid,
				mono && styles.mono,
				Boolean(leadingIcon) && (size === "sm" ? styles.withIconSm : styles.withIconMd),
				sx,
			)}
		/>
	)
	if (!leadingIcon) return input
	return (
		<span {...stylex.props(styles.affix)}>
			<span aria-hidden="true" {...stylex.props(styles.icon)}>
				{leadingIcon}
			</span>
			{input}
		</span>
	)
}
