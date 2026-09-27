import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { type SVGProps, useState } from "react"
import { describe, expect, test, vi } from "vitest"
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
})

describe("TextCell", () => {
	test("是一個多行輸入", () => {
		render(<TextCell aria-label="說明" defaultValue="給 AI 看的" />)
		expect(screen.getByRole("textbox", { name: "說明" })).toHaveValue("給 AI 看的")
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
