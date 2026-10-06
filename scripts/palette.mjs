// 色彩系統:12 階 OKLCH 原色 → 語意 token,淺色與暗色各一份。
//
// 原色(gray / blue / red / amber / green 的 12 階)只活在這支 script 裡,不匯出;
// 元件只碰語意 token(tokens.stylex.ts 的 color 與 tone)。
//
// 每一階的工作在每個色階、兩個主題都一樣:
//   1–2   背景(紙、桌面)
//   3–5   填色(subtle 底、hover、按下)
//   6–8   邊框(分隔線、較明顯的分隔線)
//   9–10  實心(按鈕底、控制項邊界、icon)
//   11–12 文字(次要文字、主要文字)
// 灰階的 OKLCH chroma 是 0,一點色偏都沒有。主動作是墨色(gray 12),連結也是墨色加底線;
// 藍色只代表「agent 正在做事」、焦點、進度。
//
// 改色:不手調單一 token 的 hex。改下面的色階(GRAY / STEPS / HUES)或 ROLES 的對應,然後
//   node scripts/palette.mjs
// 先看對比表(failures 要是 0),再把最後印出的 JSON 貼回 src/tokens.stylex.ts(color、tone)
// 與 src/tokens.css,然後 pnpm gen:themes。

// ---------- OKLCH → sRGB ----------
function toLinear([L, C, H]) {
	const h = (H * Math.PI) / 180,
		a = C * Math.cos(h),
		b = C * Math.sin(h)
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	]
}
const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)
function clamp([L, C, H]) {
	while (C > 0 && !inGamut(toLinear([L, C, H]))) C -= 0.001
	return [L, Math.max(0, C), H]
}
const enc = (v) => {
	v = Math.min(1, Math.max(0, v))
	return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
}
function hex(lch) {
	const rgb = toLinear(clamp(lch)).map(enc)
	return (
		"#" +
		rgb
			.map((v) =>
				Math.round(v * 255)
					.toString(16)
					.padStart(2, "0"),
			)
			.join("")
			.toUpperCase()
	)
}
const lum = (h) => {
	const c = [1, 3, 5]
		.map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
		.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
	return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const ratio = (a, b) => {
	const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
	return (x + 0.05) / (y + 0.05)
}

// ---------- 原色 ----------
// 灰階:只有明度,chroma 0
const GRAY = {
	light: [1, 0.982, 0.962, 0.945, 0.925, 0.905, 0.868, 0.79, 0.6, 0.545, 0.475, 0.205],
	dark: [0.145, 0.18, 0.21, 0.238, 0.262, 0.29, 0.335, 0.41, 0.56, 0.62, 0.79, 0.955],
}
// 有色階的 1–8 階:所有色相共用同一條明度與 chroma 曲線
const STEPS = {
	light: {
		L: [0.992, 0.979, 0.958, 0.935, 0.908, 0.876, 0.832, 0.765],
		C: [0.006, 0.014, 0.03, 0.045, 0.06, 0.075, 0.095, 0.125],
	},
	dark: {
		L: [0.175, 0.195, 0.235, 0.268, 0.3, 0.335, 0.385, 0.46],
		C: [0.012, 0.02, 0.045, 0.06, 0.072, 0.085, 0.1, 0.12],
	},
}
// 每個色相自己的 9(實心)、11(文字)、12(高對比文字);10 是 9 往外推一點
const HUES = {
	blue: {
		H: 257,
		light: { s9: [0.54, 0.2], t11: [0.51, 0.19], t12: [0.33, 0.1] },
		dark: { s9: [0.56, 0.19], t11: [0.78, 0.13], t12: [0.93, 0.04] },
	},
	red: {
		H: 27,
		light: { s9: [0.555, 0.19], t11: [0.52, 0.17], t12: [0.33, 0.09] },
		dark: { s9: [0.575, 0.19], t11: [0.76, 0.14], t12: [0.93, 0.04] },
	},
	amber: {
		H: 70,
		light: { s9: [0.8, 0.15], t11: [0.53, 0.115], t12: [0.34, 0.07] },
		dark: { s9: [0.8, 0.15], t11: [0.82, 0.13], t12: [0.94, 0.04] },
	},
	green: {
		H: 150,
		light: { s9: [0.52, 0.12], t11: [0.48, 0.11], t12: [0.31, 0.07] },
		dark: { s9: [0.53, 0.13], t11: [0.78, 0.13], t12: [0.93, 0.04] },
	},
}

const MODES = ["light", "dark"]
const scales = { gray: {} }
for (const m of MODES) scales.gray[m] = GRAY[m].map((L) => hex([L, 0, 0]))
for (const [name, h] of Object.entries(HUES)) {
	scales[name] = {}
	for (const m of MODES) {
		const t = STEPS[m],
			p = h[m]
		const steps = t.L.map((L, i) => [L, t.C[i], h.H])
		const s10 = p.s9[0] + (m === "light" ? -0.045 : 0.045)
		steps.push([p.s9[0], p.s9[1], h.H], [s10, p.s9[1], h.H], [...p.t11, h.H], [...p.t12, h.H])
		scales[name][m] = steps.map(hex)
	}
}
// 放在實心(9 階)上的字:白色或 gray 12,哪個讀得清楚用哪個
const onSolid = (name, m) => {
	const s9 = scales[name][m][8]
	return ["#FFFFFF", scales.gray.light[11]].sort((a, b) => ratio(b, s9) - ratio(a, s9))[0]
}

// ---------- 語意 token:[色階, 淺色階數, 暗色階數] ----------
const ROLES = {
	layer1: ["gray", 3, 1], // 桌面:app 最底層
	bg: ["gray", 1, 2], // 紙:主要內容的底
	layer2: ["gray", 1, 2], // 紙(同 bg)
	surface: ["gray", 2, 3], // 凹下去的區塊:輸入框、使用者泡泡、code
	surfaceRaised: ["gray", 1, 4], // 浮起來的:卡片、popover、toast、dialog
	layer3: ["gray", 2, 3],
	layer4: ["gray", 4, 5], // hover
	layer5: ["gray", 5, 6], // 按下
	accentSubtle: ["gray", 4, 5], // 次要按鈕底
	bone: ["gray", 4, 4], // skeleton
	sheen: ["gray", 2, 5], // skeleton 掃光
	border: ["gray", 6, 6], // 分隔線(不是控制項邊界)
	borderStrong: ["gray", 7, 8], // 較明顯的分隔線
	borderControl: ["gray", 9, 9], // 控制項邊界:input、checkbox、radio、switch 關
	textFaint: ["gray", 9, 10], // icon、placeholder、chevron、分隔符;不放要讀的字
	textMuted: ["gray", 11, 11], // 次要文字
	text: ["gray", 12, 12], // 主要文字
	accent: ["gray", 12, 12], // 主動作:墨色實心按鈕、勾選、switch 開
	accentText: ["gray", 1, 2], // 主動作上的字
	link: ["gray", 12, 12], // 連結:墨色加底線
	signal: ["blue", 9, 11], // agent 正在做事、進度
	signalSubtle: ["blue", 3, 3], // agent 狀態的底
	focusRing: ["blue", 9, 11], // 焦點環
	info: ["blue", 9, 11], // 資訊(併入 signal)
	infoSubtle: ["blue", 3, 3],
	danger: ["red", 9, 11], // 刪除、失敗(文字與 icon)
	dangerSolid: ["red", 9, 9], // 不可復原的刪除按鈕底
	dangerSubtle: ["red", 3, 3], // 失敗的底
	dangerHl: ["red", 5, 5], // diff 刪除行
	warning: ["amber", 11, 11], // 警告文字
	warningSubtle: ["amber", 3, 3],
	success: ["green", 11, 11], // 成功文字
	successSubtle: ["green", 3, 3],
	successHl: ["green", 5, 5], // diff 新增行
}
const role = {}
for (const [k, [s, l, d]] of Object.entries(ROLES))
	role[k] = { light: scales[s].light[l - 1], dark: scales[s].dark[d - 1] }
// dangerSolid 上的字
role.onDangerSolid = { light: onSolid("red", "light"), dark: onSolid("red", "dark") }

// tone:color 沒有名字的四個面
const tone = {
	layer6: { light: scales.gray.light[6], dark: scales.gray.dark[6] },
	faint: role.textFaint,
	railLayer2: role.surfaceRaised, // rest 卡片的底
	railLayer3: role.layer4, // rail 裡的 hover
}

// ---------- 檢查 ----------
// [前景, 背景, 最低 WCAG 對比, 用途]。text = 要讀的字(4.5:1);non-text = icon、邊界、焦點環(3:1)
const CHECKS = [
	["text", "bg", 7, "text"],
	["text", "layer1", 7, "text"],
	["text", "surface", 7, "text"],
	["text", "surfaceRaised", 7, "text"],
	["textMuted", "bg", 4.5, "text"],
	["textMuted", "layer1", 4.5, "text"],
	["textMuted", "surface", 4.5, "text"],
	["textMuted", "surfaceRaised", 4.5, "text"],
	["textMuted", "layer4", 4.5, "text"],
	// textFaint 只有 3:1:icon、chevron、placeholder、分隔符,不放要讀的字
	["textFaint", "bg", 3, "non-text"],
	["textFaint", "surface", 3, "non-text"],
	["borderControl", "bg", 3, "non-text"],
	["borderControl", "surface", 3, "non-text"],
	["borderControl", "layer1", 3, "non-text"],
	["accentText", "accent", 4.5, "text"],
	["link", "bg", 4.5, "text"],
	["focusRing", "bg", 3, "non-text"],
	["focusRing", "layer1", 3, "non-text"],
	["signal", "bg", 4.5, "text"],
	["signal", "surface", 3, "non-text"],
	["signal", "signalSubtle", 4.5, "text"],
	["danger", "bg", 4.5, "text"],
	["danger", "dangerSubtle", 4.5, "text"],
	["onDangerSolid", "dangerSolid", 4.5, "text"],
	["warning", "bg", 4.5, "text"],
	["warning", "warningSubtle", 4.5, "text"],
	["success", "bg", 4.5, "text"],
	["success", "successSubtle", 4.5, "text"],
	["text", "successHl", 7, "text"],
	["text", "dangerHl", 7, "text"],
]
let failures = 0
for (const m of MODES) {
	console.log(`\n== ${m}`)
	for (const [f, b, min, kind] of CHECKS) {
		const r = ratio(role[f][m], role[b][m])
		const ok = r >= min
		if (!ok) failures++
		console.log(
			`${ok ? "ok  " : "FAIL"} ${f.padEnd(13)} on ${b.padEnd(13)} ${r.toFixed(2).padStart(5)}:1  (min ${min}, ${kind})`,
		)
	}
	// 灰階必須完全中性:R = G = B
	for (const [i, h] of scales.gray[m].entries()) {
		if (h.slice(1, 3) !== h.slice(3, 5) || h.slice(3, 5) !== h.slice(5, 7)) {
			failures++
			console.log(`FAIL gray ${i + 1} ${h} is not neutral`)
		}
	}
}
console.log("\nfailures:", failures)

const pairs = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [v.light, v.dark]]))
console.log(JSON.stringify({ color: pairs(role), tone: pairs(tone) }, null, 1))
if (failures > 0) process.exitCode = 1
