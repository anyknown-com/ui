// 這個檔案由 scripts/themes.mjs 從 tokens.stylex.ts 生成 —— 不要手改。
// 重生成:pnpm gen:themes(themes.test.ts 會擋住不同步)
//
// 給有使用者切換主題的 app(例如 next-themes)。tokens 本身跟隨 OS,套上 theme 才會鎖定。
// **要套就整組套**:只套 color 會讓陰影與 tone 停在另一個主題。
import * as stylex from "@stylexjs/stylex"
import { color, shadow, tone } from "./tokens.stylex"

export const lightColor = stylex.createTheme(color, {
	bg: "#FFFFFF",
	surface: "#F9F9F9",
	surfaceRaised: "#FFFFFF",
	border: "#DFDFDF",
	borderStrong: "#D3D3D3",
	borderControl: "#808080",
	text: "#171717",
	textMuted: "#5C5C5C",
	textFaint: "#808080",
	accent: "#171717",
	accentText: "#FFFFFF",
	accentSubtle: "#EDEDED",
	link: "#171717",
	signal: "#0169DA",
	signalSubtle: "#E9F2FF",
	danger: "#CA322E",
	dangerSubtle: "#FEECEA",
	dangerSolid: "#CA322E",
	onDangerSolid: "#FFFFFF",
	success: "#246E3A",
	successSubtle: "#E4F7E7",
	warning: "#955E02",
	warningSubtle: "#FFEEDC",
	info: "#0169DA",
	infoSubtle: "#E9F2FF",
	focusRing: "#0169DA",
	scrim: "rgba(0, 0, 0, 0.32)",
	bone: "#EDEDED",
	sheen: "#F9F9F9",
	successHl: "#C5EDCC",
	dangerHl: "#FFD6D0",
	layer1: "#F2F2F2",
	layer2: "#FFFFFF",
	layer3: "#F9F9F9",
	layer4: "#EDEDED",
	layer5: "#E6E6E6",
})

export const lightShadow = stylex.createTheme(shadow, {
	rest: "0 0 0 1px #DFDFDF, 0 2px 6px rgba(0, 0, 0, 0.05)",
	float: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
	modal: "0 2px 4px rgba(0, 0, 0, 0.06), 0 24px 56px rgba(0, 0, 0, 0.16)",
	raised: "0 0 0 1px #DFDFDF, 0 2px 6px rgba(0, 0, 0, 0.05)",
	popover: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
	pop: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
	dock: "0 1px 2px rgba(0, 0, 0, 0.06), 0 10px 24px rgba(0, 0, 0, 0.1)",
	sheet: "0 2px 4px rgba(0, 0, 0, 0.06), 0 24px 56px rgba(0, 0, 0, 0.16)",
})

export const lightTone = stylex.createTheme(tone, {
	layer6: "#D3D3D3",
	faint: "#808080",
	railLayer2: "#FFFFFF",
	railLayer3: "#EDEDED",
})

export const darkColor = stylex.createTheme(color, {
	bg: "#121212",
	surface: "#181818",
	surfaceRaised: "#1F1F1F",
	border: "#2B2B2B",
	borderStrong: "#4A4A4A",
	borderControl: "#747474",
	text: "#F0F0F0",
	textMuted: "#BABABA",
	textFaint: "#868686",
	accent: "#F0F0F0",
	accentText: "#121212",
	accentSubtle: "#242424",
	link: "#F0F0F0",
	signal: "#89BAFE",
	signalSubtle: "#101E33",
	danger: "#FE8C80",
	dangerSubtle: "#301512",
	dangerSolid: "#D23934",
	onDangerSolid: "#FFFFFF",
	success: "#76CF8A",
	successSubtle: "#0C2412",
	warning: "#FAB45F",
	warningSubtle: "#2B1A04",
	info: "#89BAFE",
	infoSubtle: "#101E33",
	focusRing: "#89BAFE",
	scrim: "rgba(0, 0, 0, 0.32)",
	bone: "#1F1F1F",
	sheen: "#242424",
	successHl: "#0B3719",
	dangerHl: "#4C1D19",
	layer1: "#0A0A0A",
	layer2: "#121212",
	layer3: "#181818",
	layer4: "#242424",
	layer5: "#2B2B2B",
})

export const darkShadow = stylex.createTheme(shadow, {
	rest: "0 0 0 1px #2B2B2B",
	float: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	modal: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
	raised: "0 0 0 1px #2B2B2B",
	popover: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	pop: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	dock: "0 1px 2px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.4)",
	sheet: "0 2px 4px rgba(0, 0, 0, 0.6), 0 24px 56px rgba(0, 0, 0, 0.6)",
})

export const darkTone = stylex.createTheme(tone, {
	layer6: "#373737",
	faint: "#868686",
	railLayer2: "#1F1F1F",
	railLayer3: "#242424",
})

/** Apply on the root element: `<div {...stylex.props(...light)}>` */
export const light = [lightColor, lightShadow, lightTone] as const
export const dark = [darkColor, darkShadow, darkTone] as const
