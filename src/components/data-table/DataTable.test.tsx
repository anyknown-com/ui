import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useMemo, useState } from "react"
import { describe, expect, test, vi } from "vitest"
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
})
