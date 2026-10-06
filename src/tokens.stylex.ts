import * as stylex from "@stylexjs/stylex"

// Semantic tokens for all AnyKnown products, in the 軟材 (tactile) language:
// white paper on a cool grey desk, ink text, ink accent, iris `signal` for agent activity
// and focus. Spec: docs/plans/02-tactile.md. Colour values come from scripts/palette.mjs
// (OKLCH → hex); change them there and paste the output back here.
// Light is the primary mode; dark follows the OS unless a theme from themes.stylex.ts is applied.

const DARK = "@media (prefers-color-scheme: dark)"

export const color = stylex.defineVars({
	bg: { default: "#FFFFFF", [DARK]: "#15171B" },
	surface: { default: "#F4F5F8", [DARK]: "#1D1F24" },
	surfaceRaised: { default: "#FFFFFF", [DARK]: "#24272B" },
	border: { default: "#E0E2E6", [DARK]: "#303338" },
	borderStrong: { default: "#C6C9CE", [DARK]: "#454950" },
	// 控制項邊界(input、checkbox、radio、switch 關):對底色要 3:1 才算看得到
	borderControl: { default: "#81858C", [DARK]: "#6F737A" },
	text: { default: "#161A1F", [DARK]: "#EFF0F3" },
	textMuted: { default: "#5B5F67", [DARK]: "#B7BBC1" },
	textFaint: { default: "#7C8088", [DARK]: "#83868C" },
	accent: { default: "#1B1E24", [DARK]: "#EFF0F3" },
	accentText: { default: "#FFFFFF", [DARK]: "#15171B" },
	accentSubtle: { default: "#E9EBEF", [DARK]: "#2B2E33" },
	// 鳶尾紫:只給 agent 正在做事、焦點環、目前選中的導覽項。不當按鈕底色,不拿來裝飾。
	signal: { default: "#5D55C6", [DARK]: "#A8ABFC" },
	signalSubtle: { default: "#EDEFFE", [DARK]: "#2C2C4E" },
	danger: { default: "#C72E2B", [DARK]: "#FA887D" },
	dangerSubtle: { default: "#FFEEEC", [DARK]: "#46221E" },
	success: { default: "#227849", [DARK]: "#66C189" },
	successSubtle: { default: "#E7F8EC", [DARK]: "#193323" },
	warning: { default: "#A85B05", [DARK]: "#F2B458" },
	warningSubtle: { default: "#FFF2DE", [DARK]: "#402C12" },
	// info 併進 signal:資訊提示跟「agent 在跟你說話」是同一件事。focusRing 也是 signal。
	info: { default: "#5D55C6", [DARK]: "#A8ABFC" },
	infoSubtle: { default: "#EDEFFE", [DARK]: "#2C2C4E" },
	focusRing: { default: "#5D55C6", [DARK]: "#A8ABFC" },
	// dialog 的 backdrop:中性墨 32%,不加 blur(backdrop-filter 是反模式)。暗色用黑。
	scrim: { default: "rgba(22, 26, 31, 0.32)", [DARK]: "rgba(0, 0, 0, 0.32)" },
	bone: { default: "#E8E9ED", [DARK]: "#292B30" },
	sheen: { default: "#F2F3F6", [DARK]: "#34373C" },
	successHl: { default: "#C0EACD", [DARK]: "#19482C" },
	dangerHl: { default: "#FFD4CE", [DARK]: "#632D28" },
	// 分層底色:rail → main → 訊息 → fold → 列,越深的一階數字越大。
	// 面與面靠深淺分,不靠邊框;hover 升一階,對應表在 lib/layers.ts。
	layer1: { default: "#EDEFF3", [DARK]: "#0D0E11" },
	layer2: { default: "#FFFFFF", [DARK]: "#15171B" },
	layer3: { default: "#F4F5F8", [DARK]: "#1D1F24" },
	layer4: { default: "#E9EBEF", [DARK]: "#24272B" },
	layer5: { default: "#DDE0E4", [DARK]: "#2D3036" },
})

// 三階 elevation,越靠近使用者陰影越深。淺色用中性墨(hue 262)染色,暗色用黑;
// rest 的 1px 環是 border 色(暗色只有環,底色升一階由元件給 surface)。
// float、modal 在暗色要配 surfaceRaised 底。
export const shadow = stylex.defineVars({
	// 紙上的卡片:tool card、檔案列、附件
	rest: {
		default: "0 0 0 1px #E0E2E6, 0 2px 6px rgba(22, 26, 31, 0.05)",
		[DARK]: "0 0 0 1px #303338",
	},
	// popover、dropdown、select、tooltip、toast
	float: {
		default: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	// dialog、sheet
	modal: {
		default: "0 2px 4px rgba(22, 26, 31, 0.06), 0 24px 56px rgba(22, 26, 31, 0.16)",
		[DARK]: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
	},
	// 舊名,值跟著最接近的新階走,元件改完前不會跟新階打架。新程式碼用上面三個。
	raised: {
		default: "0 0 0 1px #E0E2E6, 0 2px 6px rgba(22, 26, 31, 0.05)",
		[DARK]: "0 0 0 1px #303338",
	},
	popover: {
		default: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	pop: {
		default: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	dock: {
		default: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	sheet: {
		default: "0 2px 4px rgba(22, 26, 31, 0.06), 0 24px 56px rgba(22, 26, 31, 0.16)",
		[DARK]: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
	},
})

export const font = stylex.defineVars({
	display:
		"'Figtree Variable', 'Figtree', 'Noto Sans TC Variable', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
	body: "'Figtree Variable', 'Figtree', 'Noto Sans TC Variable', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
	mono: "'Geist Mono Variable', 'Noto Sans TC Variable', 'Noto Sans TC', ui-monospace, monospace",
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

// Product-level scales: four text sizes, the corner each kind of control wears,
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
	layer6: { default: "#D1D4DA", [DARK]: "#373B41" },
	faint: { default: "#7C8088", [DARK]: "#83868C" },
	railLayer2: { default: "#FFFFFF", [DARK]: "#1D1F24" },
	railLayer3: { default: "#E9EBEF", [DARK]: "#24272B" },
})

// 圓角跟尺寸走:越靠近使用者越圓。巢狀時內層圓角 = 外層 − padding。
// 前七個是軟材的角色名;ib / md / btn / sm / xs 是舊名,元件改完前保留。
export const corner = stylex.defineVars({
	// checkbox、kbd、小 chip 的內角
	small: "6px",
	// input、select、textarea、segmented 外框
	control: "12px",
	// 紙上的卡片(rest)
	card: "14px",
	// toast、popover、dropdown
	float: "16px",
	// composer、主紙
	sheet: "20px",
	// dialog
	modal: "24px",
	// 按鈕、badge、tag、switch、進度條、LiveDot 外框
	pill: "9999px",
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
