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
})
