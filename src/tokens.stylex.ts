import * as stylex from "@stylexjs/stylex"

// Semantic tokens for all AnyKnown products, in the 軟材 (tactile) language:
// white paper on a neutral grey desk (chroma 0), ink text, ink accent, ink links, blue `signal`
// for agent activity, focus and progress. Spec: docs/plans/02-tactile.md. Colour values come
// from scripts/palette.mjs (12-step OKLCH scales → hex); change the scale there, rerun it and
// paste the output back here. Never hand-tune a single value.
// Light is the primary mode; dark follows the OS unless a theme from themes.stylex.ts is applied.

const DARK = "@media (prefers-color-scheme: dark)"

export const color = stylex.defineVars({
	bg: { default: "#FFFFFF", [DARK]: "#121212" },
	surface: { default: "#F9F9F9", [DARK]: "#181818" },
	surfaceRaised: { default: "#FFFFFF", [DARK]: "#1F1F1F" },
	border: { default: "#DFDFDF", [DARK]: "#2B2B2B" },
	borderStrong: { default: "#D3D3D3", [DARK]: "#4A4A4A" },
	// 控制項邊界(input、checkbox、radio、switch 關):對底色要 3:1 才算看得到
	borderControl: { default: "#808080", [DARK]: "#747474" },
	text: { default: "#171717", [DARK]: "#F0F0F0" },
	textMuted: { default: "#5C5C5C", [DARK]: "#BABABA" },
	textFaint: { default: "#808080", [DARK]: "#868686" },
	accent: { default: "#171717", [DARK]: "#F0F0F0" },
	accentText: { default: "#FFFFFF", [DARK]: "#121212" },
	accentSubtle: { default: "#EDEDED", [DARK]: "#242424" },
	// 連結:墨色加底線,不用藍
	link: { default: "#171717", [DARK]: "#F0F0F0" },
	// 藍:只給 agent 正在做事、焦點環、進度。不當按鈕底色,不拿來裝飾。
	signal: { default: "#0169DA", [DARK]: "#89BAFE" },
	signalSubtle: { default: "#E9F2FF", [DARK]: "#101E33" },
	danger: { default: "#CA322E", [DARK]: "#FE8C80" },
	dangerSubtle: { default: "#FEECEA", [DARK]: "#301512" },
	// 只給不可復原的刪除按鈕;onDangerSolid 是上面的字
	dangerSolid: { default: "#CA322E", [DARK]: "#D23934" },
	onDangerSolid: { default: "#FFFFFF", [DARK]: "#FFFFFF" },
	success: { default: "#246E3A", [DARK]: "#76CF8A" },
	successSubtle: { default: "#E4F7E7", [DARK]: "#0C2412" },
	warning: { default: "#955E02", [DARK]: "#FAB45F" },
	warningSubtle: { default: "#FFEEDC", [DARK]: "#2B1A04" },
	// info 併進 signal:資訊提示跟「agent 在跟你說話」是同一件事。focusRing 也是 signal。
	info: { default: "#0169DA", [DARK]: "#89BAFE" },
	infoSubtle: { default: "#E9F2FF", [DARK]: "#101E33" },
	focusRing: { default: "#0169DA", [DARK]: "#89BAFE" },
	// dialog 的 backdrop:黑 32%,不加 blur(backdrop-filter 是反模式)。
	scrim: { default: "rgba(0, 0, 0, 0.32)", [DARK]: "rgba(0, 0, 0, 0.32)" },
	bone: { default: "#EDEDED", [DARK]: "#1F1F1F" },
	sheen: { default: "#F9F9F9", [DARK]: "#242424" },
	successHl: { default: "#C5EDCC", [DARK]: "#0B3719" },
	dangerHl: { default: "#FFD6D0", [DARK]: "#4C1D19" },
	// 分層底色:rail → main → 訊息 → fold → 列,越深的一階數字越大。
	// 面與面靠深淺分,不靠邊框;hover 升一階,對應表在 lib/layers.ts。
	layer1: { default: "#F2F2F2", [DARK]: "#0A0A0A" },
	layer2: { default: "#FFFFFF", [DARK]: "#121212" },
	layer3: { default: "#F9F9F9", [DARK]: "#181818" },
	layer4: { default: "#EDEDED", [DARK]: "#242424" },
	layer5: { default: "#E6E6E6", [DARK]: "#2B2B2B" },
})

// 三階 elevation,越靠近使用者陰影越深。陰影一律用黑,不染色;
// rest 的 1px 環是 border 色(暗色只有環,底色升一階由元件給 surface)。
// float、modal 在暗色要配 surfaceRaised 底。
export const shadow = stylex.defineVars({
	// 紙上的卡片:tool card、檔案列、附件
	rest: {
		default: "0 0 0 1px #DFDFDF, 0 2px 6px rgba(0, 0, 0, 0.05)",
		[DARK]: "0 0 0 1px #2B2B2B",
	},
	// popover、dropdown、select、tooltip、toast
	float: {
		default: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	// dialog、sheet
	modal: {
		default: "0 2px 4px rgba(0, 0, 0, 0.06), 0 24px 56px rgba(0, 0, 0, 0.16)",
		[DARK]: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
	},
	// 舊名,值跟著最接近的新階走,元件改完前不會跟新階打架。新程式碼用上面三個。
	raised: {
		default: "0 0 0 1px #DFDFDF, 0 2px 6px rgba(0, 0, 0, 0.05)",
		[DARK]: "0 0 0 1px #2B2B2B",
	},
	popover: {
		default: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	pop: {
		default: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	dock: {
		default: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	},
	sheet: {
		default: "0 2px 4px rgba(0, 0, 0, 0.06), 0 24px 56px rgba(0, 0, 0, 0.16)",
		[DARK]: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
	},
})

export const font = stylex.defineVars({
	display:
		"'Figtree Variable', 'Figtree', 'Noto Sans TC Variable', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
	body: "'Figtree Variable', 'Figtree', 'Noto Sans TC Variable', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
	mono: "'Geist Mono Variable', 'Geist Mono', 'Noto Sans TC Variable', 'Noto Sans TC', ui-monospace, monospace",
})

/**
 * @deprecated The old type scale. Use `type`; each key names its replacement. Values are left
 * as they were, so code still on `text` renders exactly as before.
 */
export const text = stylex.defineVars({
	/** @deprecated Use `type.t1` (11px; this is 12px). */
	xs: "0.75rem",
	/** @deprecated Use `type.t2` (13px; this is 14px). */
	sm: "0.875rem",
	/** @deprecated Use `type.t3` (15px; this is 16px), or `type.phoneInput` for a phone-size input. */
	base: "1rem",
	/** @deprecated Use `type.t4` (17px; this is 18px). */
	lg: "1.125rem",
	/** @deprecated Use `type.t5` (same 22px). */
	xl: "1.375rem",
	/** @deprecated Use `type.t6` (same 28px). */
	xxl: "1.75rem",
	/** @deprecated Use `type.t7` (same 36px). */
	display: "2.25rem",
	/** @deprecated Use `type.code` (same 13px). */
	code: "0.8125rem",
	/** @deprecated Use `type.dense` (same 1.2). */
	leadingTight: "1.2",
	/** @deprecated Use `type.snug` (1.45). */
	leadingSnug: "1.4",
	/** @deprecated Use `type.snug` (1.45). */
	leadingNormal: "1.5",
	/** @deprecated Use `type.body` (same 1.6). */
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

/**
 * Durations and curves. Five durations, shortest first: pick by how far the thing travels,
 * not by taste. Nothing bounces.
 *
 * Old literals map as: 120ms, 140ms → `fast`; 160ms, 180ms → `quick`; 200ms → `normal`;
 * 240ms, 300ms → `slide`. Keyword `ease-out` → `easeOut`, `ease-in-out` → `easeInOut`,
 * `linear` → `linear`. Reduced motion still uses `"0s"`, which is not a token.
 */
export const motion = stylex.defineVars({
	/** 120ms: press feedback, hover washes, popup exit. */
	fast: "120ms",
	/** 160ms: small enters (popup, dialog, check marks), colour and border changes. */
	quick: "160ms",
	/** 200ms: panels and folds opening. */
	normal: "200ms",
	/** 240ms: things that slide (tab indicator, switch thumb, sheet). Pair with `easeOut`. */
	slide: "240ms",
	/** 400ms: large surfaces and deliberate reveals. */
	slow: "400ms",
	ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
	/** The default curve for enters and for anything that moves. */
	easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
	/** Looping pulses (live dot, typing dots). */
	easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
	/** Spinners and indeterminate progress, which must keep a constant speed. */
	linear: "linear",
	/**
	 * @deprecated Overshoots, and the house rule is "motion never bounces"; nothing uses it.
	 * Use `easeOut`. Kept only because it is in the published API.
	 */
	spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
})

/**
 * Stacking order for everything that portals to `<body>`. Base UI popups, dialogs and toasts
 * share one stacking context, so the numbers live in one table: popup above dialog (what you
 * are using is on top), tooltip above popup (a popup's contents can have tooltips), toast
 * above everything (a non-blocking notice is never covered).
 *
 * Constants, inlined at build time: `zIndex: zIndex.popup` works in any `stylex.create`, and
 * `zIndex.popup` is a plain number in JS. Stacking inside one component (`zIndex: 1`) does
 * not belong here.
 */
export const zIndex = stylex.defineConsts({
	dialogBackdrop: 70,
	dialog: 71,
	popup: 75,
	tooltip: 78,
	toast: 80,
})

/**
 * Media queries, as constants so they can be StyleX condition keys:
 * `fontSize: { default: type.t2, [breakpoint.phone]: type.phoneInput }`.
 * `phone` (≤ 45rem / 720px): controls go full width and inputs grow to 16px.
 * `tablet` (≤ 55rem / 880px): the docs site drops its sidebar.
 */
export const breakpoint = stylex.defineConsts({
	phone: "@media (max-width: 45rem)",
	tablet: "@media (max-width: 55rem)",
})

/** Icon boxes. An icon draws at the size it is given; stroke 2, currentColor. See `icon/icon.ts`. */
export const iconSize = stylex.defineVars({
	xs: "12px",
	sm: "14px",
	md: "16px",
	base: "18px",
	lg: "20px",
})

/**
 * Keyboard focus ring geometry. The colour is `color.focusRing`:
 * `outline: { default: "none", ":focus-visible": \`${focusRing.width} solid ${color.focusRing}\` }`.
 */
export const focusRing = stylex.defineVars({
	width: "2px",
})

// Product-level scales: the type scale, the corner each kind of control wears,
// the ink washes hover paints with, and the four surfaces `color` has no name for.

/**
 * The one type scale. Sizes are rem so they follow the reader's font-size setting; the px in
 * each note is at the default 16px root. Steps t1–t4 are the UI, t5–t7 are headings.
 * Line heights sit in the same group: `body` for running text, `snug` / `tight` for UI rows,
 * `dense` for headings and single-line controls.
 */
export const type = stylex.defineVars({
	/** 11px: chips, counters, timestamps, help and error lines. */
	t1: "0.6875rem",
	/** 13px: controls, labels, table cells, secondary text. */
	t2: "0.8125rem",
	/** 15px: body text and conversation. */
	t3: "0.9375rem",
	/** 17px: small headings (dialog title, markdown h1). */
	t4: "1.0625rem",
	/** 22px: section title (`<Text variant="title">`). */
	t5: "1.375rem",
	/** 28px: page title. */
	t6: "1.75rem",
	/** 36px: display (`<Text variant="display">`). */
	t7: "2.25rem",
	/** 13px: monospace code blocks and diffs (Geist Mono reads larger than Figtree). */
	code: "0.8125rem",
	/**
	 * 16px: text inputs at `breakpoint.phone` only. iOS Safari zooms the page when a focused
	 * field is under 16px, so this is the floor there; it is not a step of the scale.
	 */
	phoneInput: "1rem",
	/** Line height for running text (15px body). */
	body: "1.6",
	/** Line height for compact UI rows (chips, list rows, table cells). */
	tight: "1.35",
	/** Line height for UI text that may wrap. */
	snug: "1.45",
	/** Line height for t5–t7 headings and single-line controls (button labels). */
	dense: "1.2",
})

export const tone = stylex.defineVars({
	layer6: { default: "#D3D3D3", [DARK]: "#373737" },
	faint: { default: "#808080", [DARK]: "#868686" },
	railLayer2: { default: "#FFFFFF", [DARK]: "#1F1F1F" },
	railLayer3: { default: "#EDEDED", [DARK]: "#242424" },
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
