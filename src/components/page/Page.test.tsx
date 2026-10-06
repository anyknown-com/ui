import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import {
	Bars,
	Faint,
	FootNote,
	Hint,
	PageHead,
	PageNumber,
	PageSub,
	Panel,
	SectionLabel,
	Snippet,
	StatBar,
	StatLine,
} from "./Page"

describe("PageHead", () => {
	test("the title is the page's h1, lead and summary sit around the spacer", () => {
		const { container } = render(
			<PageHead
				title="連線"
				lead="已連接 3"
				summary={
					<>
						已設定 <PageNumber>3</PageNumber> / 8
					</>
				}
				actions={<button type="button">新增</button>}
			/>,
		)
		expect(screen.getByRole("heading", { level: 1, name: "連線" })).toBeInTheDocument()
		const parts = [...(container.firstElementChild?.children ?? [])].map((child) => child.textContent)
		expect(parts).toEqual(["連線", "已連接 3", "", "已設定 3 / 8", "新增"])
	})

	test("lead and summary are left out when not given", () => {
		const { container } = render(<PageHead title="連線" />)
		expect(container.firstElementChild?.children).toHaveLength(2)
	})
})

describe("words around the rows", () => {
	test("SectionLabel puts end at the far side", () => {
		render(<SectionLabel end="3">工具</SectionLabel>)
		expect(screen.getByText("工具")).toContainElement(screen.getByText("3"))
	})

	test("sentences are paragraphs, a snippet is preformatted", () => {
		render(
			<>
				<PageSub>說明</PageSub>
				<FootNote>註腳</FootNote>
				<Hint>提示</Hint>
				<Snippet>{"npm i\n@anyknown/ui"}</Snippet>
			</>,
		)
		expect(screen.getByText("說明").tagName).toBe("P")
		expect(screen.getByText("註腳").tagName).toBe("P")
		expect(screen.getByText("提示").tagName).toBe("P")
		expect(screen.getByText(/npm i/).tagName).toBe("PRE")
	})

	test("Panel, StatLine and Faint render their children", () => {
		render(
			<Panel padded>
				<StatLine>
					<Faint>本週</Faint> 12
				</StatLine>
			</Panel>,
		)
		expect(screen.getByText("本週")).toBeInTheDocument()
	})
})

describe("StatBar", () => {
	test("is a progressbar clamped to 0–100, named and valued when asked", () => {
		render(
			<>
				<StatBar percent={140} label="用量" text="滿了" />
				<StatBar percent={-5} label="空的" />
			</>,
		)
		const [full, empty] = screen.getAllByRole("progressbar")
		expect(full).toHaveAttribute("aria-valuenow", "100")
		expect(full).toHaveAccessibleName("用量")
		expect(full).toHaveAttribute("aria-valuetext", "滿了")
		expect(empty).toHaveAttribute("aria-valuenow", "0")
	})
})

describe("Bars", () => {
	test("one bar per value with its tip, the range named under and on the group", () => {
		const { container } = render(
			<Bars values={[1, 4, 2]} tip={(value, index) => `第 ${index + 1} 天:${value}`} from="9/1" to="9/3" />,
		)
		expect(screen.getByRole("group", { name: "9/1 到 9/3" })).toBeInTheDocument()
		const bars = container.querySelectorAll("i")
		expect(bars).toHaveLength(3)
		expect(bars[1]).toHaveAttribute("title", "第 2 天:4")
		expect(screen.getByText("9/1")).toBeInTheDocument()
		expect(screen.getByText("9/3")).toBeInTheDocument()
	})

	test("the range word follows the LocaleProvider and labels", () => {
		render(
			<LocaleProvider locale="en">
				<Bars values={[1]} tip={String} from="Sep 1" to="Sep 7" />
				<Bars values={[1]} tip={String} from="Mon" to="Sun" labels={{ range: (a, b) => `${a}–${b}` }} />
			</LocaleProvider>,
		)
		expect(screen.getByRole("group", { name: "Sep 1 to Sep 7" })).toBeInTheDocument()
		expect(screen.getByRole("group", { name: "Mon–Sun" })).toBeInTheDocument()
	})
})

test("axe: a whole page of words", async () => {
	const { container } = render(
		<main>
			<PageHead title="用量" summary={<PageNumber>42</PageNumber>} />
			<SectionLabel first end="7 天">
				每日
			</SectionLabel>
			<Bars values={[1, 2, 3]} tip={String} from="9/1" to="9/3" />
			<StatLine>
				<StatBar percent={40} label="額度" />
				<Faint>40%</Faint>
			</StatLine>
			<PageSub>說明</PageSub>
			<Snippet>code</Snippet>
		</main>,
	)
	await expectNoAxeViolations(container)
})
