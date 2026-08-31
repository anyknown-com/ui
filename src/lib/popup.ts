import * as stylex from "@stylexjs/stylex"
import { color, radius, shadow } from "../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

/**
 * 全站疊層表。Base UI 的浮層一律 portal 到 body,跟 dialog / toast 同在一層比 z-index,
 * 各元件各寫一個數字就會出現「dialog 裡的 select 打不開」這種洞,所以值集中在這裡。
 *
 * 順序的理由:popup 壓過 dialog(浮層是當下互動的最上層);tooltip 壓過 popup
 * (popup 裡的元素也能有 tooltip);toast 永遠最上(非阻斷通知不能被 modal 蓋掉)。
 */
export const layer = {
	dialogBackdrop: 70,
	dialog: 71,
	popup: 75,
	tooltip: 78,
	toast: 80,
} as const

/**
 * `layer` 的 stylex 版。跨檔案 import 的值在 `stylex.create()` 裡不能靜態求值,
 * 所以疊層要以「做好的樣式」而不是數字提供給其他元件。
 */
export const layerStyles = stylex.create({
	dialogBackdrop: { zIndex: layer.dialogBackdrop },
	dialog: { zIndex: layer.dialog },
	popup: { zIndex: layer.popup },
	tooltip: { zIndex: layer.tooltip },
	toast: { zIndex: layer.toast },
})

export const growIn = stylex.keyframes({
	from: { opacity: 0, scale: "1 0.97" },
	to: { opacity: 1, scale: "1 1" },
})

export const popupStyles = stylex.create({
	surface: {
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		boxShadow: shadow.popover,
		overflow: "hidden",
		transformOrigin: "var(--transform-origin)",
		animationName: { default: growIn, [REDUCED]: "none" },
		animationDuration: "140ms",
		animationTimingFunction: "ease-out",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	anchorWidth: { width: "var(--anchor-width)" },
	availableHeight: { maxHeight: "var(--available-height)" },
	positioner: { zIndex: layer.popup, outline: "none" },
})
