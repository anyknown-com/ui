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

// 織體紗線階(TEXTURE-GUIDE §3.4):un 底紗、sh 縫隙陰影、y0–y4 面紗(深→淺)、hi 挑面亮紗、
// shadow 是整塊布的落影(§3.3「實心感落地」,掛在元件的 CSS filter 上)
export const yarn = stylex.defineVars({
	un: { default: "#11362C", [DARK]: "#173629" },
	sh: { default: "#123C31", [DARK]: "#1B4437" },
	y0: { default: "#1E6250", [DARK]: "#3F8A70" },
	y1: { default: "#216A55", [DARK]: "#47957A" },
	y2: { default: "#23705A", [DARK]: "#4FA184" },
	y3: { default: "#28795F", [DARK]: "#56A98B" },
	y4: { default: "#2E8266", [DARK]: "#5EB193" },
	hi: { default: "#5CAA89", [DARK]: "#8FD2B4" },
	shadow: {
		default: "drop-shadow(0 1px 1.5px rgba(18, 60, 49, 0.3))",
		[DARK]: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))",
	},
})

// secondary(淺色布)、ghost(疏織)、danger(§3.4 原則從 danger 衍生)、
// subtle(accent-subtle 色系,tabs pills 取景窗用)
export const yarnSecondary = stylex.defineVars({
	un: { default: "#CBC5B4", [DARK]: "#0E0C09" },
	sh: { default: "#C9C4B4", [DARK]: "#15120E" },
	y0: { default: "#E4E0D3", [DARK]: "#2B2620" },
	y1: { default: "#E8E5D9", [DARK]: "#2F2A23" },
	y2: { default: "#EDEAE0", [DARK]: "#332E26" },
	y3: { default: "#F1EEE6", [DARK]: "#38322A" },
	y4: { default: "#F5F3EC", [DARK]: "#3D372E" },
	hi: { default: "#FFFFFF", [DARK]: "#5E5546" },
	shadow: {
		default: "drop-shadow(0 1px 1.5px rgba(80, 74, 60, 0.22))",
		[DARK]: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))",
	},
})

export const yarnGhost = stylex.defineVars({
	un: { default: "transparent", [DARK]: "transparent" },
	sh: { default: "transparent", [DARK]: "transparent" },
	y0: { default: "#DCD8CA", [DARK]: "#2A251F" },
	y1: { default: "#DFDBCE", [DARK]: "#2F2A23" },
	y2: { default: "#E3E0D5", [DARK]: "#35302A" },
	y3: { default: "#E7E4D9", [DARK]: "#39342D" },
	y4: { default: "#EBE8DE", [DARK]: "#3E3830" },
	hi: { default: "#C8C3B4", [DARK]: "#57503F" },
	shadow: { default: "none", [DARK]: "none" },
})

export const yarnDanger = stylex.defineVars({
	un: { default: "#401209", [DARK]: "#38130B" },
	sh: { default: "#4A170D", [DARK]: "#451A10" },
	y0: { default: "#8F3122", [DARK]: "#C25842" },
	y1: { default: "#A13928", [DARK]: "#D0644E" },
	y2: { default: "#B3402E", [DARK]: "#DD7059" },
	y3: { default: "#BC4F3C", [DARK]: "#E17E68" },
	y4: { default: "#C55E4A", [DARK]: "#E58C77" },
	hi: { default: "#E39781", [DARK]: "#F4BCA9" },
	shadow: {
		default: "drop-shadow(0 1px 1.5px rgba(74, 23, 13, 0.3))",
		[DARK]: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))",
	},
})

export const yarnSubtle = stylex.defineVars({
	un: { default: "#CFE2D9", [DARK]: "#141F1B" },
	sh: { default: "#CBDFD5", [DARK]: "#17231E" },
	y0: { default: "#DFEBE5", [DARK]: "#1D2E27" },
	y1: { default: "#E3EEE8", [DARK]: "#20312B" },
	y2: { default: "#E7F0EB", [DARK]: "#22352E" },
	y3: { default: "#ECF3EF", [DARK]: "#263A32" },
	y4: { default: "#F1F7F3", [DARK]: "#2A4038" },
	hi: { default: "#FFFFFF", [DARK]: "#3E5F50" },
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
