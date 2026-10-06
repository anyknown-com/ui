import * as stylex from "@stylexjs/stylex"
import { color, corner, focusRing, motion, shadow, zIndex } from "../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
// Windows 高對比:陰影會消失、顏色換成系統色;邊界與焦點環明確給 CanvasText / Highlight
const FORCED = "@media (forced-colors: active)"

/**
 * The site-wide stacking table; the values live in `zIndex` in `tokens.stylex.ts` (the reasons
 * for the order are there too). Base UI always portals its popups to body, where they compete on
 * z-index with dialogs and toasts, so one number per component opens holes like "the select
 * inside a dialog won't open".
 */
export const layer = zIndex

/** Ready-made `zIndex` styles for components that only need a layer; writing `zIndex: zIndex.popup` yourself works too. */
export const layerStyles = stylex.create({
	dialogBackdrop: { zIndex: zIndex.dialogBackdrop },
	dialog: { zIndex: zIndex.dialog },
	popup: { zIndex: zIndex.popup },
	tooltip: { zIndex: zIndex.tooltip },
	toast: { zIndex: zIndex.toast },
})

export const growIn = stylex.keyframes({
	from: { opacity: 0, scale: "1 0.97" },
	to: { opacity: 1, scale: "1 1" },
})

/**
 * A ref callback for Base UI popups: as soon as the exit starts (`data-ending-style` appears), it
 * returns focus to where it was before the popup opened. Base UI only returns focus once the exit
 * transition has finished and the popup is unmounted; without this, keyboard users are stuck in
 * a fading popup for 120ms. If the original spot can't take focus, Base UI handles it as usual.
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
		// 焦點在自己裡面,或在另一個也正在退場的浮層裡(疊著的 dialog、子選單一起關,
		// 誰的 observer 先跑都一樣:最後落在最底下那層打開前的地方)
		const active = doc.activeElement
		if (node.contains(active) || active?.closest("[data-ending-style]") != null)
			before.focus({ preventScroll: true })
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
		borderColor: { default: "transparent", [FORCED]: "CanvasText" },
		borderRadius: corner.float,
		boxShadow: shadow.float,
		overflow: "hidden",
		transformOrigin: "var(--transform-origin)",
		animationName: { default: growIn, [REDUCED]: "none" },
		animationDuration: motion.fast,
		animationTimingFunction: motion.easeOut,
		// 退場:Base UI 關的時候先掛 data-ending-style,等 transition 跑完才拆
		opacity: { default: 1, ":is([data-ending-style])": 0 },
		transitionProperty: "opacity",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
		outline: {
			default: "none",
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: -2,
	},
	anchorWidth: { width: "var(--anchor-width)" },
	availableHeight: { maxHeight: "var(--available-height)" },
	positioner: { zIndex: layer.popup, outline: "none" },
})
