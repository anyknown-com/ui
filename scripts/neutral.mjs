// neutral palette 的 color 覆蓋值(light, dark)。ledger 的真相在 tokens.stylex.ts,
// 這裡只放「換一套 palette 時不一樣」的那些 —— 沒列到的 key 沿用 ledger。
//
// 語意色(danger / success / info 與它們的 subtle、diff 的 hl)刻意不換:
// palette 換的是紙與墨,不是紅綠的意思。
export const NEUTRAL = {
	bg: ["#FFFFFF", "#000000"],
	surface: ["#F5F5F7", "#1C1C1E"],
	surfaceRaised: ["#FFFFFF", "#2C2C2E"],
	border: ["#E5E5EA", "#38383A"],
	borderStrong: ["#C7C7CC", "#48484A"],
	text: ["#1D1D1F", "#F5F5F7"],
	textMuted: ["#6E6E73", "#98989D"],
	textFaint: ["#86868B", "#8E8E93"],
	accent: ["#1D1D1F", "#F5F5F7"],
	accentText: ["#FFFFFF", "#000000"],
	accentSubtle: ["#E8E8ED", "#2C2C2E"],
	warning: ["#B25000", "#FFB340"],
	focusRing: ["#1D1D1F", "#F5F5F7"],
	bone: ["#E6E6EA", "#2C2C2E"],
	sheen: ["#F2F2F5", "#3F3F42"],
	layer1: ["#EFEFF2", "#000000"],
	layer2: ["#FFFFFF", "#161618"],
	layer3: ["#F2F2F5", "#242426"],
	layer4: ["#E6E6EA", "#323234"],
	layer5: ["#D9D9DE", "#3F3F42"],
}

/** { key, light, dark } 的 color 清單 → neutral 的同一份清單。 */
export const neutralValue = (v, mode) => NEUTRAL[v.key]?.[mode === "light" ? 0 : 1] ?? v[mode]
