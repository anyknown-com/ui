// 這個檔案由 scripts/themes.mjs 從 tokens.stylex.ts 生成 —— 不要手改。
// 重生成:pnpm gen:themes(themes.test.ts 會擋住不同步)
//
// 給有使用者切換主題的 app(例如 next-themes)。tokens 本身跟隨 OS,套上 theme 才會鎖定。
// **要套就整組套**:只套 color 會讓布停在另一個主題,深色布配深色字。
import * as stylex from "@stylexjs/stylex"
import { color, yarn, yarnSecondary, yarnGhost, yarnDanger, yarnSubtle, shadow, tone } from "./tokens.stylex"

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

export const lightYarn = stylex.createTheme(yarn, {
	un: "#11362C",
	sh: "#123C31",
	y0: "#1E6250",
	y1: "#216A55",
	y2: "#23705A",
	y3: "#28795F",
	y4: "#2E8266",
	hi: "#5CAA89",
	shadow: "drop-shadow(0 1px 1.5px rgba(18, 60, 49, 0.3))",
})

export const lightYarnSecondary = stylex.createTheme(yarnSecondary, {
	un: "#CBC5B4",
	sh: "#C9C4B4",
	y0: "#E4E0D3",
	y1: "#E8E5D9",
	y2: "#EDEAE0",
	y3: "#F1EEE6",
	y4: "#F5F3EC",
	hi: "#FFFFFF",
	shadow: "drop-shadow(0 1px 1.5px rgba(80, 74, 60, 0.22))",
})

export const lightYarnGhost = stylex.createTheme(yarnGhost, {
	un: "transparent",
	sh: "transparent",
	y0: "#DCD8CA",
	y1: "#DFDBCE",
	y2: "#E3E0D5",
	y3: "#E7E4D9",
	y4: "#EBE8DE",
	hi: "#C8C3B4",
	shadow: "none",
})

export const lightYarnDanger = stylex.createTheme(yarnDanger, {
	un: "#401209",
	sh: "#4A170D",
	y0: "#8F3122",
	y1: "#A13928",
	y2: "#B3402E",
	y3: "#BC4F3C",
	y4: "#C55E4A",
	hi: "#E39781",
	shadow: "drop-shadow(0 1px 1.5px rgba(74, 23, 13, 0.3))",
})

export const lightYarnSubtle = stylex.createTheme(yarnSubtle, {
	un: "#CFE2D9",
	sh: "#CBDFD5",
	y0: "#DFEBE5",
	y1: "#E3EEE8",
	y2: "#E7F0EB",
	y3: "#ECF3EF",
	y4: "#F1F7F3",
	hi: "#FFFFFF",
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

export const darkYarn = stylex.createTheme(yarn, {
	un: "#173629",
	sh: "#1B4437",
	y0: "#3F8A70",
	y1: "#47957A",
	y2: "#4FA184",
	y3: "#56A98B",
	y4: "#5EB193",
	hi: "#8FD2B4",
	shadow: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))",
})

export const darkYarnSecondary = stylex.createTheme(yarnSecondary, {
	un: "#0E0C09",
	sh: "#15120E",
	y0: "#2B2620",
	y1: "#2F2A23",
	y2: "#332E26",
	y3: "#38322A",
	y4: "#3D372E",
	hi: "#5E5546",
	shadow: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))",
})

export const darkYarnGhost = stylex.createTheme(yarnGhost, {
	un: "transparent",
	sh: "transparent",
	y0: "#2A251F",
	y1: "#2F2A23",
	y2: "#35302A",
	y3: "#39342D",
	y4: "#3E3830",
	hi: "#57503F",
	shadow: "none",
})

export const darkYarnDanger = stylex.createTheme(yarnDanger, {
	un: "#38130B",
	sh: "#451A10",
	y0: "#C25842",
	y1: "#D0644E",
	y2: "#DD7059",
	y3: "#E17E68",
	y4: "#E58C77",
	hi: "#F4BCA9",
	shadow: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))",
})

export const darkYarnSubtle = stylex.createTheme(yarnSubtle, {
	un: "#141F1B",
	sh: "#17231E",
	y0: "#1D2E27",
	y1: "#20312B",
	y2: "#22352E",
	y3: "#263A32",
	y4: "#2A4038",
	hi: "#3E5F50",
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
export const light = [
	lightColor,
	lightYarn,
	lightYarnSecondary,
	lightYarnGhost,
	lightYarnDanger,
	lightYarnSubtle,
	lightShadow,
	lightTone,
] as const
export const dark = [
	darkColor,
	darkYarn,
	darkYarnSecondary,
	darkYarnGhost,
	darkYarnDanger,
	darkYarnSubtle,
	darkShadow,
	darkTone,
] as const
