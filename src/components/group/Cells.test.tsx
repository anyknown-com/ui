import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type SVGProps, useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { GroupCell, InputCell, SliderCell, TextCell } from "./Cells"
import { ActionIcon, IconTile, LetterTile } from "./Tiles"

function Handoff({ onCommit }: { onCommit: (value: number) => void }) {
	const [value, setValue] = useState(0.6)
	return (
		<SliderCell
			label="交接時機"
			min={0.5}
			max={0.9}
			step={0.05}
			value={value}
			text={(v) => `${Math.round(v * 100)}%`}
			onChange={setValue}
			onValueCommit={onCommit}
		/>
	)
}

function Glyph(props: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
	return <svg data-testid="glyph" {...props} />
}

/**
 * jsdom 不展開帶 var() 的 outline 簡寫,computed style 量不到;改讀注入的規則:
 * 這個元素自己的 class 在 `:focus-within` 時宣告的 outline。
 */
function focusWithinOutline(element: HTMLElement) {
	for (const sheet of Array.from(document.styleSheets)) {
		for (const rule of Array.from(sheet.cssRules)) {
			if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes(":focus-within")) continue
			const owner = rule.selectorText.match(/^\.([\w-]+)/)?.[1]
			const outline = rule.style.getPropertyValue("outline")
			if (owner != null && element.classList.contains(owner) && outline) return outline
		}
	}
	return null
}

describe("GroupCell", () => {
	test("有 onPress 就是一顆按鈕,後面一個 chevron", () => {
		const onPress = vi.fn()
		const { container } = render(<GroupCell label="連線" value="要處理" onPress={onPress} />)
		fireEvent.click(screen.getByRole("button", { name: "連線 要處理" }))
		expect(onPress).toHaveBeenCalledOnce()
		expect(container.querySelectorAll("svg")).toHaveLength(1)
	})

	test("選項打勾不畫 chevron,aria-pressed 說它被選了", () => {
		const { container } = render(<GroupCell label="自動" checked onPress={() => {}} />)
		expect(screen.getByRole("button", { name: "自動" })).toHaveAttribute("aria-pressed", "true")
		expect(container.querySelectorAll("svg")).toHaveLength(1)
	})

	test("有 tone 的動作不畫 chevron", () => {
		const { container } = render(<GroupCell label="刪除" tone="danger" onPress={() => {}} />)
		expect(container.querySelectorAll("svg")).toHaveLength(0)
	})

	test("沒有 onPress 就只是字", () => {
		render(<GroupCell label="帳號" detail="solemnis" />)
		expect(screen.queryByRole("button")).toBeNull()
		expect(screen.getByText("solemnis")).toBeInTheDocument()
	})
})

describe("InputCell", () => {
	test("一行輸入,名字就是左邊的 label", () => {
		const onChange = vi.fn()
		render(
			<InputCell
				label="名稱"
				placeholder="STRIPE_KEY"
				onChange={(event) => onChange(event.currentTarget.value)}
			/>,
		)
		const input = screen.getByRole("textbox", { name: "名稱" })
		fireEvent.change(input, { target: { value: "SENTRY_TOKEN" } })
		expect(input).toHaveAttribute("placeholder", "STRIPE_KEY")
		expect(onChange).toHaveBeenCalledWith("SENTRY_TOKEN")
	})

	// 欄位自己的框與環被拿掉了,焦點只能靠整列的 2px 環看出來
	test("focus draws a solid ring around the row", () => {
		render(<InputCell label="名稱" />)
		const row = screen.getByRole("textbox", { name: "名稱" }).closest("label") as HTMLElement
		expect(focusWithinOutline(row)).toMatch(/^var\(--[\w-]+\) solid var\(/)
		expect(row).toHaveStyle({ outlineOffset: "-2px" })
	})
})

describe("TextCell", () => {
	test("是一個多行輸入", () => {
		render(<TextCell aria-label="說明" defaultValue="給 AI 看的" />)
		expect(screen.getByRole("textbox", { name: "說明" })).toHaveValue("給 AI 看的")
	})

	test("focus draws a solid ring around the row", () => {
		render(<TextCell aria-label="說明" />)
		const row = screen.getByRole("textbox", { name: "說明" }).parentElement as HTMLElement
		expect(focusWithinOutline(row)).toMatch(/^var\(--[\w-]+\) solid var\(/)
	})
})

describe("SliderCell", () => {
	test("右邊寫著讀數,鍵盤動一次值就 commit 一次", async () => {
		const onCommit = vi.fn()
		const user = userEvent.setup()
		render(<Handoff onCommit={onCommit} />)
		expect(screen.getByText("60%")).toBeInTheDocument()

		await user.tab()
		await user.keyboard("{End}")
		expect(screen.getByText("90%")).toBeInTheDocument()
		expect(screen.getByRole("slider", { name: "交接時機" })).toHaveAttribute("aria-valuetext", "90%")
		expect(onCommit).toHaveBeenCalledExactlyOnceWith(0.9)
	})

	test("uncontrolled: defaultValue starts it and the reading follows the keys", async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(
			<SliderCell
				label="交接時機"
				min={0.5}
				max={0.9}
				step={0.05}
				defaultValue={0.7}
				text={(v) => `${Math.round(v * 100)}%`}
				onValueChange={onValueChange}
			/>,
		)
		expect(screen.getByText("70%")).toBeInTheDocument()
		await user.tab()
		await user.keyboard("{Home}")
		expect(screen.getByText("50%")).toBeInTheDocument()
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(0.5)
	})

	test("controlled with onValueChange", async () => {
		const onValueChange = vi.fn()
		const user = userEvent.setup()
		render(
			<SliderCell
				label="交接時機"
				min={0}
				max={1}
				step={0.1}
				value={0.4}
				text={(v) => `${Math.round(v * 100)}%`}
				onValueChange={onValueChange}
			/>,
		)
		await user.tab()
		await user.keyboard("{End}")
		expect(onValueChange).toHaveBeenCalledWith(1)
		expect(screen.getByText("40%")).toBeInTheDocument()
	})
})

describe("cells axe", () => {
	test("every cell kind, with a checked choice and a disabled field", async () => {
		const { container } = render(
			<div>
				<GroupCell label="模型" value="Opus" onPress={() => {}} />
				<GroupCell label="自動" checked onPress={() => {}} />
				<GroupCell label="刪除" tone="danger" onPress={() => {}} />
				<GroupCell label="帳號" detail="solemnis" icon={<IconTile icon={Glyph} />} />
				<GroupCell label="Notion" icon={<LetterTile name="notion" />} />
				<GroupCell label="新增" tone="accent" icon={<ActionIcon icon={Glyph} />} onPress={() => {}} />
				<InputCell label="名稱" placeholder="STRIPE_KEY" />
				<InputCell label="停用" disabled />
				<TextCell aria-label="說明" />
				<SliderCell label="交接" min={0} max={1} step={0.1} defaultValue={0.5} text={String} />
			</div>,
		)
		await expectNoAxeViolations(container)
	})
})

describe("tiles", () => {
	test("LetterTile 只放第一個字,大寫,讀屏跳過", () => {
		const { container } = render(<LetterTile name="figma" />)
		expect(container.firstElementChild).toHaveTextContent(/^F$/)
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
	})

	test("IconTile 與 ActionIcon 用 2 的筆畫畫傳進來的 glyph", () => {
		render(
			<>
				<IconTile icon={Glyph} />
				<ActionIcon icon={Glyph} />
			</>,
		)
		for (const glyph of screen.getAllByTestId("glyph")) {
			expect(glyph).toHaveAttribute("stroke-width", "2")
			expect(glyph).toHaveAttribute("aria-hidden", "true")
		}
	})
})
