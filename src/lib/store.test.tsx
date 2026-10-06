import { act, render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import { createStore, useStore } from "./store"

describe("createStore", () => {
	test("set replaces the value and notifies subscribers", () => {
		const store = createStore(1)
		const listener = vi.fn()
		store.subscribe(listener)
		store.set(2)
		expect(store.getSnapshot()).toBe(2)
		expect(listener).toHaveBeenCalledTimes(1)
	})

	test("a functional set reads the latest value", () => {
		const store = createStore(1)
		store.set((n) => n + 1)
		store.set((n) => n + 1)
		expect(store.getSnapshot()).toBe(3)
	})

	test("setting the same value does not notify", () => {
		const value = { a: 1 }
		const store = createStore(value)
		const listener = vi.fn()
		store.subscribe(listener)
		store.set(value)
		expect(listener).not.toHaveBeenCalled()
	})

	test("unsubscribe stops notifications", () => {
		const store = createStore(0)
		const listener = vi.fn()
		const unsubscribe = store.subscribe(listener)
		unsubscribe()
		store.set(1)
		expect(listener).not.toHaveBeenCalled()
	})
})

const sameList = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i])

describe("useStore", () => {
	test("re-renders when the store changes", () => {
		const store = createStore("a")
		function Probe() {
			return <span>{useStore(store)}</span>
		}
		render(<Probe />)
		expect(screen.getByText("a")).toBeInTheDocument()
		act(() => store.set("b"))
		expect(screen.getByText("b")).toBeInTheDocument()
	})

	test("a selector re-renders only when its slice changes", () => {
		const store = createStore({ count: 0, label: "a" })
		const renders = vi.fn()
		function Probe() {
			const count = useStore(store, (s) => s.count)
			renders()
			return <span>{count}</span>
		}
		render(<Probe />)
		expect(renders).toHaveBeenCalledTimes(1)
		act(() => store.set((s) => ({ ...s, label: "b" })))
		expect(renders).toHaveBeenCalledTimes(1)
		act(() => store.set((s) => ({ ...s, count: 1 })))
		expect(screen.getByText("1")).toBeInTheDocument()
		expect(renders).toHaveBeenCalledTimes(2)
	})

	test("isEqual keeps the previous reference for an equal selection", () => {
		const store = createStore({ items: [1, 2] })
		const seen: number[][] = []
		function Probe() {
			const evens = useStore(store, (s) => s.items.filter((n) => n % 2 === 0), sameList)
			seen.push(evens)
			return <span>{evens.join(",")}</span>
		}
		render(<Probe />)
		act(() => store.set((s) => ({ ...s, items: [1, 2, 3] })))
		expect(seen).toHaveLength(1)
		act(() => store.set((s) => ({ ...s, items: [2, 4] })))
		expect(screen.getByText("2,4")).toBeInTheDocument()
		expect(seen.at(-1)).toEqual([2, 4])
	})

	test("a selector that reads props picks up the new props", () => {
		const store = createStore({ a: "x", b: "y" })
		function Probe({ field }: { field: "a" | "b" }) {
			return <span>{useStore(store, (s) => s[field])}</span>
		}
		const { rerender } = render(<Probe field="a" />)
		expect(screen.getByText("x")).toBeInTheDocument()
		rerender(<Probe field="b" />)
		expect(screen.getByText("y")).toBeInTheDocument()
	})
})
