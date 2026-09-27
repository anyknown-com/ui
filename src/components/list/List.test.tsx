import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import { ListHead, ListRow, ListSort, WeightDot } from "./List"

describe("ListHead / ListSort", () => {
	test("排序中的欄名後面跟著 ↓,按下去換排序", () => {
		const onOrder = vi.fn()
		render(
			<ListHead>
				<ListSort active onClick={() => onOrder("check")}>
					狀態
				</ListSort>
				<span>記憶</span>
				<ListSort onClick={() => onOrder("recent")}>建立</ListSort>
			</ListHead>,
		)
		expect(screen.getByRole("button", { name: "狀態 ↓" })).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "建立" }))
		expect(onOrder).toHaveBeenCalledWith("recent")
	})

	test("不能排序的表頭可以整個對讀屏藏起來", () => {
		const { container } = render(
			<ListHead aria-hidden="true">
				<span>問題</span>
			</ListHead>,
		)
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
	})
})

describe("ListRow", () => {
	test("一列就是一顆按鈕", () => {
		const onClick = vi.fn()
		render(
			<ListRow onClick={onClick} aria-expanded={false}>
				<span>房租上限 25k</span>
				<span>個人</span>
			</ListRow>,
		)
		const row = screen.getByRole("button", { name: "房租上限 25k個人" })
		expect(row).toHaveAttribute("aria-expanded", "false")
		fireEvent.click(row)
		expect(onClick).toHaveBeenCalledOnce()
	})
})

describe("WeightDot", () => {
	test("heavy 是空心環,light 是實心點", () => {
		const { container } = render(
			<>
				<WeightDot weight="heavy" title="要你決定" />
				<WeightDot weight="light" />
				<WeightDot weight="light" soon />
			</>,
		)
		const [heavy, light, soon] = [...container.children]
		expect(heavy).toHaveAttribute("title", "要你決定")
		expect(heavy).toHaveStyle({ borderStyle: "solid", borderWidth: "1.5px" })
		expect(light).toHaveStyle({ borderStyle: "none" })
		expect(light?.className).not.toBe(soon?.className)
	})
})
