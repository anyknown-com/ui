import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useMemo, useState } from "react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { Badge } from "../badge/Badge"
import { DataTable, type DataTableColumn, type SortState } from "./DataTable"

type Entry = { key: string; zh: string; en: string; status: "ok" | "missing" | "review" }

const ENTRIES: Entry[] = [
	{ key: "nav.projects", zh: "專案", en: "Projects", status: "ok" },
	{ key: "nav.settings", zh: "", en: "Settings", status: "missing" },
	{ key: "thread.handoff", zh: "換班", en: "Handoff", status: "review" },
]

function Dictionary({ onCommit }: { onCommit?: (row: Entry, next: string) => void }) {
	const [filter, setFilter] = useState("")
	const [sort, setSort] = useState<SortState>(null)
	const [selected, setSelected] = useState<Set<string>>(new Set())

	const columns: DataTableColumn<Entry>[] = useMemo(
		() => [
			{ id: "key", header: "key", mono: true, sortable: true, value: (row) => row.key },
			{ id: "zh", header: "zh-TW", sortable: true, editable: true, value: (row) => row.zh, onCommit },
			{ id: "en", header: "en", sortable: true, editable: true, value: (row) => row.en, onCommit },
			{
				id: "status",
				header: "狀態",
				value: (row) => row.status,
				cell: (row) => (
					<Badge variant={row.status === "ok" ? "accent" : row.status === "missing" ? "danger" : "neutral"}>
						{row.status}
					</Badge>
				),
			},
		],
		[onCommit],
	)

	const rows = useMemo(() => {
		const query = filter.toLowerCase()
		const filtered = ENTRIES.filter((row) =>
			[row.key, row.zh, row.en].some((value) => value.toLowerCase().includes(query)),
		)
		if (!sort) return filtered
		const column = columns.find((c) => c.id === sort.col)
		return [...filtered].sort((a, b) => {
			const result = (column?.value?.(a) ?? "").localeCompare(column?.value?.(b) ?? "")
			return sort.dir === "asc" ? result : -result
		})
	}, [filter, sort, columns])

	return (
		<DataTable
			label="字典"
			rows={rows}
			total={ENTRIES.length}
			rowKey={(row) => row.key}
			columns={columns}
			filter={filter}
			onFilterChange={setFilter}
			filterPlaceholder="過濾 key 或譯文"
			sort={sort}
			onSortChange={setSort}
			selected={selected}
			onSelectedChange={setSelected}
			onClearFilter={() => setFilter("")}
			countLabel={(shown, total) => `${shown} / ${total} keys`}
		/>
	)
}

describe("DataTable", () => {
	test("renders a real labelled table", () => {
		render(<Dictionary />)
		expect(screen.getByRole("table", { name: "字典" })).toBeInTheDocument()
		expect(screen.getAllByRole("row")).toHaveLength(ENTRIES.length + 1)
	})

	test("sorting cycles asc → desc → none and reports it with aria-sort", async () => {
		render(<Dictionary />)
		const header = screen.getByRole("button", { name: /^key/ })
		const cell = () => header.closest("th") as HTMLElement
		expect(cell()).not.toHaveAttribute("aria-sort")
		await userEvent.click(header)
		expect(cell()).toHaveAttribute("aria-sort", "ascending")
		await userEvent.click(header)
		expect(cell()).toHaveAttribute("aria-sort", "descending")
		await userEvent.click(header)
		expect(cell()).not.toHaveAttribute("aria-sort")
	})

	test("only one column carries aria-sort at a time", async () => {
		render(<Dictionary />)
		await userEvent.click(screen.getByRole("button", { name: /^key/ }))
		await userEvent.click(screen.getByRole("button", { name: /^zh-TW/ }))
		expect(document.querySelectorAll("th[aria-sort]")).toHaveLength(1)
	})

	test("filtering narrows the rows and announces the count", async () => {
		render(<Dictionary />)
		await userEvent.type(screen.getByRole("searchbox", { name: "過濾 key 或譯文" }), "nav")
		expect(screen.getAllByRole("row")).toHaveLength(3)
		const count = screen.getByText(`2 / ${ENTRIES.length} keys`)
		expect(count).toHaveAttribute("aria-live", "polite")
	})

	test("an empty result offers a way back", async () => {
		render(<Dictionary />)
		const input = screen.getByRole("searchbox", { name: "過濾 key 或譯文" })
		await userEvent.type(input, "zzz")
		expect(screen.getByText(/找不到符合「zzz」/)).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "清除過濾" }))
		expect(input).toHaveValue("")
	})

	test("row checkboxes name their row and the header goes indeterminate", async () => {
		render(<Dictionary />)
		const all = screen.getByRole("checkbox", { name: "全選" }) as HTMLInputElement
		await userEvent.click(screen.getByRole("checkbox", { name: "選取 nav.projects" }))
		expect(all.indeterminate).toBe(true)
		await userEvent.click(all)
		expect(all.indeterminate).toBe(false)
		expect(all).toBeChecked()
		for (const entry of ENTRIES) {
			expect(screen.getByRole("checkbox", { name: `選取 ${entry.key}` })).toBeChecked()
		}
	})

	test("double-click edits a cell; Enter commits", async () => {
		const onCommit = vi.fn()
		render(<Dictionary onCommit={onCommit} />)
		const cell = screen.getByText("專案")
		await userEvent.dblClick(cell)
		const input = screen.getByRole("textbox", { name: "編輯 nav.projects 的 zh-TW" })
		await userEvent.clear(input)
		await userEvent.type(input, "專案們{Enter}")
		expect(onCommit).toHaveBeenCalledWith(ENTRIES[0], "專案們")
	})

	test("Escape cancels an edit without writing", async () => {
		const onCommit = vi.fn()
		render(<Dictionary onCommit={onCommit} />)
		await userEvent.dblClick(screen.getByText("專案"))
		const input = screen.getByRole("textbox", { name: /編輯 nav.projects/ })
		await userEvent.clear(input)
		await userEvent.type(input, "丟掉{Escape}")
		expect(onCommit).not.toHaveBeenCalled()
		expect(screen.getByText("專案")).toBeInTheDocument()
	})

	test("blur commits, matching the documented behaviour", async () => {
		const onCommit = vi.fn()
		render(<Dictionary onCommit={onCommit} />)
		await userEvent.dblClick(screen.getByText("專案"))
		const input = screen.getByRole("textbox", { name: /編輯 nav.projects/ })
		await userEvent.clear(input)
		await userEvent.type(input, "改過了")
		await userEvent.tab()
		expect(onCommit).toHaveBeenCalledWith(ENTRIES[0], "改過了")
	})

	test("an empty value renders a faint dash", () => {
		render(<Dictionary />)
		const row = screen.getByRole("checkbox", { name: "選取 nav.settings" }).closest("tr") as HTMLElement
		expect(within(row).getByText("—")).toBeInTheDocument()
	})

	test("a custom cell renderer is used for the status column", () => {
		render(<Dictionary />)
		expect(screen.getByText("missing")).toBeInTheDocument()
	})
})

const KEY_COLUMN: DataTableColumn<Entry>[] = [
	{ id: "key", header: "key", sortable: true, value: (row) => row.key },
]

describe("DataTable uncontrolled state", () => {
	test("defaultSelected adds the checkbox column and toggles on its own", async () => {
		const onSelectedChange = vi.fn()
		render(
			<DataTable
				label="字典"
				rows={ENTRIES}
				rowKey={(row) => row.key}
				columns={KEY_COLUMN}
				defaultSelected={new Set(["nav.projects"])}
				onSelectedChange={onSelectedChange}
			/>,
		)
		expect(screen.getByRole("checkbox", { name: "選取 nav.projects" })).toBeChecked()
		await userEvent.click(screen.getByRole("checkbox", { name: "選取 nav.settings" }))
		expect(screen.getByRole("checkbox", { name: "選取 nav.settings" })).toBeChecked()
		expect(onSelectedChange).toHaveBeenCalledExactlyOnceWith(new Set(["nav.projects", "nav.settings"]))
	})

	test("controlled selection stays where the parent puts it", async () => {
		const onSelectedChange = vi.fn()
		render(
			<DataTable
				label="字典"
				rows={ENTRIES}
				rowKey={(row) => row.key}
				columns={KEY_COLUMN}
				selected={new Set()}
				onSelectedChange={onSelectedChange}
			/>,
		)
		await userEvent.click(screen.getByRole("checkbox", { name: "全選" }))
		expect(onSelectedChange).toHaveBeenCalledWith(new Set(ENTRIES.map((entry) => entry.key)))
		expect(screen.getByRole("checkbox", { name: "全選" })).not.toBeChecked()
	})

	test("defaultSort starts the order and the headers cycle it", async () => {
		const onSortChange = vi.fn()
		render(
			<DataTable
				label="字典"
				rows={ENTRIES}
				rowKey={(row) => row.key}
				columns={KEY_COLUMN}
				defaultSort={{ col: "key", dir: "asc" }}
				onSortChange={onSortChange}
			/>,
		)
		const header = screen.getByRole("button", { name: /^key/ })
		expect(header.closest("th")).toHaveAttribute("aria-sort", "ascending")
		await userEvent.click(header)
		expect(header.closest("th")).toHaveAttribute("aria-sort", "descending")
		expect(onSortChange).toHaveBeenCalledWith({ col: "key", dir: "desc" })
	})

	test("defaultFilter shows the filter box, and clearing empties it", async () => {
		const onFilterChange = vi.fn()
		const onClearFilter = vi.fn()
		render(
			<DataTable
				label="字典"
				rows={[]}
				total={ENTRIES.length}
				rowKey={(row: Entry) => row.key}
				columns={KEY_COLUMN}
				defaultFilter="zzz"
				onFilterChange={onFilterChange}
				onClearFilter={onClearFilter}
			/>,
		)
		const box = screen.getByRole("searchbox")
		expect(box).toHaveValue("zzz")
		await userEvent.click(screen.getByRole("button", { name: "清除過濾" }))
		expect(box).toHaveValue("")
		expect(onFilterChange).toHaveBeenCalledWith("")
		expect(onClearFilter).toHaveBeenCalledOnce()
	})
})

describe("DataTable checkbox targets", () => {
	test("each checkbox sits in a 24px label, and clicking the label toggles it once", async () => {
		render(<Dictionary />)
		const box = screen.getByRole("checkbox", { name: "選取 nav.projects" })
		const hit = box.closest("label") as HTMLElement
		expect(hit).toHaveStyle({ minWidth: "24px", minHeight: "24px" })
		expect(screen.getByRole("checkbox", { name: "全選" }).closest("label")).toHaveStyle({ minHeight: "24px" })
		await userEvent.click(hit)
		expect(box).toBeChecked()
	})
})

describe("DataTable words", () => {
	test("follow the LocaleProvider, and labels override one of them", async () => {
		render(
			<LocaleProvider locale="en">
				<DataTable
					label="Dictionary"
					rows={[] as Entry[]}
					total={3}
					rowKey={(row) => row.key}
					columns={KEY_COLUMN}
					defaultFilter="zzz"
					defaultSelected={new Set()}
					onClearFilter={() => {}}
					labels={{ clearFilter: "Show everything" }}
				/>
			</LocaleProvider>,
		)
		expect(screen.getByRole("searchbox", { name: "Filter…" })).toBeInTheDocument()
		expect(screen.getByRole("checkbox", { name: "Select all" })).toBeInTheDocument()
		expect(screen.getByText("Nothing matches “zzz”.")).toBeInTheDocument()
		expect(screen.getByText("0 / 3")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Show everything" })).toBeInTheDocument()
	})

	test("the deprecated word props still win", () => {
		render(
			<LocaleProvider locale="en">
				<DataTable
					label="Dictionary"
					rows={ENTRIES}
					rowKey={(row) => row.key}
					columns={KEY_COLUMN}
					defaultSelected={new Set()}
					selectAllLabel="All rows"
					selectLabel={(key) => `Pick ${key}`}
					labels={{ selectAll: "ignored" }}
				/>
			</LocaleProvider>,
		)
		expect(screen.getByRole("checkbox", { name: "All rows" })).toBeInTheDocument()
		expect(screen.getByRole("checkbox", { name: "Pick nav.projects" })).toBeInTheDocument()
	})

	test("axe: filter, sort, selection and an edit in progress", async () => {
		const { container } = render(<Dictionary />)
		await userEvent.click(screen.getByRole("button", { name: /^key/ }))
		await userEvent.click(screen.getByRole("checkbox", { name: "選取 nav.projects" }))
		await userEvent.dblClick(screen.getByText("專案"))
		await expectNoAxeViolations(container)
	})
})

describe("DataTable regressions", () => {
	test("the count reports the pre-filter total, not the filtered length twice", async () => {
		render(<Dictionary />)
		expect(screen.getByText(`${ENTRIES.length} / ${ENTRIES.length} keys`)).toBeInTheDocument()
		await userEvent.type(screen.getByRole("searchbox", { name: "過濾 key 或譯文" }), "nav")
		expect(screen.getByText(`2 / ${ENTRIES.length} keys`)).toBeInTheDocument()
	})

	test("Enter and F2 open an editable cell, and focus comes back to it", async () => {
		render(<Dictionary />)
		const cell = screen.getByText("專案").closest("td") as HTMLElement
		cell.focus()
		await userEvent.keyboard("{Enter}")
		const input = screen.getByRole("textbox", { name: /編輯 nav.projects/ })
		await userEvent.keyboard("{Escape}")
		expect(input).not.toBeInTheDocument()
		expect(cell).toHaveFocus()
		await userEvent.keyboard("{F2}")
		expect(screen.getByRole("textbox", { name: /編輯 nav.projects/ })).toBeInTheDocument()
	})

	test("the scrolling container is keyboard reachable", () => {
		render(<Dictionary />)
		expect(screen.getByRole("region", { name: "字典" })).toHaveAttribute("tabindex", "0")
	})

	test("without onFilterChange there is no filter toolbar", () => {
		render(
			<DataTable
				label="字典"
				rows={ENTRIES}
				rowKey={(row) => row.key}
				columns={[{ id: "key", header: "key", value: (row) => row.key }]}
			/>,
		)
		expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
		expect(screen.queryByText(`${ENTRIES.length} / ${ENTRIES.length}`)).not.toBeInTheDocument()
	})

	test("an open editor does not survive its row disappearing and coming back", async () => {
		const columns: DataTableColumn<Entry>[] = [
			{ id: "zh", header: "zh-TW", editable: true, value: (row) => row.zh },
		]
		const table = (rows: Entry[]) => (
			<DataTable label="字典" rows={rows} rowKey={(row) => row.key} columns={columns} />
		)
		const { rerender } = render(table(ENTRIES))
		await userEvent.dblClick(screen.getByText("專案"))
		expect(screen.getByRole("textbox", { name: "編輯 nav.projects 的 zh-TW" })).toBeInTheDocument()
		rerender(table(ENTRIES.slice(1)))
		rerender(table(ENTRIES))
		expect(screen.queryByRole("textbox", { name: /編輯 nav.projects/ })).not.toBeInTheDocument()
	})

	test("footer 跟著列一起捲,maxHeight 蓋得掉", () => {
		render(
			<DataTable
				label="字典"
				rows={ENTRIES}
				rowKey={(row) => row.key}
				columns={[{ id: "key", header: "key", value: (row) => row.key }]}
				maxHeight="40rem"
				footer={<button type="button">載入更多</button>}
			/>,
		)
		const region = screen.getByRole("region", { name: "字典" })
		const more = screen.getByRole("button", { name: "載入更多" })
		expect(region).toContainElement(more)
		expect(region.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		expect(region.style.getPropertyValue("max-height") || region.getAttribute("style")).toContain("40rem")
	})
})

describe("DataTable keyboard rows", () => {
	const columns: DataTableColumn<Entry>[] = [
		{ id: "key", header: "key", value: (row) => row.key },
		{ id: "zh", header: "zh-TW", editable: true, value: (row) => row.zh },
	]
	const openable = (onOpen?: (row: Entry) => void, defaultSelected?: Set<string>) => (
		<DataTable
			label="字典"
			rows={ENTRIES}
			rowKey={(row) => row.key}
			columns={columns}
			onOpen={onOpen}
			defaultSelected={defaultSelected}
		/>
	)
	const bodyRows = () => screen.getAllByRole("row").slice(1)

	test("the rows are one tab stop; ↑ / ↓ move focus and the tab stop with it", async () => {
		render(openable(vi.fn()))
		const [first, second] = bodyRows() as [HTMLElement, HTMLElement]
		expect(bodyRows().map((row) => row.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"])
		await userEvent.tab() // the scroll region
		await userEvent.tab()
		expect(first).toHaveFocus()
		await userEvent.keyboard("{ArrowDown}")
		expect(second).toHaveFocus()
		expect(bodyRows().map((row) => row.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"])
		await userEvent.keyboard("{ArrowUp}{ArrowUp}")
		expect(first).toHaveFocus()
	})

	test("Enter opens the focused row", async () => {
		const onOpen = vi.fn()
		render(openable(onOpen))
		;(bodyRows()[0] as HTMLElement).focus()
		await userEvent.keyboard("{ArrowDown}{Enter}")
		expect(onOpen).toHaveBeenCalledTimes(1)
		expect(onOpen).toHaveBeenCalledWith(ENTRIES[1])
	})

	test("a click opens the row, but not a click on its checkbox or editable cell", async () => {
		const onOpen = vi.fn()
		render(openable(onOpen, new Set()))
		await userEvent.click(screen.getByText("nav.projects"))
		expect(onOpen).toHaveBeenCalledWith(ENTRIES[0])
		await userEvent.click(screen.getByRole("checkbox", { name: "選取 nav.settings" }))
		await userEvent.click(screen.getByText("換班"))
		expect(onOpen).toHaveBeenCalledTimes(1)
	})

	test("keys in an editable cell stay the cell's", async () => {
		const onOpen = vi.fn()
		render(openable(onOpen))
		const cell = screen.getByText("專案").closest("td") as HTMLElement
		cell.focus()
		await userEvent.keyboard("{Enter}")
		expect(screen.getByRole("textbox", { name: /編輯 nav.projects/ })).toHaveFocus()
		await userEvent.keyboard("{ArrowDown}{Enter}")
		expect(onOpen).not.toHaveBeenCalled()
		expect(cell).toHaveFocus()
	})

	test("without onOpen the rows are not focusable", () => {
		render(openable())
		for (const row of bodyRows()) expect(row).not.toHaveAttribute("tabindex")
	})

	test("axe: focusable rows", async () => {
		const { container } = render(openable(vi.fn(), new Set()))
		;(bodyRows()[1] as HTMLElement).focus()
		await expectNoAxeViolations(container)
	})
})

describe("DataTable virtual rows", () => {
	type Line = { id: string }
	const many = (count: number): Line[] => Array.from({ length: count }, (_, i) => ({ id: `row-${i}` }))
	const lines = (rows: Line[], onOpen?: (row: Line) => void) => (
		<DataTable
			label="紀錄"
			rows={rows}
			rowKey={(row) => row.id}
			columns={[{ id: "id", header: "id", value: (row) => row.id }]}
			onOpen={onOpen}
		/>
	)
	// Plain selectors: role queries over 1000 mounted rows are slow enough to time out.
	const bodyRows = () => Array.from(document.querySelectorAll<HTMLElement>("tbody tr:not([aria-hidden])"))

	// jsdom lays nothing out: give the scroll region a 320px viewport and let scrollTo move it.
	let restore: () => void
	beforeEach(() => {
		const props = ["offsetHeight", "clientHeight", "scrollHeight"] as const
		const saved = props.map((prop) => Object.getOwnPropertyDescriptor(Element.prototype, prop))
		const savedOffset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")
		const scrollTo = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTo")
		const region = (element: Element) => element.getAttribute("role") === "region"
		const size = (element: Element) => (region(element) ? 320 : 0)
		Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
			configurable: true,
			get: function (this: Element) {
				return size(this)
			},
		})
		Object.defineProperty(Element.prototype, "clientHeight", {
			configurable: true,
			get: function (this: Element) {
				return size(this)
			},
		})
		// Rows draw nothing in jsdom, so the content is as tall as the virtual list says.
		Object.defineProperty(Element.prototype, "scrollHeight", {
			configurable: true,
			get: function (this: Element) {
				return region(this) ? Number(this.querySelector("table")?.getAttribute("aria-rowcount") ?? 0) * 33 : 0
			},
		})
		Element.prototype.scrollTo = function (this: Element, options?: ScrollToOptions | number) {
			if (typeof options === "object" && options.top != null) scrollRegion(this as HTMLElement, options.top)
		} as Element["scrollTo"]
		restore = () => {
			props.forEach((prop, i) => {
				const descriptor = saved[i]
				if (descriptor) Object.defineProperty(Element.prototype, prop, descriptor)
				else delete (Element.prototype as unknown as Record<string, unknown>)[prop]
			})
			if (savedOffset) Object.defineProperty(HTMLElement.prototype, "offsetHeight", savedOffset)
			if (scrollTo) Object.defineProperty(Element.prototype, "scrollTo", scrollTo)
			else delete (Element.prototype as Partial<Element>).scrollTo
		}
	})
	afterEach(() => restore())

	function scrollRegion(region: HTMLElement, top: number) {
		Object.defineProperty(region, "scrollTop", { configurable: true, value: top })
		fireEvent.scroll(region)
	}

	test("5000 rows mount only a window, and scrolling brings later rows in", async () => {
		render(lines(many(5000)))
		const table = screen.getByRole("table", { name: "紀錄" })
		expect(table).toHaveAttribute("aria-rowcount", "5001")
		const mounted = bodyRows()
		expect(mounted.length).toBeGreaterThan(0)
		expect(mounted.length).toBeLessThan(60)
		expect(screen.getByText("row-0")).toBeInTheDocument()
		expect(screen.queryByText("row-4000")).not.toBeInTheDocument()
		expect(mounted[0]).toHaveAttribute("aria-rowindex", "2")

		act(() => scrollRegion(screen.getByRole("region", { name: "紀錄" }), 4000 * 33))
		expect(await screen.findByText("row-4000")).toBeInTheDocument()
		expect(screen.queryByText("row-0")).not.toBeInTheDocument()
		expect(screen.getByText("row-4000").closest("tr")).toHaveAttribute("aria-rowindex", "4002")
		expect(bodyRows().length).toBeLessThan(60)
	})

	test("the row count follows a filter, and 1000 rows or fewer are all mounted", () => {
		const { rerender } = render(lines(many(5000)))
		rerender(lines(many(1500)))
		expect(document.querySelector("table")).toHaveAttribute("aria-rowcount", "1501")
		expect(bodyRows().length).toBeLessThan(60)
		rerender(lines(many(1000)))
		expect(document.querySelector("table")).not.toHaveAttribute("aria-rowcount")
		expect(bodyRows()).toHaveLength(1000)
	})

	test("↓ past the mounted window scrolls the next row in and focuses it", async () => {
		const onOpen = vi.fn()
		render(lines(many(5000), onOpen))
		const mounted = bodyRows()
		const last = mounted[mounted.length - 1] as HTMLElement
		const lastIndex = Number(last.dataset.index)
		last.focus()
		await userEvent.keyboard("{ArrowDown}")
		await waitFor(() => expect(screen.getByText(`row-${lastIndex + 1}`).closest("tr")).toHaveFocus())
		await userEvent.keyboard("{Enter}")
		expect(onOpen).toHaveBeenCalledWith({ id: `row-${lastIndex + 1}` })
	})
})
