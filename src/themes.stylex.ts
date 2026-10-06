// 這個檔案由 scripts/themes.mjs 從 tokens.stylex.ts 生成 —— 不要手改。
// 重生成:pnpm gen:themes(themes.test.ts 會擋住不同步)
//
// 給有使用者切換主題的 app(例如 next-themes)。tokens 本身跟隨 OS,套上 theme 才會鎖定。
// **要套就整組套**:只套 color 會讓陰影與 tone 停在另一個主題。
import * as stylex from "@stylexjs/stylex"
import { color, shadow, tone } from "./tokens.stylex"

export const lightColor = stylex.createTheme(color, {
	bg: "#FFFFFF",
	surface: "#F4F5F8",
	surfaceRaised: "#FFFFFF",
	border: "#E0E2E6",
	borderStrong: "#C6C9CE",
	text: "#161A1F",
	textMuted: "#5B5F67",
	textFaint: "#7C8088",
	accent: "#1B1E24",
	accentText: "#FFFFFF",
	accentSubtle: "#E9EBEF",
	signal: "#5D55C6",
	signalSubtle: "#EDEFFE",
	danger: "#C72E2B",
	dangerSubtle: "#FFEEEC",
	success: "#227849",
	successSubtle: "#E7F8EC",
	warning: "#A85B05",
	warningSubtle: "#FFF2DE",
	info: "#5D55C6",
	infoSubtle: "#EDEFFE",
	focusRing: "#5D55C6",
	scrim: "rgba(22, 26, 31, 0.32)",
	bone: "#E8E9ED",
	sheen: "#F2F3F6",
	successHl: "#C0EACD",
	dangerHl: "#FFD4CE",
	layer1: "#EDEFF3",
	layer2: "#FFFFFF",
	layer3: "#F4F5F8",
	layer4: "#E9EBEF",
	layer5: "#DDE0E4",
})

export const lightShadow = stylex.createTheme(shadow, {
	rest: "0 0 0 1px #E0E2E6, 0 2px 6px rgba(22, 26, 31, 0.05)",
	float: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
	modal: "0 2px 4px rgba(22, 26, 31, 0.06), 0 24px 56px rgba(22, 26, 31, 0.16)",
	raised: "0 0 0 1px #E0E2E6, 0 2px 6px rgba(22, 26, 31, 0.05)",
	popover: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
	pop: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
	dock: "0 1px 2px rgba(22, 26, 31, 0.06), 0 10px 24px rgba(22, 26, 31, 0.1)",
	sheet: "0 2px 4px rgba(22, 26, 31, 0.06), 0 24px 56px rgba(22, 26, 31, 0.16)",
})

export const lightTone = stylex.createTheme(tone, {
	layer6: "#D1D4DA",
	faint: "#7C8088",
	railLayer2: "#FFFFFF",
	railLayer3: "#E9EBEF",
})

export const darkColor = stylex.createTheme(color, {
	bg: "#15171B",
	surface: "#1D1F24",
	surfaceRaised: "#24272B",
	border: "#303338",
	borderStrong: "#454950",
	text: "#EFF0F3",
	textMuted: "#B7BBC1",
	textFaint: "#83868C",
	accent: "#EFF0F3",
	accentText: "#15171B",
	accentSubtle: "#2B2E33",
	signal: "#A8ABFC",
	signalSubtle: "#2C2C4E",
	danger: "#FA887D",
	dangerSubtle: "#46221E",
	success: "#66C189",
	successSubtle: "#193323",
	warning: "#F2B458",
	warningSubtle: "#402C12",
	info: "#A8ABFC",
	infoSubtle: "#2C2C4E",
	focusRing: "#A8ABFC",
	scrim: "rgba(0, 0, 0, 0.32)",
	bone: "#292B30",
	sheen: "#34373C",
	successHl: "#19482C",
	dangerHl: "#632D28",
	layer1: "#0D0E11",
	layer2: "#15171B",
	layer3: "#1D1F24",
	layer4: "#24272B",
	layer5: "#2D3036",
})

export const darkShadow = stylex.createTheme(shadow, {
	rest: "0 0 0 1px #303338",
	float: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	modal: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
	raised: "0 0 0 1px #303338",
	popover: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	pop: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	dock: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	sheet: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
})

export const darkTone = stylex.createTheme(tone, {
	layer6: "#373B41",
	faint: "#83868C",
	railLayer2: "#1D1F24",
	railLayer3: "#24272B",
})

/** 套在 root element 上:`<div {...stylex.props(...light)}>` */
export const light = [lightColor, lightShadow, lightTone] as const
export const dark = [darkColor, darkShadow, darkTone] as const
