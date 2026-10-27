import * as stylex from "@stylexjs/stylex"

// Semantic tokens for all AnyKnown products, in the pencil-sketch language: one sheet, no
// lines, color only for status. Spec: DESIGN.md section 1. Colour values come
// from scripts/palette.mjs (12-step OKLCH scales → hex); change the scale there, rerun it and
// paste the output back here. Never hand-tune a single value.
// Light is the primary mode; dark follows the OS unless a theme from themes.stylex.ts is applied.

const DARK = "@media (prefers-color-scheme: dark)"

export const color = stylex.defineVars({
	bg: { default: "#FFFFFF", [DARK]: "#121212" },
	surfaceRaised: { default: "#FFFFFF", [DARK]: "#1F1F1F" },
	// 控制項邊界(input、checkbox、radio、switch 關):對底色要 3:1 才算看得到
	borderControl: { default: "#808080", [DARK]: "#747474" },
	text: { default: "#171717", [DARK]: "#F0F0F0" },
	textMuted: { default: "#5C5C5C", [DARK]: "#BABABA" },
	// 藍:只給 agent 正在做事、焦點環、進度。不當按鈕底色,不拿來裝飾。
	signal: { default: "#0169DA", [DARK]: "#89BAFE" },
	danger: { default: "#CA322E", [DARK]: "#FE8C80" },
	success: { default: "#246E3A", [DARK]: "#76CF8A" },
	warning: { default: "#955E02", [DARK]: "#FAB45F" },
	focusRing: { default: "#0169DA", [DARK]: "#89BAFE" },
	// dialog 的 backdrop:黑 32%,不加 blur(backdrop-filter 是反模式)。
	scrim: { default: "rgba(0, 0, 0, 0.32)", [DARK]: "rgba(0, 0, 0, 0.32)" },
	// Ink at 6% / 11% / 26% (rgba, so native-gen can read it). A wash is a tint on things you press,
	// not another sheet; washStrong is for bars, slider tracks, sheet handles and scrollbars.
	wash: { default: "rgba(23, 23, 23, 0.06)", [DARK]: "rgba(240, 240, 240, 0.06)" },
	washHover: { default: "rgba(23, 23, 23, 0.11)", [DARK]: "rgba(240, 240, 240, 0.11)" },
	washStrong: { default: "rgba(23, 23, 23, 0.26)", [DARK]: "rgba(240, 240, 240, 0.26)" },
})

// Two elevations, for things that float. Shadows are always black, never tinted.
// float and modal need a surfaceRaised fill in dark.
export const shadow = stylex.defineVars({
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
})

export const font = stylex.defineVars({
	display:
		"'Geist Variable', 'Geist', 'Noto Sans TC Variable', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
	body: "'Geist Variable', 'Geist', 'Noto Sans TC Variable', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif",
	mono: "'Geist Mono Variable', 'Geist Mono', 'Noto Sans TC Variable', 'Noto Sans TC', ui-monospace, monospace",
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

/**
 * Durations and curves. Five durations, shortest first: pick by how far the thing travels,
 * not by taste. Nothing bounces. Four more are loop periods, for animations that repeat while
 * something is going on (spinners, a blinking caret, pulses, shimmers).
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
	/** 0.8s loop: spinners. Pair with `linear`. */
	loopFast: "0.8s",
	/** 1s loop: a blinking text caret, with `steps(2, start)`. */
	blink: "1s",
	/** 1.2s loop: a pending pulse. Pair with `easeInOut`. */
	loop: "1.2s",
	/** 1.6s loop: the live dot's breath, shimmers and indeterminate sweeps. */
	loopSlow: "1.6s",
	ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
	/** The default curve for enters and for anything that moves. */
	easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
	/** Looping pulses (live dot, typing dots). */
	easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
	/** Spinners and indeterminate progress, which must keep a constant speed. */
	linear: "linear",
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

// Product-level scales: the type scale and the three corners.

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
	/** 13px: monospace code blocks and diffs (monospace reads larger than the body font). */
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

// Three corners, by what the thing is. Nested: inner corner = outer corner minus padding.
export const corner = stylex.defineVars({
	// shape: a pill, for things always one line tall (button, chip, single-line field, menu row)
	shape: "9999px",
	// box: for boxes that grow with their content (composer, textarea, menu, dialog, sheet top, toast, tooltip, image)
	box: "24px",
	// check: the checkbox square only
	check: "4px",
})
