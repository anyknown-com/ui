import { useSyncExternalStore } from "react"

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

/** 訂閱任何有 `subscribe` / `getSnapshot` 的 store(含 toast / dialog manager)。 */
export function useStore<T>(store: Pick<Store<T>, "subscribe" | "getSnapshot">): T {
	return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
