// 這個檔案由 scripts/themes.mjs 從 tokens.stylex.ts 生成 —— 不要手改。
// 重生成:pnpm gen:themes(themes.test.ts 會擋住不同步)
//
// 給有使用者切換主題的 app(例如 next-themes)。tokens 本身跟隨 OS,套上 theme 才會鎖定。
// **要套就整組套**:只套 color 會讓布停在另一個主題,深色布配深色字。
import * as stylex from "@stylexjs/stylex"
import { color, yarn, yarnSecondary, yarnGhost, yarnDanger, yarnSubtle, shadow } from "./tokens.stylex"

export const lightColor = stylex.createTheme(color, {
	bg: "#FAFAF6",
	surface: "#FFFFFF",
	surfaceRaised: "#FFFFFF",
	border: "#E3E0D5",
	borderStrong: "#C8C3B4",
	text: "#23211D",
	textMuted: "#635D52",
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

export const darkColor = stylex.createTheme(color, {
	bg: "#181613",
	surface: "#201D18",
	surfaceRaised: "#282420",
	border: "#35302A",
	borderStrong: "#4A443C",
	text: "#EAE6DC",
	textMuted: "#B0A697",
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

/** 套在 root element 上:`<div {...stylex.props(...light)}>` */
export const light = [
	lightColor,
	lightYarn,
	lightYarnSecondary,
	lightYarnGhost,
	lightYarnDanger,
	lightYarnSubtle,
	lightShadow,
] as const
export const dark = [
	darkColor,
	darkYarn,
	darkYarnSecondary,
	darkYarnGhost,
	darkYarnDanger,
	darkYarnSubtle,
	darkShadow,
] as const
