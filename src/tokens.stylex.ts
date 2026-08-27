import * as stylex from "@stylexjs/stylex"

// Semantic tokens for all AnyKnown products — direction B "Ledger":
// warm paper ground, ink text, viridian accent. Light is the primary mode;
// dark follows the OS unless a theme from themes.stylex.ts is applied.

const DARK = "@media (prefers-color-scheme: dark)"

export const color = stylex.defineVars({
	bg: { default: "#FAFAF6", [DARK]: "#181613" },
	surface: { default: "#FFFFFF", [DARK]: "#201D18" },
	surfaceRaised: { default: "#FFFFFF", [DARK]: "#282420" },
	border: { default: "#E3E0D5", [DARK]: "#35302A" },
	borderStrong: { default: "#C8C3B4", [DARK]: "#4A443C" },
	text: { default: "#23211D", [DARK]: "#EAE6DC" },
	textMuted: { default: "#777165", [DARK]: "#A59B8C" },
	textFaint: { default: "#9C958A", [DARK]: "#736A5D" },
	accent: { default: "#23705A", [DARK]: "#4FA184" },
	accentText: { default: "#FCFCF9", [DARK]: "#14120F" },
	accentSubtle: { default: "#E7F0EB", [DARK]: "#22352E" },
	danger: { default: "#B3402E", [DARK]: "#DD7059" },
	dangerSubtle: { default: "#F7E7E3", [DARK]: "#3D231E" },
	success: { default: "#23705A", [DARK]: "#4FA184" },
	successSubtle: { default: "#E7F0EB", [DARK]: "#22352E" },
	warning: { default: "#9A6A1B", [DARK]: "#D9A254" },
	warningSubtle: { default: "#F5EBD9", [DARK]: "#3A2F1D" },
	focusRing: { default: "#23705A", [DARK]: "#4FA184" },
	bone: { default: "#ECE9DF", [DARK]: "#2A2620" },
	sheen: { default: "#F6F4EC", [DARK]: "#35302A" },
	successHl: { default: "#C6E0C6", [DARK]: "#2F4A2E" },
	dangerHl: { default: "#EFCEC3", [DARK]: "#573328" },
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
})

export const font = stylex.defineVars({
	display: "'Newsreader Variable', Georgia, 'Times New Roman', serif",
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
	spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
})
