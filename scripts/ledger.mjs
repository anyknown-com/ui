// ledger palette 的 color 覆蓋值(light, dark)。neutral 的真相在 tokens.stylex.ts,
// 這裡只放「換一套 palette 時不一樣」的那些 —— 沒列到的 key 沿用 neutral。
//
// 語意色(danger / success / info 與它們的 subtle、diff 的 hl)刻意不換:
// palette 換的是紙與墨,不是紅綠的意思。
export const LEDGER = {
	bg: ["#FAFAF6", "#181613"],
	surface: ["#FFFFFF", "#201D18"],
	surfaceRaised: ["#FFFFFF", "#282420"],
	border: ["#E3E0D5", "#35302A"],
	borderStrong: ["#C8C3B4", "#4A443C"],
	text: ["#23211D", "#EAE6DC"],
	textMuted: ["#635D52", "#B0A697"],
	textFaint: ["#9C958A", "#736A5D"],
	accent: ["#23705A", "#4FA184"],
	accentText: ["#FCFCF9", "#14120F"],
	accentSubtle: ["#E7F0EB", "#22352E"],
	warning: ["#9A6A1B", "#D9A254"],
	focusRing: ["#23705A", "#4FA184"],
	bone: ["#ECE9DF", "#2A2620"],
	sheen: ["#F6F4EC", "#35302A"],
	layer1: ["#EFECE3", "#0E0C09"],
	layer2: ["#FAFAF6", "#181613"],
	layer3: ["#F1EFE7", "#211E19"],
	layer4: ["#E8E5DA", "#2B2721"],
	layer5: ["#DEDACD", "#35302A"],
}

/** { key, light, dark } 的 color 清單 → ledger 的同一份清單。 */
export const ledgerValue = (v, mode) => LEDGER[v.key]?.[mode === "light" ? 0 : 1] ?? v[mode]
