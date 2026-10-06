import * as stylex from "@stylexjs/stylex"
import type { CompiledStyles, InlineStyles, StyleXArray } from "@stylexjs/stylex/lib/types/StyleXTypes"
import type { CSSProperties } from "react"
import { motion } from "../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

export type StyleArg = StyleXArray<
	(null | undefined | CompiledStyles) | boolean | Readonly<[CompiledStyles, InlineStyles]>
>

type CallerStyleProps = { className?: string; style?: CSSProperties }

/** Merges StyleX output with the caller's own className/style instead of replacing them. */
export function styled(
	caller: CallerStyleProps,
	...styles: StyleArg[]
): { className?: string; style?: CSSProperties } {
	const applied = stylex.props(...styles)
	const className = [applied.className, caller.className].filter(Boolean).join(" ")
	const hasStyle = applied.style != null || caller.style != null
	return {
		className: className || undefined,
		style: hasStyle ? { ...applied.style, ...caller.style } : undefined,
	}
}

// 原生 button / input / textarea 的 UA 外觀:buttonface 底色、outset 邊框、13px Arial、
// 內建 padding。`all: unset` 看起來能一次清掉,但 StyleX 0.19 會靜默丟掉那條宣告
// (編不出任何 CSS),chrome 就整片留在畫面上。逐項重設一次,共用。
// 用法:放在 stylex.props / styled 的第一個 style 參數,後面的樣式照常覆蓋。
export const reset = stylex.create({
	control: {
		appearance: "none",
		margin: 0,
		padding: 0,
		borderWidth: 0,
		backgroundColor: "transparent",
		color: "inherit",
		fontFamily: "inherit",
		fontSize: "inherit",
		fontWeight: "inherit",
		lineHeight: "inherit",
		textAlign: "inherit",
	},
})

// 按下去壓到 0.98:每顆按鈕共用這一份,不要各自再寫。transition 一併接手,清單涵蓋按鈕會變的
// 屬性(字色、底、框、陰影、透明度、縮放),120ms ease-out;reduced motion 時不縮也不轉場。
// 用法:放在元件自己的樣式後面、呼叫端 sx 前面。
export const press = stylex.create({
	button: {
		scale: { default: "1", ":active:not(:disabled)": { default: "0.98", [REDUCED]: "1" } },
		transitionProperty: "color, background-color, border-color, box-shadow, opacity, scale",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
})
