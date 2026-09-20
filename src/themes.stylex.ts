// 這個檔案由 scripts/themes.mjs 從 tokens.stylex.ts 生成 —— 不要手改。
// 重生成:pnpm gen:themes(themes.test.ts 會擋住不同步)
//
// 給有使用者切換主題的 app(例如 next-themes)。tokens 本身跟隨 OS,套上 theme 才會鎖定。
// **要套就整組套**:只套 color 會讓陰影與 tone 停在另一個主題。
import * as stylex from "@stylexjs/stylex"
import { color, shadow, tone } from "./tokens.stylex"

export const lightColor = stylex.createTheme(color, {
	bg: "#FFFFFF",
	surface: "#F5F5F7",
	surfaceRaised: "#FFFFFF",
	border: "#E5E5EA",
	borderStrong: "#C7C7CC",
	text: "#1D1D1F",
	textMuted: "#6E6E73",
	textFaint: "#86868B",
	accent: "#1D1D1F",
	accentText: "#FFFFFF",
	accentSubtle: "#E8E8ED",
	danger: "#B3402E",
	dangerSubtle: "#F7E7E3",
	success: "#23705A",
	successSubtle: "#E7F0EB",
	warning: "#B25000",
	warningSubtle: "#F5EBD9",
	info: "#2C5C86",
	infoSubtle: "#E4EDF5",
	focusRing: "#1D1D1F",
	bone: "#E6E6EA",
	sheen: "#F2F2F5",
	successHl: "#C6E0C6",
	dangerHl: "#EFCEC3",
	layer1: "#EFEFF2",
	layer2: "#FFFFFF",
	layer3: "#F2F2F5",
	layer4: "#E6E6EA",
	layer5: "#D9D9DE",
})

export const lightShadow = stylex.createTheme(shadow, {
	popover: "0 8px 24px rgba(35, 33, 29, 0.1)",
	raised: "0 1px 2px rgba(35, 33, 29, 0.08)",
})

export const lightTone = stylex.createTheme(tone, {
	layer6: "#CDCDD3",
	faint: "#86868B",
	railLayer2: "#FFFFFF",
	railLayer3: "#E6E6EA",
})

export const darkColor = stylex.createTheme(color, {
	bg: "#000000",
	surface: "#1C1C1E",
	surfaceRaised: "#2C2C2E",
	border: "#38383A",
	borderStrong: "#48484A",
	text: "#F5F5F7",
	textMuted: "#98989D",
	textFaint: "#8E8E93",
	accent: "#F5F5F7",
	accentText: "#000000",
	accentSubtle: "#2C2C2E",
	danger: "#DD7059",
	dangerSubtle: "#3D231E",
	success: "#4FA184",
	successSubtle: "#22352E",
	warning: "#FFB340",
	warningSubtle: "#3A2F1D",
	info: "#6FA3CE",
	infoSubtle: "#1E2C38",
	focusRing: "#F5F5F7",
	bone: "#2C2C2E",
	sheen: "#3F3F42",
	successHl: "#2F4A2E",
	dangerHl: "#573328",
	layer1: "#000000",
	layer2: "#161618",
	layer3: "#242426",
	layer4: "#323234",
	layer5: "#3F3F42",
})

export const darkShadow = stylex.createTheme(shadow, {
	popover: "0 8px 24px rgba(0, 0, 0, 0.4)",
	raised: "0 1px 2px rgba(0, 0, 0, 0.3)",
})

export const darkTone = stylex.createTheme(tone, {
	layer6: "#4C4C50",
	faint: "#8E8E93",
	railLayer2: "#242426",
	railLayer3: "#323234",
})

/** 套在 root element 上:`<div {...stylex.props(...light)}>` */
export const light = [lightColor, lightShadow, lightTone] as const
export const dark = [darkColor, darkShadow, darkTone] as const
