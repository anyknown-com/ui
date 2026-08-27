import * as stylex from "@stylexjs/stylex"
import { color } from "./tokens.stylex"

// Explicit themes for apps with a user-facing theme switch (e.g. next-themes).
// Apply on the root element: <div {...stylex.props(dark)}>.

export const light = stylex.createTheme(color, {
	bg: "#FAFAF6",
	surface: "#FFFFFF",
	surfaceRaised: "#FFFFFF",
	border: "#E3E0D5",
	borderStrong: "#C8C3B4",
	text: "#23211D",
	textMuted: "#777165",
	textFaint: "#9C958A",
	accent: "#23705A",
	accentText: "#FCFCF9",
	accentSubtle: "#E7F0EB",
	danger: "#B3402E",
	dangerSubtle: "#F7E7E3",
	success: "#23705A",
	successSubtle: "#E7F0EB",
	warning: "#9A6A1B",
	warningSubtle: "#F5EBD9",
	focusRing: "#23705A",
	bone: "#ECE9DF",
	sheen: "#F6F4EC",
	successHl: "#C6E0C6",
	dangerHl: "#EFCEC3",
})

export const dark = stylex.createTheme(color, {
	bg: "#181613",
	surface: "#201D18",
	surfaceRaised: "#282420",
	border: "#35302A",
	borderStrong: "#4A443C",
	text: "#EAE6DC",
	textMuted: "#A59B8C",
	textFaint: "#736A5D",
	accent: "#4FA184",
	accentText: "#14120F",
	accentSubtle: "#22352E",
	danger: "#DD7059",
	dangerSubtle: "#3D231E",
	success: "#4FA184",
	successSubtle: "#22352E",
	warning: "#D9A254",
	warningSubtle: "#3A2F1D",
	focusRing: "#4FA184",
	bone: "#2A2620",
	sheen: "#35302A",
	successHl: "#2F4A2E",
	dangerHl: "#573328",
})
