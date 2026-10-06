// Tactile palette: OKLCH source → sRGB hex, gamut-clamped, with WCAG + APCA checks.
//
// 色值的來源。tokens.stylex.ts 的 color 與 tone 是從這裡的輸出抄過去的 hex,改色就改這裡:
//   node scripts/palette.mjs
// 先看對比表(failures 要是 0),再把最後印出的 JSON 貼回 tokens.stylex.ts 與 tokens.css,
// 然後 pnpm gen:themes。info / infoSubtle / focusRing 用 signal 的值,tone 對應見 tokens.stylex.ts。
const N = 262 // neutral hue (cool, low chroma)
const S = 282 // signal hue (iris)

const P = {
	light: {
		bg: [1, 0, N],
		surface: [0.97, 0.004, N],
		surfaceRaised: [1, 0, N],
		border: [0.912, 0.006, N],
		borderStrong: [0.835, 0.008, N],
		borderControl: [0.615, 0.012, N],
		text: [0.215, 0.012, N],
		textMuted: [0.485, 0.014, N],
		textFaint: [0.6, 0.012, N],
		accent: [0.235, 0.012, N],
		accentText: [1, 0, N],
		accentSubtle: [0.94, 0.006, N],
		signal: [0.52, 0.17, S],
		signalSubtle: [0.955, 0.024, S],
		danger: [0.545, 0.19, 27],
		dangerSubtle: [0.962, 0.02, 27],
		success: [0.51, 0.11, 155],
		successSubtle: [0.962, 0.024, 155],
		warning: [0.55, 0.13, 58],
		warningSubtle: [0.966, 0.03, 80],
		bone: [0.935, 0.005, N],
		sheen: [0.965, 0.004, N],
		successHl: [0.9, 0.06, 155],
		dangerHl: [0.905, 0.05, 27],
		layer1: [0.952, 0.006, N],
		layer2: [1, 0, N],
		layer3: [0.97, 0.004, N],
		layer4: [0.94, 0.006, N],
		layer5: [0.905, 0.007, N],
		layer6: [0.87, 0.008, N],
	},
	dark: {
		bg: [0.205, 0.008, N],
		surface: [0.24, 0.009, N],
		surfaceRaised: [0.27, 0.01, N],
		border: [0.32, 0.01, N],
		borderStrong: [0.405, 0.012, N],
		borderControl: [0.555, 0.012, N],
		text: [0.955, 0.004, N],
		textMuted: [0.79, 0.01, N],
		textFaint: [0.62, 0.01, N],
		accent: [0.955, 0.004, N],
		accentText: [0.205, 0.008, N],
		accentSubtle: [0.3, 0.01, N],
		signal: [0.77, 0.115, S],
		signalSubtle: [0.31, 0.06, S],
		danger: [0.75, 0.14, 27],
		dangerSubtle: [0.3, 0.055, 27],
		success: [0.74, 0.12, 155],
		successSubtle: [0.295, 0.045, 155],
		warning: [0.81, 0.13, 75],
		warningSubtle: [0.31, 0.05, 70],
		bone: [0.29, 0.009, N],
		sheen: [0.335, 0.01, N],
		successHl: [0.36, 0.07, 155],
		dangerHl: [0.37, 0.08, 27],
		layer1: [0.165, 0.007, N],
		layer2: [0.205, 0.008, N],
		layer3: [0.24, 0.009, N],
		layer4: [0.27, 0.01, N],
		layer5: [0.31, 0.011, N],
		layer6: [0.35, 0.012, N],
	},
}

function oklchToLinear([L, C, H]) {
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
function clamp(lch) {
	let [L, C, H] = lch
	while (C > 0 && !inGamut(oklchToLinear([L, C, H]))) C -= 0.001
	return [L, C, H]
}
const enc = (v) => {
	v = Math.min(1, Math.max(0, v))
	return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
}
function hex(lch) {
	const rgb = oklchToLinear(clamp(lch)).map(enc)
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
const wcag = (a, b) => {
	const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
	return (x + 0.05) / (y + 0.05)
}
function apca(txt, bg) {
	const Y = (h) => {
		const c = [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255) ** 2.4)
		let y = 0.2126729 * c[0] + 0.7151522 * c[1] + 0.072175 * c[2]
		return y < 0.022 ? y + (0.022 - y) ** 1.414 : y
	}
	const t = Y(txt),
		b = Y(bg)
	let s
	if (b > t) {
		s = (b ** 0.56 - t ** 0.57) * 1.14
		return s < 0.1 ? 0 : (s - 0.027) * 100
	}
	s = (b ** 0.65 - t ** 0.62) * 1.14
	return s > -0.1 ? 0 : (s + 0.027) * 100
}

const out = {}
for (const mode of ["light", "dark"]) {
	out[mode] = {}
	for (const [k, v] of Object.entries(P[mode])) {
		const c = clamp(v)
		out[mode][k] = hex(v)
		if (Math.abs(c[1] - v[1]) > 0.002) console.log(`clamped ${mode}.${k} C ${v[1]} → ${c[1].toFixed(3)}`)
	}
}

// [fg, bg, min WCAG, kind]
const pairs = [
	["text", "bg", 7],
	["text", "layer1", 7],
	["textMuted", "bg", 4.5],
	["textMuted", "surface", 4.5],
	["textMuted", "layer1", 4.5],
	["textMuted", "layer4", 4.5],
	["textFaint", "bg", 3],
	["textFaint", "layer1", 3],
	["accentText", "accent", 7],
	["signal", "bg", 4.5],
	["signal", "signalSubtle", 4.5],
	["danger", "bg", 4.5],
	["danger", "dangerSubtle", 4.5],
	["success", "bg", 4.5],
	["success", "successSubtle", 4.5],
	["warning", "bg", 4.5],
	["warning", "warningSubtle", 4.5],
	["borderStrong", "bg", 1.5],
	["borderControl", "bg", 3],
	["borderControl", "surface", 3],
	["borderControl", "layer1", 3],
	["text", "successHl", 7],
	["text", "dangerHl", 7],
]
let fail = 0
for (const mode of ["light", "dark"]) {
	console.log(`\n== ${mode}`)
	for (const [f, b, min] of pairs) {
		const r = wcag(out[mode][f], out[mode][b]),
			lc = apca(out[mode][f], out[mode][b])
		const ok = r >= min
		if (!ok) fail++
		console.log(
			`${ok ? "ok  " : "FAIL"} ${f.padEnd(12)} on ${b.padEnd(13)} ${r.toFixed(2).padStart(5)}:1  Lc ${lc.toFixed(0).padStart(4)}  (min ${min})`,
		)
	}
	// white text on the danger button (light) / dark text on danger (dark)
	const onDanger = mode === "light" ? "#FFFFFF" : out.dark.bg
	console.log(`     button text on danger ${wcag(onDanger, out[mode].danger).toFixed(2)}:1`)
}
console.log("\nfailures:", fail)
console.log(JSON.stringify(out, null, 1))
