import * as stylex from "@stylexjs/stylex"
import { color, corner, motion, shadow } from "../tokens.stylex"

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

/**
 * 給 Base UI popup 的 ref callback:退場一開始(`data-ending-style` 出現)就把焦點還給
 * 打開之前的地方。Base UI 要等退場的 transition 跑完、popup 拆掉才還焦點,不補這一手
 * 鍵盤使用者會卡在正在淡出的 popup 裡 120ms。拿不到可聚焦的原處就交回 Base UI 自己處理。
 */
export function returnFocusOnExit(node: HTMLElement | null) {
	if (node == null) return
	const doc = node.ownerDocument
	// ref 掛上時 Base UI 還沒搬焦點,這時的 activeElement 就是打開它的那顆
	const before = doc.activeElement
	const observer = new MutationObserver(() => {
		if (!node.hasAttribute("data-ending-style")) return
		observer.disconnect()
		if (!(before instanceof HTMLElement) || !before.isConnected || before === doc.body) return
		if (node.contains(doc.activeElement)) before.focus({ preventScroll: true })
	})
	observer.observe(node, { attributes: true, attributeFilter: ["data-ending-style"] })
	return () => observer.disconnect()
}

export const popupStyles = stylex.create({
	// float 階:疊在紙上的紙。暗色靠 surfaceRaised 升一階,不畫邊框;
	// 透明的框只為了 forced-colors —— 那裡陰影會消失,框會被換成系統色
	surface: {
		backgroundColor: color.surfaceRaised,
		color: color.text,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "transparent",
		borderRadius: corner.float,
		boxShadow: shadow.float,
		overflow: "hidden",
		transformOrigin: "var(--transform-origin)",
		animationName: { default: growIn, [REDUCED]: "none" },
		animationDuration: "140ms",
		animationTimingFunction: "ease-out",
		// 退場:Base UI 關的時候先掛 data-ending-style,等 transition 跑完才拆
		opacity: { default: 1, ":is([data-ending-style])": 0 },
		transitionProperty: "opacity",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	anchorWidth: { width: "var(--anchor-width)" },
	availableHeight: { maxHeight: "var(--available-height)" },
	positioner: { zIndex: layer.popup, outline: "none" },
})
