import { useMemo, useRef, useSyncExternalStore } from "react"

/**
 * 最小的外部 store:一個值、一組 listener。React 端一律經 `useStore`
 * (`useSyncExternalStore`)讀,不在 effect 裡同步。
 */
export type Store<T> = {
	getSnapshot: () => T
	/** 值沒變(`Object.is`)就不通知。 */
	set: (next: T | ((prev: T) => T)) => void
	subscribe: (listener: () => void) => () => void
}

export function createStore<T>(initial: T): Store<T> {
	let state = initial
	const listeners = new Set<() => void>()
	return {
		getSnapshot: () => state,
		set(next) {
			const value = typeof next === "function" ? (next as (prev: T) => T)(state) : next
			if (Object.is(value, state)) return
			state = value
			for (const listener of listeners) listener()
		},
		subscribe(listener) {
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
			}
		},
	}
}

type Readable<T> = Pick<Store<T>, "subscribe" | "getSnapshot">

/**
 * 訂閱任何有 `subscribe` / `getSnapshot` 的 store(含 toast / dialog manager)。
 *
 * 給 `selector` 就只訂閱其中一塊:store 變了但選出來的值 `isEqual`(預設 `Object.is`)
 * 判定沒變,元件就不重畫,而且拿回的是上一次的同一個參考。選出新物件或陣列時傳
 * 一個淺比較的 `isEqual`,否則每次都算「變了」。
 *
 * ```ts
 * const all = useStore(store)
 * const count = useStore(store, (s) => s.items.length)
 * const ids = useStore(store, (s) => s.items.map((i) => i.id), (a, b) => a.join() === b.join())
 * ```
 *
 * `selector` 可以是 inline 函式:它換了就重選一次,沒換而 store 也沒變就直接回快取。
 */
export function useStore<T>(store: Readable<T>): T
export function useStore<T, S>(
	store: Readable<T>,
	selector: (state: T) => S,
	isEqual?: (a: S, b: S) => boolean,
): S
export function useStore<T, S>(
	store: Readable<T>,
	selector?: (state: T) => S,
	isEqual: (a: S, b: S) => boolean = Object.is,
): T | S {
	// 上一次交出去的選擇結果;跨 selector 換手也沿用,isEqual 才能保住同一個參考
	const last = useRef<{ value: S } | null>(null)
	const getSelection = useMemo((): (() => T | S) => {
		if (selector == null) return store.getSnapshot
		let memo: { snapshot: T; selection: S } | null = null
		return () => {
			const snapshot = store.getSnapshot()
			if (memo != null && Object.is(memo.snapshot, snapshot)) return memo.selection
			const next = selector(snapshot)
			const selection = last.current != null && isEqual(last.current.value, next) ? last.current.value : next
			memo = { snapshot, selection }
			last.current = { value: selection }
			return selection
		}
	}, [store, selector, isEqual])
	return useSyncExternalStore(store.subscribe, getSelection, getSelection)
}
