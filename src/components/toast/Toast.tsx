import * as stylex from "@stylexjs/stylex"
import { createContext, useCallback, useContext, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { usePrefersReducedMotion } from "../../lib/motion"
import { layerStyles } from "../../lib/popup"
import { createStore, useStore } from "../../lib/store"
import { press, reset } from "../../lib/styled"
import { color, corner, focusRing, font, motion, shadow, space, type as scale } from "../../tokens.stylex"
import { XGlyph } from "../icon/glyphs"
import { Spin } from "../spin/Spin"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const DEFAULT_TIMEOUT = 5000
const DEFAULT_LIMIT = 3
/** 退場的毫秒數:這段時間裡那則還在畫面上淡出,但已經不在無障礙樹上、也不算進 limit。 */
const EXIT_MS = 120
/** 把焦點跳到通知區的快捷鍵(跟 Radix 同一顆;F6 是瀏覽器自己在區塊間跳的鍵)。 */
const HOTKEY = "F8"

const slideIn = stylex.keyframes({
	from: { opacity: 0, translate: "1rem 0" },
	to: { opacity: 1, translate: "0 0" },
})

const fadeOut = stylex.keyframes({
	from: { opacity: 1 },
	to: { opacity: 0 },
})

const drain = stylex.keyframes({
	from: { translate: "0 0" },
	to: { translate: "-100% 0" },
})

const styles = stylex.create({
	viewport: {
		position: "fixed",
		display: "flex",
		gap: space.xs,
		width: "min(20rem, calc(100vw - 2.5rem))",
		borderRadius: corner.float,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	fromBottom: { flexDirection: "column-reverse" },
	fromTop: { flexDirection: "column" },
	bottomRight: { bottom: space.md, insetInlineEnd: space.md },
	bottomLeft: { bottom: space.md, insetInlineStart: space.md },
	topRight: { top: space.md, insetInlineEnd: space.md },
	topLeft: { top: space.md, insetInlineStart: space.md },
	// float 階的白紙。透明的框只為了 forced-colors(那裡陰影會消失)
	toast: {
		position: "relative",
		overflow: "hidden",
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		backgroundColor: color.surfaceRaised,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "transparent",
		borderRadius: corner.float,
		boxShadow: shadow.float,
		paddingBlock: space.sm,
		paddingInlineStart: space.md,
		paddingInlineEnd: space.sm,
		fontFamily: font.body,
		fontSize: scale.t2,
		lineHeight: scale.snug,
		color: color.text,
		animationName: { default: slideIn, [REDUCED]: "none" },
		animationDuration: motion.quick,
		animationTimingFunction: motion.easeOut,
	},
	// 關掉之後淡出 120ms 才拿掉;reduced motion 時 Toaster 把退場設成 0,直接拿掉
	leaving: {
		animationName: { default: fadeOut, [REDUCED]: "none" },
		animationDuration: motion.fast,
		animationTimingFunction: motion.easeOut,
		animationFillMode: "forwards",
		pointerEvents: "none",
	},
	// 有說明的那則:點與按鈕對齊第一行
	twoLine: { alignItems: "flex-start" },
	// 倒數是內距裡、貼著底邊的一條細膠囊:凹下去的軌,填充往起點退
	countdown: {
		position: "absolute",
		insetInlineStart: space.md,
		insetInlineEnd: space.sm,
		bottom: space.xxs,
		height: 3,
		borderRadius: corner.pill,
		backgroundColor: color.accentSubtle,
		overflow: "hidden",
	},
	countLine: {
		display: "block",
		height: "100%",
		borderRadius: corner.pill,
		animationName: drain,
		animationTimingFunction: "linear",
		animationFillMode: "forwards",
	},
	lineDefault: { backgroundColor: color.textFaint },
	lineSuccess: { backgroundColor: color.success },
	lineDanger: { backgroundColor: color.danger },
	running: (ms: number, paused: boolean) => ({
		animationDuration: `${ms}ms`,
		animationPlayState: paused ? "paused" : "running",
	}),
	// 20px 的槽:點、轉圈都放在裡面置中,換狀態時標題不會跳
	mark: {
		flex: "none",
		display: "grid",
		placeItems: "center",
		width: "1.25rem",
		height: "1.25rem",
	},
	dot: { width: "0.5rem", height: "0.5rem", borderRadius: corner.pill },
	dotDefault: { backgroundColor: color.text },
	dotSuccess: { backgroundColor: color.success },
	dotDanger: { backgroundColor: color.danger },
	spin: { color: color.signal, width: space.md, height: space.md },
	content: { flex: 1, minWidth: 0, display: "grid", gap: "0.125rem" },
	title: { margin: 0, fontSize: scale.t2, color: color.text },
	titleStrong: { fontWeight: 500 },
	count: {
		flex: "none",
		display: "inline-grid",
		placeItems: "center",
		boxSizing: "border-box",
		minWidth: space.lg,
		height: "1.375rem",
		paddingInline: "0.375rem",
		borderRadius: corner.pill,
		backgroundColor: color.accentSubtle,
		color: color.text,
		fontSize: scale.t1,
		fontWeight: 600,
		lineHeight: 1,
		fontVariantNumeric: "tabular-nums",
	},
	description: { margin: 0, fontSize: scale.t2, color: color.textMuted },
	action: {
		flex: "none",
		height: "1.75rem",
		fontFamily: font.body,
		fontSize: scale.t2,
		fontWeight: 600,
		lineHeight: 1,
		color: color.text,
		cursor: "pointer",
		paddingInline: space.sm,
		borderRadius: corner.pill,
		backgroundColor: { default: color.accentSubtle, ":hover": color.layer5 },
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	close: {
		flex: "none",
		display: "inline-grid",
		placeItems: "center",
		width: space.lg,
		height: space.lg,
		borderRadius: corner.pill,
		color: { default: color.textFaint, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	// 對齊第一行(20px 行高)的中線
	closeTwoLine: { marginBlock: "-0.125rem" },
	closeGlyph: { width: 14, height: 14 },
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
})

const TONE = {
	success: { dot: styles.dotSuccess, line: styles.lineSuccess },
	danger: { dot: styles.dotDanger, line: styles.lineDanger },
	default: { dot: styles.dotDefault, line: styles.lineDefault },
} as const

// success / danger 是唸給螢幕閱讀器的前綴:顏色看不到,類型要用說的
const strings = defineStrings({
	"zh-TW": { region: "通知", dismiss: "關閉通知", success: "成功:", danger: "錯誤:" },
	en: { region: "Notifications", dismiss: "Dismiss notification", success: "Success:", danger: "Error:" },
})

/** The Toaster's built-in words (follow `<LocaleProvider>`); override any with `<Toaster labels={…}>`. */
export type ToastLabels = StringsOf<typeof strings>

export type ToastType = keyof typeof TONE

export type ToastAction = { label: string; onClick: () => void }

export type ToastOptions = {
	description?: string
	action?: ToastAction
	/**
	 * 毫秒;0 = 不自動消失。沒給就用 Toaster 的 `timeout` —— 但有 `action` 或 `danger` 的那則
	 * 不自動消失(WCAG 2.2.1:鍵盤使用者要 Tab 很久才到得了),要倒數就明確給一個值。
	 */
	timeout?: number
	/** 同一個 key 正在顯示時,不疊新的一則:原地更新那則、重新倒數、計數 +1(顯示 ×N)。 */
	key?: string
}

export type ToastInput = ToastOptions & { title: string; type?: ToastType }

export type ToastUpdate = {
	title?: string
	description?: string
	type?: ToastType
	action?: ToastAction
	timeout?: number
}

export type ToastPromiseMessages<T> = {
	loading: string
	success: string | ((value: T) => string)
	error: string | ((error: unknown) => string)
}

export type ToastRecord = {
	id: string
	key?: string
	title: string
	description?: string
	type: ToastType
	action?: ToastAction
	timeout?: number
	/** promise 還沒落定;不倒數。 */
	loading: boolean
	/** 同 key 被加了幾次。 */
	count: number
	/** 這一輪倒數的毫秒數,0 = 不倒數。 */
	duration: number
	/** 每重新倒數一次 +1,倒數線靠它重播。 */
	epoch: number
	/** 已經關了、正在淡出;不唸、不能按、不算進 limit,也不再被同 key 更新。 */
	leaving: boolean
}

export type ToastState = { toasts: readonly ToastRecord[]; paused: boolean }

type PauseReason = "hover" | "focus" | "hidden"

export type ToastManager = {
	add: (input: ToastInput) => string
	update: (id: string, patch: ToastUpdate) => void
	close: (id: string) => void
	/** loading 那則不倒數;落定後換成 success / danger 並開始倒數。回傳原本的 promise。 */
	promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>) => Promise<T>
	subscribe: (listener: () => void) => () => void
	getSnapshot: () => ToastState
	/** @internal Toaster 用:預設 timeout、limit 與退場毫秒數(reduced motion 時 0)。 */
	configure: (config: { timeout: number; limit: number; exit?: number }) => void
	/** @internal Toaster 用:hover / focus / 分頁隱藏時停住所有倒數。 */
	pause: (reason: PauseReason) => void
	/** @internal */
	resume: (reason: PauseReason) => void
}

const pick = <V,>(message: string | ((value: V) => string), value: V) =>
	typeof message === "function" ? message(value) : message

type Timer = { handle?: ReturnType<typeof setTimeout>; remaining: number; startedAt: number }

let seq = 0

export function createToastManager(): ToastManager {
	const store = createStore<ToastState>({ toasts: [], paused: false })
	const config = { timeout: DEFAULT_TIMEOUT, limit: DEFAULT_LIMIT, exit: EXIT_MS }
	const timers = new Map<string, Timer>()
	const reasons = new Set<PauseReason>()

	const commit = (toasts: readonly ToastRecord[]) => store.set({ toasts, paused: reasons.size > 0 })

	function run(id: string, timer: Timer) {
		timer.startedAt = Date.now()
		timer.handle = setTimeout(() => close(id), timer.remaining)
	}

	function stop(id: string) {
		clearTimeout(timers.get(id)?.handle)
		timers.delete(id)
	}

	/** 重新倒數:回傳帶新 duration / epoch 的那則。 */
	function arm(record: ToastRecord): ToastRecord {
		stop(record.id)
		// 有按鈕要按、或是錯誤:等使用者自己關,除非呼叫端明確給了 timeout
		const persistent = record.action != null || record.type === "danger"
		const duration = record.loading ? 0 : (record.timeout ?? (persistent ? 0 : config.timeout))
		if (duration > 0) {
			const timer: Timer = { remaining: duration, startedAt: 0 }
			timers.set(record.id, timer)
			if (reasons.size === 0) run(record.id, timer)
		}
		return { ...record, duration, epoch: record.epoch + 1 }
	}

	function keep(toasts: readonly ToastRecord[]) {
		const dropped = new Set(toasts.filter((t) => !t.leaving).slice(config.limit))
		for (const record of dropped) stop(record.id)
		commit(toasts.filter((t) => !dropped.has(t)))
	}

	function insert(input: ToastInput, loading: boolean): string {
		const { toasts } = store.getSnapshot()
		const fields = {
			title: input.title,
			description: input.description,
			type: input.type ?? "default",
			action: input.action,
			timeout: input.timeout,
			loading,
		}
		const same = input.key == null ? undefined : toasts.find((t) => t.key === input.key && !t.leaving)
		if (same != null) {
			const next = arm({ ...same, ...fields, count: same.count + 1 })
			commit(toasts.map((t) => (t === same ? next : t)))
			return same.id
		}
		seq += 1
		const record = arm({
			id: `toast-${seq}`,
			key: input.key,
			...fields,
			count: 1,
			duration: 0,
			epoch: 0,
			leaving: false,
		})
		// 新的在前;超過 limit 丟最舊的
		keep([record, ...toasts])
		return record.id
	}

	function patch(id: string, changes: ToastUpdate & { loading?: boolean }) {
		const { toasts } = store.getSnapshot()
		const current = toasts.find((t) => t.id === id)
		if (current == null || current.leaving) return
		const next = arm({ ...current, ...changes })
		commit(toasts.map((t) => (t === current ? next : t)))
	}

	const remove = (id: string) => commit(store.getSnapshot().toasts.filter((t) => t.id !== id))

	function close(id: string) {
		const { toasts } = store.getSnapshot()
		const current = toasts.find((t) => t.id === id)
		if (current == null || current.leaving) return
		stop(id)
		// 清空時 viewport 縮成 0,mouseleave / blur 可能不會來;別讓下一則卡在暫停
		if (!toasts.some((t) => t.id !== id && !t.leaving)) {
			reasons.delete("hover")
			reasons.delete("focus")
		}
		if (config.exit <= 0) return remove(id)
		// 先標成 leaving 讓它淡出,時間到才真的拿掉
		commit(toasts.map((t) => (t === current ? { ...t, leaving: true } : t)))
		setTimeout(() => remove(id), config.exit)
	}

	return {
		add: (input) => insert(input, false),
		update: (id, changes) => patch(id, changes),
		close,
		promise(promise, messages) {
			const id = insert({ title: messages.loading }, true)
			promise.then(
				(value) => patch(id, { title: pick(messages.success, value), type: "success", loading: false }),
				(error: unknown) => patch(id, { title: pick(messages.error, error), type: "danger", loading: false }),
			)
			return promise
		},
		subscribe: store.subscribe,
		getSnapshot: store.getSnapshot,
		configure({ timeout, limit, exit = EXIT_MS }) {
			config.timeout = timeout
			config.limit = limit
			config.exit = exit
			const { toasts } = store.getSnapshot()
			if (toasts.filter((t) => !t.leaving).length > limit) keep(toasts)
		},
		pause(reason) {
			if (reasons.has(reason)) return
			reasons.add(reason)
			if (reasons.size > 1) return
			const now = Date.now()
			for (const timer of timers.values()) {
				clearTimeout(timer.handle)
				timer.remaining -= now - timer.startedAt
			}
			commit(store.getSnapshot().toasts)
		},
		resume(reason) {
			if (!reasons.delete(reason) || reasons.size > 0) return
			for (const [id, timer] of timers) run(id, timer)
			commit(store.getSnapshot().toasts)
		},
	}
}

function makeApi(getManager: () => ToastManager) {
	const add =
		(type: ToastType) =>
		(title: string, options: ToastOptions = {}) =>
			getManager().add({ ...options, title, type })

	return Object.assign(add("default"), {
		success: add("success"),
		danger: add("danger"),
		update: (id: string, patch: ToastUpdate) => getManager().update(id, patch),
		close: (id: string) => getManager().close(id),
		promise: <T,>(promise: Promise<T>, messages: ToastPromiseMessages<T>) =>
			getManager().promise(promise, messages),
	})
}

/** 只有一個 <Toaster/> 的 app 用這個:直接 import `toast` 就能用,不必穿 context。 */
export const toastManager = createToastManager()

const ToastApiContext = createContext<ReturnType<typeof makeApi> | null>(null)

export const toast = makeApi(() => toastManager)

export function useToast() {
	const scoped = useContext(ToastApiContext)
	return { toast: scoped ?? toast }
}

const POSITIONS = {
	"bottom-right": styles.bottomRight,
	"bottom-left": styles.bottomLeft,
	"top-right": styles.topRight,
	"top-left": styles.topLeft,
} as const

export type ToasterProps = {
	position?: keyof typeof POSITIONS
	timeout?: number
	limit?: number
	/** Pass a manager from `createToastManager()` to scope this viewport. */
	manager?: ToastManager
	/** Override built-in words for this viewport; the rest follow `<LocaleProvider>`. */
	labels?: Partial<ToastLabels>
}

const noSubscribe = () => () => {}

export function Toaster({
	position = "bottom-right",
	timeout = DEFAULT_TIMEOUT,
	limit = DEFAULT_LIMIT,
	manager,
	labels,
}: ToasterProps) {
	const t = useStrings(strings, labels)
	const [own] = useState(() => manager ?? toastManager)
	const reduced = usePrefersReducedMotion()
	const [api] = useState(() => makeApi(() => own))
	const { toasts, paused } = useStore(own)
	// portal 只在 client 掛;server 上沒有 document.body
	const client = useSyncExternalStore(
		noSubscribe,
		() => true,
		() => false,
	)
	const fromBottom = position.startsWith("bottom")
	const region = useRef<HTMLDivElement | null>(null)
	// 按 F8 之前焦點在哪;Esc 或最後一則關掉時還回去
	const returnTo = useRef<HTMLElement | null>(null)

	const connect = useCallback(
		(node: HTMLDivElement) => {
			region.current = node
			own.configure({ timeout, limit, exit: reduced ? 0 : EXIT_MS })
			const doc = node.ownerDocument
			const hotkey = (event: KeyboardEvent) => {
				if (event.key !== HOTKEY || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
				if (!own.getSnapshot().toasts.some((t) => !t.leaving)) return
				event.preventDefault()
				if (!node.contains(doc.activeElement)) returnTo.current = doc.activeElement as HTMLElement | null
				node.focus()
			}
			const escape = (event: KeyboardEvent) => {
				if (event.key !== "Escape" || returnTo.current == null) return
				returnTo.current.focus()
				returnTo.current = null
			}
			const sync = () => (doc.hidden ? own.pause("hidden") : own.resume("hidden"))
			const enter = () => own.pause("hover")
			const leave = () => own.resume("hover")
			const focusIn = () => own.pause("focus")
			const focusOut = (event: FocusEvent) => {
				if (!node.contains(event.relatedTarget as Node | null)) own.resume("focus")
			}
			sync()
			doc.addEventListener("visibilitychange", sync)
			doc.addEventListener("keydown", hotkey)
			node.addEventListener("keydown", escape)
			node.addEventListener("mouseenter", enter)
			node.addEventListener("mouseleave", leave)
			node.addEventListener("focusin", focusIn)
			node.addEventListener("focusout", focusOut)
			return () => {
				doc.removeEventListener("visibilitychange", sync)
				doc.removeEventListener("keydown", hotkey)
				node.removeEventListener("keydown", escape)
				region.current = null
				node.removeEventListener("mouseenter", enter)
				node.removeEventListener("mouseleave", leave)
				node.removeEventListener("focusin", focusIn)
				node.removeEventListener("focusout", focusOut)
				own.resume("hidden")
				own.resume("hover")
				own.resume("focus")
			}
		},
		[own, timeout, limit, reduced],
	)

	// 關掉焦點所在的那則時,焦點不能掉回 body:還有別則就留在通知區,沒了就還給按 F8 前的地方
	const dismiss = (id: string) => {
		const node = region.current
		const inside = node?.contains(node.ownerDocument.activeElement) ?? false
		const last = own.getSnapshot().toasts.filter((t) => !t.leaving).length <= 1
		own.close(id)
		if (!inside) return
		if (!last) node?.focus()
		else if (returnTo.current != null) {
			returnTo.current.focus()
			returnTo.current = null
		}
	}

	if (!client) return null

	return (
		<ToastApiContext value={api}>
			{createPortal(
				<div
					ref={connect}
					role="region"
					aria-label={t.region}
					aria-keyshortcuts={HOTKEY}
					aria-live="polite"
					tabIndex={-1}
					{...stylex.props(
						layerStyles.toast,
						styles.viewport,
						fromBottom ? styles.fromBottom : styles.fromTop,
						POSITIONS[position],
					)}
				>
					{toasts.map((record) => (
						<ToastItem key={record.id} record={record} paused={paused} onClose={dismiss} t={t} />
					))}
				</div>,
				document.body,
			)}
		</ToastApiContext>
	)
}

type ToastItemProps = { record: ToastRecord; paused: boolean; onClose: (id: string) => void; t: ToastLabels }

function ToastItem({ record, paused, onClose, t }: ToastItemProps) {
	const reduced = usePrefersReducedMotion()
	const tone = TONE[record.type in TONE ? record.type : "default"]
	const word = record.type === "success" || record.type === "danger" ? t[record.type] : ""
	const action = record.action
	const twoLine = record.description != null

	return (
		<div
			role={record.type === "danger" ? "alert" : "status"}
			aria-atomic="true"
			aria-hidden={record.leaving || undefined}
			inert={record.leaving || undefined}
			data-type={record.type}
			{...stylex.props(styles.toast, twoLine && styles.twoLine, record.leaving && styles.leaving)}
		>
			{!reduced && record.duration > 0 && (
				<span key={record.epoch} aria-hidden="true" {...stylex.props(styles.countdown)}>
					<span
						data-countdown=""
						{...stylex.props(styles.countLine, tone.line, styles.running(record.duration, paused))}
					/>
				</span>
			)}
			<span aria-hidden="true" {...stylex.props(styles.mark)}>
				{record.loading ? <Spin sx={styles.spin} /> : <span {...stylex.props(styles.dot, tone.dot)} />}
			</span>
			<div {...stylex.props(styles.content)}>
				{word !== "" && <span {...stylex.props(styles.srOnly)}>{word}</span>}
				<p {...stylex.props(styles.title, twoLine && styles.titleStrong)}>{record.title}</p>
				{twoLine && <p {...stylex.props(styles.description)}>{record.description}</p>}
			</div>
			{record.count > 1 && (
				<span {...stylex.props(styles.count)}>
					<span {...stylex.props(styles.srOnly)}>×</span>
					{record.count}
				</span>
			)}
			{action != null && (
				<button
					type="button"
					onClick={() => {
						action.onClick()
						onClose(record.id)
					}}
					{...stylex.props(reset.control, styles.action, press.button)}
				>
					{action.label}
				</button>
			)}
			<button
				type="button"
				aria-label={t.dismiss}
				onClick={() => onClose(record.id)}
				{...stylex.props(reset.control, styles.close, twoLine && styles.closeTwoLine, press.button)}
			>
				<XGlyph {...stylex.props(styles.closeGlyph)} />
			</button>
		</div>
	)
}
