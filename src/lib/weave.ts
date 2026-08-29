// 織體幾何(TEXTURE-GUIDE §3):固定種子 → 同尺寸恆定的布。
// 純函式、無 DOM,可在 module scope 預算(SSR 安全)。
// 參考實作:components/button/prototype.html(唯一真相)。

export const WEAVE_SEED = 10075

export type Rand = (a: number, b: number) => number

function mulberry32(seed: number) {
	let a = seed >>> 0
	return () => {
		a |= 0
		a = (a + 0x6d2b79f5) | 0
		let t = Math.imul(a ^ (a >>> 15), 1 | a)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

// 一個元件一支 rand:weave 與縫線依序消費同一序列,織法才與 prototype 完全一致
export function weaveRand(seed = WEAVE_SEED): Rand {
	const rng = mulberry32(seed)
	return (a, b) => a + rng() * (b - a)
}

export interface Strand {
	d: string
	sw: string
}

export interface FaceStrand extends Strand {
	bucket: 0 | 1 | 2 | 3 | 4
}

export interface WeaveLayers {
	under: Strand[]
	seams: Strand[]
	face: FaceStrand[]
	hi: Strand[]
}

export interface WeaveOptions {
	w: number // 布的 CSS px 尺寸(幾何以 CSS px 建,紗的粗細行距跨元件等粗)
	h: number
	s?: number // 輸出座標縮放(viewBox 單位 / CSS px),預設 1
	ox?: number // 輸出座標平移(CSS px,乘 s 前)
	oy?: number
	pitch?: number // 面紗行距;預設 1.2,大面積依 guide 降密度
	hiCount?: number // 挑面亮紗數;預設 4
	hiSpan?: number // 亮紗分佈範圍(h 的比例);預設 0.6(上半部)
}

export function buildWeave(opts: WeaveOptions, rand: Rand): WeaveLayers {
	const { w, h, s = 1, ox = 0, oy = 0, pitch = 1.2, hiCount = 4, hiSpan = 0.6 } = opts
	// 共享波場:兩支長波,相位隨 y 緩慢滑移(§3.2,參數順序照抄)
	const W1 = rand(Math.max(120, w * 0.9), w * 1.8)
	const A1 = rand(1.0, 1.8)
	const P1 = rand(0, 6.28)
	const K1 = rand(0.05, 0.11)
	const W2 = rand(w * 1.6, w * 3)
	const A2 = rand(0.5, 0.9)
	const P2 = rand(0, 6.28)
	const K2 = rand(0.03, 0.07)
	const field = (x: number, y: number) =>
		A1 * Math.sin((x / W1) * 6.283 + P1 + y * K1) + A2 * Math.sin((x / W2) * 6.283 + P2 + y * K2)
	// 取樣超出左右邊界 4px,由 clip 裁形(右緣不因 w 非 4 倍數缺一截)
	const staticD = (y0: number) => {
		let d = ""
		for (let x = -4; x <= w + 4; x += 4)
			d += `${d ? "L" : "M"}${((ox + x) * s).toFixed(2)},${((oy + y0 + field(x, y0)) * s).toFixed(2)}`
		return d
	}

	const under: Strand[] = []
	for (let y = -0.8; y < h + 2.6; y += 1.5) under.push({ d: staticD(y), sw: (3.4 * s).toFixed(2) })
	const seams: Strand[] = []
	for (let y = 1.6; y < h + 1; y += 2.4) seams.push({ d: staticD(y), sw: (rand(0.5, 0.8) * s).toFixed(2) })
	const face: FaceStrand[] = []
	for (let y = 0.6; y < h + 1; y += pitch + rand(-0.15, 0.15)) {
		const bucket = Math.min(
			4,
			Math.max(0, Math.round(4.2 - (y / h) * 3 + rand(-0.9, 0.9))),
		) as FaceStrand["bucket"]
		face.push({ d: staticD(y), sw: (rand(0.6, 1.4) * s).toFixed(2), bucket })
	}
	const hi: Strand[] = []
	for (let i = 0; i < hiCount; i++) {
		const y = rand(2, h * hiSpan)
		hi.push({ d: staticD(y), sw: (rand(0.4, 0.7) * s).toFixed(2) })
	}
	return { under, seams, face, hi }
}

// 縫線(checkbox 的勾/橫線):折線沿弧長疊一支長波的法向微彎 — 勾也是線,不是平面 icon
export function buildThread(pts: [number, number][], rand: Rand): string {
	const samples: { x: number; y: number; nx: number; ny: number; l: number }[] = []
	let L = 0
	for (let i = 0; i < pts.length - 1; i++) {
		const [x0, y0] = pts[i]
		const [x1, y1] = pts[i + 1]
		const len = Math.hypot(x1 - x0, y1 - y0)
		const nx = -(y1 - y0) / len
		const ny = (x1 - x0) / len
		const n = Math.ceil(len)
		for (let j = i === 0 ? 0 : 1; j <= n; j++) {
			const t = j / n
			samples.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, nx, ny, l: L + len * t })
		}
		L += len
	}
	const A = rand(0.25, 0.45)
	const WL = rand(L * 1.2, L * 2)
	const PH = rand(0, 6.28)
	let d = ""
	for (const p of samples) {
		const off = A * Math.sin((p.l / WL) * 6.283 + PH)
		d += `${d ? "L" : "M"}${(p.x + p.nx * off).toFixed(2)},${(p.y + p.ny * off).toFixed(2)}`
	}
	return d
}
