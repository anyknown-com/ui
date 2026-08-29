// 織體動態引擎(TEXTURE-GUIDE §3–4):lib/weave.ts 的動態孿生。
// weave.ts 給固定尺寸小控件在 module scope 預織;這裡給尺寸不定、要回應觸點的面
// (button 全套:帶動 + 窩 + 掃光;卡面「僅展示」子集:hover 帶動 + 光澤帶)。
// 幾何公式與 weave.ts 完全同源(mulberry32(10075)、共享波場、四層紗)。
// client-only:在 ref callback 裡 new、cleanup 裡 destroy()(useEffect 禁用,
// 見 Button.tsx 的用法)。

import { WEAVE_SEED } from "./weave"

const NS = "http://www.w3.org/2000/svg"
let uid = 0

export interface SilkPalette {
	un: string
	sh: string
	y0: string
	y1: string
	y2: string
	y3: string
	y4: string
	hi: string
}

export interface SilkOptions {
	palette: SilkPalette
	/** "press" = 全套(帶動+窩+掃光);"hover" = 僅展示面(帶動+光澤帶) */
	mode: "press" | "hover"
	/** 疏織(ghost):無底紗無縫隙紗,面紗行距 2.1、粗 0.6–1.0 */
	ghost?: boolean
	/** 光澤帶亮度上限(primary/danger 0.75,secondary/ghost 與卡面 0.5) */
	bandMax?: number
	/** 面紗行距(大面積依 guide 降密度) */
	pitch?: number
	hiCount?: number
	hiSpan?: number
	/** 圓角 clip(px);省略 = 不 clip(交給 host 的 overflow) */
	radius?: number
	/** 織一塊固定高度的長布(host 高度變化不重織,只有寬度變了才重織);
	 * 動態每幀只更新可視高度內的紗 */
	fixedHeight?: number
}

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

function el<K extends keyof SVGElementTagNameMap>(
	name: K,
	attrs: Record<string, string | number>,
	parent: Element | null,
): SVGElementTagNameMap[K] {
	const node = document.createElementNS(NS, name)
	for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v))
	parent?.append(node)
	return node
}

interface Yarn {
	y: number
	node: SVGPathElement
	base: number[]
	disp: number
	vel: number
}

const STEP = 4

export class SilkBody {
	private host: HTMLElement
	private svg: SVGSVGElement
	private opts: Required<Pick<SilkOptions, "mode" | "bandMax" | "pitch" | "hiCount" | "hiSpan">> & SilkOptions
	private reduced: boolean
	private id: string
	private w = 0
	private h = 0
	private built = false
	private live: Yarn[] = []
	private sheen: { src: Yarn; node: SVGPathElement }[] = []
	private bandG!: SVGGElement
	private sheenG!: SVGGElement
	private pointer: { x: number; y: number; vx: number; vy: number; speed: number } | null = null
	private pressed = false
	private gx = 0
	private gy = 0
	private tension = 0
	private tenV = 0
	private pressX = 0
	private pressY = 0
	private bx = 0
	private bandOp = 0
	private sweep: { from: number; dir: number; t0: number } | null = null
	private raf = 0
	private ro: ResizeObserver
	private rebuild = 0
	private removers: (() => void)[] = []

	constructor(host: HTMLElement, svg: SVGSVGElement, options: SilkOptions) {
		this.host = host
		this.svg = svg
		this.opts = {
			bandMax: 0.75,
			pitch: options.ghost ? 2.1 : 1.2,
			hiCount: options.ghost ? 2 : 5,
			hiSpan: 0.6,
			...options,
		}
		this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
		this.id = `silk${uid++}`
		this.build()
		this.ro = new ResizeObserver(() => {
			clearTimeout(this.rebuild)
			this.rebuild = window.setTimeout(() => this.build(), this.opts.fixedHeight ? 120 : 0)
		})
		this.ro.observe(host)

		const on = <K extends keyof HTMLElementEventMap>(
			target: HTMLElement | Window,
			type: K | string,
			fn: (e: never) => void,
		) => {
			target.addEventListener(type, fn as EventListener)
			this.removers.push(() => target.removeEventListener(type, fn as EventListener))
		}
		on(host, "pointerenter", (e: PointerEvent) => this.track(e, true))
		on(host, "pointermove", (e: PointerEvent) => this.track(e))
		on(host, "pointerleave", () => {
			this.pointer = null
			this.wake()
		})
		if (this.opts.mode === "press") {
			on(host, "pointerdown", (e: PointerEvent) => {
				if (this.disabled()) return
				this.pressed = true
				this.track(e)
				this.pressX = this.gx
				this.pressY = this.gy
				this.wake()
			})
			on(window, "pointerup", () => this.release())
			on(host, "keydown", (e: KeyboardEvent) => {
				if ((e.key === " " || e.key === "Enter") && !this.disabled()) {
					this.pointer = { x: this.w / 2, y: this.h / 2, vx: 0, vy: 0, speed: 0 }
					this.gx = this.bx = this.pressX = this.w / 2
					this.gy = this.pressY = this.h / 2
					this.pressed = true
					this.wake()
				}
			})
			on(host, "keyup", () => {
				this.release()
				this.pointer = null
			})
			on(host, "blur", () => {
				this.pointer = null
				this.wake()
			})
		}
	}

	destroy() {
		this.ro.disconnect()
		clearTimeout(this.rebuild)
		for (const remove of this.removers) remove()
		if (this.raf) cancelAnimationFrame(this.raf)
		this.raf = 0
	}

	private disabled() {
		return this.host.matches(":disabled, [aria-disabled=true]")
	}

	private build() {
		const w = this.host.clientWidth
		const h = this.opts.fixedHeight ?? this.host.clientHeight
		if (w === 0 || (this.built && w === this.w && h === this.h)) return
		this.w = w
		this.h = h
		this.built = true
		const rng = mulberry32(WEAVE_SEED)
		const rand = (a: number, b: number) => a + rng() * (b - a)
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
		const staticD = (y0: number) => {
			let d = ""
			for (let x = -4; x <= w + 4; x += STEP) d += `${d ? "L" : "M"}${x},${(y0 + field(x, y0)).toFixed(2)}`
			return d
		}

		const p = this.opts.palette
		this.svg.setAttribute("viewBox", `0 0 ${w} ${h}`)
		if (this.opts.fixedHeight) {
			this.svg.setAttribute("width", String(w))
			this.svg.setAttribute("height", String(h))
		}
		this.svg.replaceChildren()
		const defs = el("defs", {}, this.svg)
		let clip: Record<string, string> = {}
		if (this.opts.radius != null) {
			el("clipPath", { id: `${this.id}-clip` }, defs).append(
				el("rect", { x: 0, y: 0, width: w, height: this.host.clientHeight, rx: this.opts.radius }, null),
			)
			clip = { "clip-path": `url(#${this.id}-clip)` }
		}
		const grad = el("linearGradient", { id: `${this.id}-band` }, defs)
		el("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": "0" }, grad)
		el("stop", { offset: ".5", "stop-color": "#fff", "stop-opacity": ".85" }, grad)
		el("stop", { offset: "1", "stop-color": "#fff", "stop-opacity": "0" }, grad)
		const mask = el("mask", { id: `${this.id}-bandm` }, defs)
		this.bandG = el("g", {}, mask)
		el(
			"rect",
			{
				x: -w * 0.3,
				y: -h,
				width: w * 0.6,
				height: h * 3,
				fill: `url(#${this.id}-band)`,
				transform: "rotate(-14)",
			},
			this.bandG,
		)

		const body = el("g", { ...clip, fill: "none", "stroke-linecap": "round" }, this.svg)
		if (!this.opts.ghost) {
			const under = el("g", { stroke: p.un }, body)
			for (let y = -0.8; y < h + 2.6; y += 1.5) el("path", { d: staticD(y), "stroke-width": "3.4" }, under)
			const seams = el("g", { stroke: p.sh, opacity: ".5" }, body)
			for (let y = 1.6; y < h + 1; y += 2.4)
				el("path", { d: staticD(y), "stroke-width": rand(0.5, 0.8).toFixed(2) }, seams)
		}
		this.live = []
		const addLive = (y0: number, node: SVGPathElement) => {
			const base: number[] = []
			for (let x = -4; x <= w + 4; x += STEP) base.push(field(x, y0))
			this.live.push({ y: y0, node, base, disp: 0, vel: 0 })
		}
		const buckets = [p.y0, p.y1, p.y2, p.y3, p.y4]
		for (let y = 0.6; y < h + 1; y += this.opts.pitch + rand(-0.15, 0.15)) {
			const bucket = Math.min(4, Math.max(0, Math.round(4.2 - (y / h) * 3 + rand(-0.9, 0.9))))
			addLive(
				y,
				el(
					"path",
					{
						d: staticD(y),
						"stroke-width": rand(0.6, this.opts.ghost ? 1.0 : 1.4).toFixed(2),
						stroke: buckets[bucket],
					},
					body,
				),
			)
		}
		const hiG = el("g", { stroke: p.hi, opacity: ".45" }, body)
		for (let i = 0; i < this.opts.hiCount; i++) {
			const y = rand(2, h * this.opts.hiSpan)
			addLive(y, el("path", { d: staticD(y), "stroke-width": rand(0.4, 0.7).toFixed(2) }, hiG))
		}
		this.sheenG = el(
			"g",
			{
				...clip,
				fill: "none",
				"stroke-linecap": "round",
				stroke: p.hi,
				mask: `url(#${this.id}-bandm)`,
				opacity: 0,
			},
			this.svg,
		)
		this.sheen = []
		for (let i = 0; i < this.live.length; i += 2) {
			const src = this.live[i]
			const node = el(
				"path",
				{ d: staticD(src.y), "stroke-width": "0.9", "stroke-opacity": ".6" },
				this.sheenG,
			)
			this.sheen.push({ src, node })
		}
	}

	// 一條紗當下的 d:靜態 base × 局部繃緊 + 凹陷(窩)+ 帶動位移(§4.1)
	private liveD(yarn: Yarn) {
		const sT = 2 * (this.w * 0.35) ** 2
		const sD = 2 * (this.w * 0.22) ** 2
		const sX = 2 * (this.w * 0.2) ** 2
		const ten = Math.max(-0.4, this.tension)
		const dy = this.pressY - yarn.y
		const funnel = ten * dy * 0.5 * Math.exp(-(dy ** 2) / 338)
		let d = ""
		for (let i = 0, x = -4; x <= this.w + 4; x += STEP, i++) {
			const ampl = 1 - 0.5 * ten * Math.exp(-((x - this.pressX) ** 2) / sT)
			const y =
				yarn.y +
				yarn.base[i] * ampl +
				funnel * Math.exp(-((x - this.pressX) ** 2) / sD) +
				yarn.disp * Math.exp(-((x - this.gx) ** 2) / sX)
			d += `${d ? "L" : "M"}${x},${y.toFixed(2)}`
		}
		return d
	}

	private track(e: PointerEvent, enter?: boolean) {
		const r = this.host.getBoundingClientRect()
		const x = e.clientX - r.left
		const y = e.clientY - r.top
		const p = this.pointer
		const vx = p ? x - p.x : 0
		const vy = p ? y - p.y : 0
		const speed = Math.hypot(vx, vy)
		this.pointer = { x, y, vx, vy, speed: p ? p.speed * 0.6 + speed * 0.4 : 0 }
		if (enter) {
			this.bx = x
			this.gx = x
			this.gy = y
		}
		this.wake()
	}

	private release() {
		if (!this.pressed) return
		this.pressed = false
		// 指標已拖出 → 不觸發 click,視覺安靜鬆開;過衝+掃光是「確認觸發」的專屬語言
		if (this.pointer == null) {
			this.wake()
			return
		}
		this.tenV -= 0.035
		if (!this.reduced)
			this.sweep = { from: this.pressX, dir: (this.pointer.vx ?? 1) >= 0 ? 1 : -1, t0: performance.now() }
		this.wake()
	}

	private tick(now: number) {
		const p = this.pointer
		if (p != null) {
			this.gx += (p.x - this.gx) * 0.25
			this.gy += (p.y - this.gy) * 0.25
			p.speed *= 0.92
		}
		let pressDrift = false
		if (this.pressed && p != null) {
			const dx = this.gx - this.pressX
			const dyP = this.gy - this.pressY
			this.pressX += dx * 0.18
			this.pressY += dyP * 0.18
			pressDrift = Math.abs(dx) + Math.abs(dyP) > 0.05
		}
		let moving = false
		const vh = (this.opts.fixedHeight ? this.host.clientHeight : this.h) + 10
		const vy = p != null && !this.pressed ? Math.max(-1.8, Math.min(1.8, (p.vy ?? 0) * 0.28)) : 0
		for (const yarn of this.live) {
			if (yarn.y > vh) continue
			const target = p != null ? vy * Math.exp(-((yarn.y - this.gy) ** 2) / 200) : 0
			yarn.vel += (target - yarn.disp) * 0.13 - yarn.vel * 0.24
			yarn.disp += yarn.vel
			if (Math.abs(yarn.disp) > 1e-3 || Math.abs(yarn.vel) > 1e-3) moving = true
		}
		if (p != null) p.vy = 0
		this.tenV += ((this.pressed && p != null ? 1 : 0) - this.tension) * 0.07 - this.tenV * 0.16
		this.tension += this.tenV
		const tensionActive = Math.abs(this.tension) > 1e-3 || Math.abs(this.tenV) > 1e-3 || pressDrift
		if (moving || tensionActive) {
			for (const yarn of this.live) if (yarn.y <= vh) yarn.node.setAttribute("d", this.liveD(yarn))
			for (const s of this.sheen) if (s.src.y <= vh) s.node.setAttribute("d", this.liveD(s.src))
		}
		let bandT = 0
		if (this.sweep != null) {
			const t = (now - this.sweep.t0) / 640
			if (t >= 1) this.sweep = null
			else {
				const ease = 1 - (1 - t) ** 3
				this.bx = this.sweep.from + this.sweep.dir * ease * this.w * 0.9
				bandT = 0.9 * (1 - t)
			}
		}
		if (this.sweep == null && p != null && !this.disabled()) {
			this.bx += (p.x - this.bx) * 0.16
			bandT = this.pressed ? 0.15 : Math.min(this.opts.bandMax, 0.3 + p.speed / 7)
		}
		this.bandOp += (bandT - this.bandOp) * 0.15
		this.bandG.setAttribute("transform", `translate(${this.bx.toFixed(1)},0)`)
		this.sheenG.setAttribute("opacity", this.bandOp.toFixed(3))
		const active =
			p != null || this.pressed || this.sweep != null || moving || tensionActive || this.bandOp > 0.005
		this.raf = active ? requestAnimationFrame((n) => this.tick(n)) : 0
	}

	private wake() {
		if (!this.raf && !this.reduced && this.built) this.raf = requestAnimationFrame((n) => this.tick(n))
	}
}
