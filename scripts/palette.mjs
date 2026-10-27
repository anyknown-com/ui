// Color system: 12-step OKLCH primitives -> semantic tokens, one set each for light and dark.
//
// The primitives (the 12 steps of gray / blue / red / amber / green) live only in this script and are not exported;
// components only touch semantic tokens (color in tokens.stylex.ts).
//
// Each step has the same job in every scale and both themes:
//   1–2   backgrounds (paper, desktop)
//   3–5   fills (subtle base, hover, pressed)
//   6–8   borders (divider, stronger divider)
//   9–10  solids (button base, control border, icon)
//   11–12 text (secondary text, primary text)
// Gray has OKLCH chroma 0, with no tint at all. The primary action is ink (gray 12), and links are ink with an underline;
// blue only means "the agent is working", focus, and progress.
//
// To change colors: do not hand-tune the hex of a single token. Edit the scales below (GRAY / STEPS / HUES) or the ROLES mapping, then run
//   node scripts/palette.mjs
// Check the contrast table first (failures must be 0), then paste the JSON printed at the end back into src/tokens.stylex.ts (color)
// and src/tokens.css, then run pnpm gen:themes.

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

// ---------- Primitives ----------
// Gray: lightness only, chroma 0
const GRAY = {
	light: [1, 0.982, 0.962, 0.945, 0.925, 0.905, 0.868, 0.79, 0.6, 0.545, 0.475, 0.205],
	dark: [0.145, 0.18, 0.21, 0.238, 0.262, 0.29, 0.335, 0.41, 0.56, 0.62, 0.79, 0.955],
}
// Steps 1-8 of the colored scales: all hues share one lightness and chroma curve
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
// Each hue has its own 9 (solid), 11 (text), and 12 (high-contrast text); 10 is 9 pushed slightly further
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
// ---------- Semantic tokens: [scale, light step, dark step] ----------
const ROLES = {
	bg: ["gray", 1, 2], // the one sheet
	surfaceRaised: ["gray", 1, 4], // raised: popover, toast, dialog, field
	borderControl: ["gray", 9, 9], // control border: unchecked checkbox and radio only
	textMuted: ["gray", 11, 11], // secondary text
	text: ["gray", 12, 12], // primary text, ink button, link
	signal: ["blue", 9, 11], // the agent is working, progress
	focusRing: ["blue", 9, 11], // focus ring
	danger: ["red", 9, 11], // delete, failure (text and dot)
	warning: ["amber", 11, 11], // warning text
	success: ["green", 11, 11], // success text
}
const role = {}
for (const [k, [s, l, d]] of Object.entries(ROLES))
	role[k] = { light: scales[s].light[l - 1], dark: scales[s].dark[d - 1] }

// wash: ink at 6% / 11% / 26%, written as rgba in tokens.stylex.ts. Checks use it composited over bg.
const WASH_INK = { light: [23, 23, 23], dark: [240, 240, 240] }
const composite = (ink, a, bgHex) =>
	"#" +
	ink
		.map((c, i) => Math.round(c * a + parseInt(bgHex.slice(1 + 2 * i, 3 + 2 * i), 16) * (1 - a)))
		.map((v) => v.toString(16).padStart(2, "0"))
		.join("")
		.toUpperCase()
role.wash = Object.fromEntries(MODES.map((m) => [m, composite(WASH_INK[m], 0.06, role.bg[m])]))

// ---------- Checks ----------
// [foreground, background, minimum WCAG contrast, purpose]. text = text meant to be read (4.5:1); non-text = icon, border, focus ring (3:1)
const CHECKS = [
	["text", "bg", 7, "text"],
	["text", "surfaceRaised", 7, "text"],
	["textMuted", "bg", 4.5, "text"],
	["textMuted", "surfaceRaised", 4.5, "text"],
	["textMuted", "wash", 4.5, "text"],
	["borderControl", "bg", 3, "non-text"],
	["focusRing", "bg", 3, "non-text"],
	["signal", "bg", 4.5, "text"],
	["danger", "bg", 4.5, "text"],
	["warning", "bg", 4.5, "text"],
	["success", "bg", 4.5, "text"],
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
	// Gray must be fully neutral: R = G = B
	for (const [i, h] of scales.gray[m].entries()) {
		if (h.slice(1, 3) !== h.slice(3, 5) || h.slice(3, 5) !== h.slice(5, 7)) {
			failures++
			console.log(`FAIL gray ${i + 1} ${h} is not neutral`)
		}
	}
}
console.log("\nfailures:", failures)

const pairs = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [v.light, v.dark]]))
console.log(
	JSON.stringify(
		{
			color: pairs(Object.fromEntries(Object.entries(role).filter(([k]) => k !== "wash"))),
		},
		null,
		1,
	),
)
if (failures > 0) process.exitCode = 1
