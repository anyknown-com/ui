import { useMemo, useRef, useSyncExternalStore } from "react"

/**
 * A minimal external store: one value, one set of listeners. React always reads it through
 * `useStore` (`useSyncExternalStore`), never by syncing in an effect.
 */
export type Store<T> = {
	getSnapshot: () => T
	/** Doesn't notify when the value is unchanged (`Object.is`). */
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
 * Subscribes to any store with `subscribe` / `getSnapshot` (including the toast / dialog managers).
 *
 * With a `selector` it subscribes to one slice only: when the store changes but `isEqual`
 * (default `Object.is`) finds the selected value unchanged, the component doesn't re-render and
 * gets back the same reference as last time. When the selector builds a new object or array,
 * pass a shallow-compare `isEqual`, or every change counts as "changed".
 *
 * ```ts
 * const all = useStore(store)
 * const count = useStore(store, (s) => s.items.length)
 * const ids = useStore(store, (s) => s.items.map((i) => i.id), (a, b) => a.join() === b.join())
 * ```
 *
 * `selector` can be an inline function: when it changes, it selects again; when neither it nor
 * the store changed, the cached value comes straight back.
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
