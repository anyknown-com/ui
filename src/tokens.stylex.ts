import * as stylex from "@stylexjs/stylex"

// Semantic tokens for all AnyKnown products. The default palette is neutral:
// white paper, ink text, ink accent. Ledger (warm paper, viridian accent) is the
// opt-in palette in scripts/ledger.mjs. Light is the primary mode;
// dark follows the OS unless a theme from themes.stylex.ts is applied.

const DARK = "@media (prefers-color-scheme: dark)"

export const color = stylex.defineVars({
	bg: { default: "#FFFFFF", [DARK]: "#000000" },
	surface: { default: "#F5F5F7", [DARK]: "#1C1C1E" },
	surfaceRaised: { default: "#FFFFFF", [DARK]: "#2C2C2E" },
	border: { default: "#E5E5EA", [DARK]: "#38383A" },
	borderStrong: { default: "#C7C7CC", [DARK]: "#48484A" },
	text: { default: "#1D1D1F", [DARK]: "#F5F5F7" },
	textMuted: { default: "#6E6E73", [DARK]: "#98989D" },
	textFaint: { default: "#86868B", [DARK]: "#8E8E93" },
	accent: { default: "#1D1D1F", [DARK]: "#F5F5F7" },
	accentText: { default: "#FFFFFF", [DARK]: "#000000" },
	accentSubtle: { default: "#E8E8ED", [DARK]: "#2C2C2E" },
	danger: { default: "#B3402E", [DARK]: "#DD7059" },
	dangerSubtle: { default: "#F7E7E3", [DARK]: "#3D231E" },
	success: { default: "#23705A", [DARK]: "#4FA184" },
	successSubtle: { default: "#E7F0EB", [DARK]: "#22352E" },
	warning: { default: "#B25000", [DARK]: "#FFB340" },
	warningSubtle: { default: "#F5EBD9", [DARK]: "#3A2F1D" },
	info: { default: "#2C5C86", [DARK]: "#6FA3CE" },
	infoSubtle: { default: "#E4EDF5", [DARK]: "#1E2C38" },
	focusRing: { default: "#1D1D1F", [DARK]: "#F5F5F7" },
	bone: { default: "#E6E6EA", [DARK]: "#2C2C2E" },
	sheen: { default: "#F2F2F5", [DARK]: "#3F3F42" },
	successHl: { default: "#C6E0C6", [DARK]: "#2F4A2E" },
	dangerHl: { default: "#EFCEC3", [DARK]: "#573328" },
	// 分層底色:rail → main → 訊息 → fold → 列,越深的一階數字越大。
	// 面與面靠深淺分,不靠邊框;hover 升一階,對應表在 lib/layers.ts。
	layer1: { default: "#EFEFF2", [DARK]: "#000000" },
	layer2: { default: "#FFFFFF", [DARK]: "#161618" },
	layer3: { default: "#F2F2F5", [DARK]: "#242426" },
	layer4: { default: "#E6E6EA", [DARK]: "#323234" },
	layer5: { default: "#D9D9DE", [DARK]: "#3F3F42" },
})

export const shadow = stylex.defineVars({
	popover: {
		default: "0 8px 24px rgba(35, 33, 29, 0.1)",
		[DARK]: "0 8px 24px rgba(0, 0, 0, 0.4)",
	},
	raised: {
		default: "0 1px 2px rgba(35, 33, 29, 0.08)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.3)",
	},
	pop: "0 10px 36px rgba(0, 0, 0, 0.22)",
	sheet: "0 16px 50px rgba(0, 0, 0, 0.24)",
	dock: "0 12px 40px rgba(0, 0, 0, 0.14)",
})

export const font = stylex.defineVars({
	display: "'Geist Variable', system-ui, sans-serif",
	body: "'Geist Variable', system-ui, sans-serif",
	mono: "'Geist Mono Variable', ui-monospace, monospace",
})

export const text = stylex.defineVars({
	xs: "0.75rem",
	sm: "0.875rem",
	base: "1rem",
	lg: "1.125rem",
	xl: "1.375rem",
	xxl: "1.75rem",
	display: "2.25rem",
	code: "0.8125rem",
	leadingTight: "1.2",
	leadingSnug: "1.4",
	leadingNormal: "1.5",
	leadingRelaxed: "1.6",
})

export const space = stylex.defineVars({
	xxs: "0.25rem",
	xs: "0.5rem",
	sm: "0.75rem",
	md: "1rem",
	lg: "1.5rem",
	xl: "2rem",
	xxl: "3rem",
})

export const radius = stylex.defineVars({
	sm: "0.375rem",
	md: "0.5rem",
	lg: "0.75rem",
	xl: "1rem",
	full: "9999px",
})

export const motion = stylex.defineVars({
	fast: "120ms",
	normal: "200ms",
	slow: "400ms",
	ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
	easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
	// 過衝曲線。全站規則是「動畫不回彈」,所以這條目前沒有任何元件在用 ——
	// 新元件不要挑它,滑動類一律 240ms easeOut。保留只是因為它已經在發佈的 API 裡。
	spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
})

// The flat language's own scales: four text sizes, the corner each kind of control wears,
// the ink washes hover paints with, and the four surfaces `color` has no name for.
export const type = stylex.defineVars({
	t1: "11px",
	t2: "13px",
	t3: "15px",
	t4: "17px",
	body: "1.6",
	tight: "1.35",
	snug: "1.45",
})

export const tone = stylex.defineVars({
	layer6: { default: "#CDCDD3", [DARK]: "#4C4C50" },
	faint: { default: "#86868B", [DARK]: "#8E8E93" },
	railLayer2: { default: "#FFFFFF", [DARK]: "#242426" },
	railLayer3: { default: "#E6E6EA", [DARK]: "#323234" },
})

export const corner = stylex.defineVars({
	card: "12px",
	ib: "0.6rem",
	md: "0.5rem",
	btn: "0.55rem",
	sm: "0.4rem",
	xs: "0.3rem",
})

export const ink = stylex.defineVars({
	n4: "color-mix(in srgb, currentColor 4%, transparent)",
	n5: "color-mix(in srgb, currentColor 5%, transparent)",
	n6: "color-mix(in srgb, currentColor 6%, transparent)",
	n8: "color-mix(in srgb, currentColor 8%, transparent)",
	n10: "color-mix(in srgb, currentColor 10%, transparent)",
	n12: "color-mix(in srgb, currentColor 12%, transparent)",
	n14: "color-mix(in srgb, currentColor 14%, transparent)",
	n18: "color-mix(in srgb, currentColor 18%, transparent)",
})
