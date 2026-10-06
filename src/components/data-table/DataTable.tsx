import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useCallback, useRef, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { type StyleArg, reset } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.md },
	// 窄的時候是過濾框讓位,不是計數折行
	filter: { position: "relative", flex: "0 1 18rem", minWidth: 0 },
	filterIcon: {
		position: "absolute",
		insetInlineStart: space.xs,
		insetBlockStart: "50%",
		translate: "0 -50%",
		color: color.textFaint,
		pointerEvents: "none",
		display: "flex",
	},
	filterInput: {
		width: "100%",
		boxSizing: "border-box",
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: color.border, ":hover": color.borderStrong, ":focus-visible": color.focusRing },
		borderRadius: corner.control,
		color: color.text,
		fontFamily: font.body,
		fontSize: type.t2,
		paddingBlock: space.xxs,
		paddingInlineStart: space.xl,
		paddingInlineEnd: space.xs,
		minHeight: "1.9rem",
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
		"::placeholder": { color: color.textMuted },
	},
	count: {
		color: color.textMuted,
		flex: "none",
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: 1,
		whiteSpace: "nowrap",
	},
	// Full width in its section, never a card: no frame, no fill. The head is a sunken strip.
	wrap: {
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
		borderRadius: corner.small,
		overflow: "auto",
		marginTop: space.xs,
	},
	capped: (maxHeight: string | number) => ({ maxHeight }),
	table: {
		width: "100%",
		borderCollapse: "separate",
		borderSpacing: 0,
		fontFamily: font.body,
		fontSize: type.t2,
	},
	th: {
		position: "sticky",
		insetBlockStart: 0,
		zIndex: 1,
		backgroundColor: color.surface,
		borderStartStartRadius: { default: 0, ":first-child": corner.small },
		borderEndStartRadius: { default: 0, ":first-child": corner.small },
		borderStartEndRadius: { default: 0, ":last-child": corner.small },
		borderEndEndRadius: { default: 0, ":last-child": corner.small },
		textAlign: "start",
		padding: 0,
		whiteSpace: "nowrap",
	},
	thCheck: { width: "2rem", paddingBlock: space.xxs, paddingInline: space.xs },
	sort: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		width: "100%",
		boxSizing: "border-box",
		cursor: "pointer",
		paddingBlock: space.xs,
		paddingInline: space.xs,
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		lineHeight: 1,
		color: { default: color.textMuted, ":hover": color.text },
		borderRadius: corner.small,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	plainHeader: {
		display: "block",
		paddingBlock: space.xs,
		paddingInline: space.xs,
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		lineHeight: 1,
		color: color.textMuted,
	},
	arrow: { color: color.accent, fontSize: type.t1 },
	row: {
		backgroundColor: { default: "transparent", ":hover": color.layer3 },
	},
	rowSelected: { backgroundColor: color.accentSubtle },
	td: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		verticalAlign: "middle",
		color: color.text,
	},
	tdCheck: { width: "2rem" },
	mono: { fontFamily: font.mono, fontSize: type.t1, color: color.textMuted, whiteSpace: "nowrap" },
	editable: { cursor: "text" },
	empty: { color: color.textFaint },
	cellInput: {
		width: "100%",
		fontFamily: font.body,
		fontSize: type.t2,
		boxShadow: `inset 0 0 0 2px ${color.focusRing}`,
		borderRadius: corner.small,
		paddingInline: "0.2rem",
		marginInline: "-0.2rem",
		backgroundColor: color.surface,
		color: color.text,
	},
	checkbox: {
		accentColor: color.accent,
		width: "0.85rem",
		height: "0.85rem",
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 1,
	},
	emptyRow: {
		paddingBlock: space.xl,
		paddingInline: space.md,
		textAlign: "center",
		color: color.textMuted,
	},
	clear: {
		color: color.link,
		cursor: "pointer",
		textDecorationLine: "underline",
		textUnderlineOffset: 2,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
})

function SearchIcon() {
	return (
		<Glyph width={13} height={13}>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</Glyph>
	)
}

const strings = defineStrings({
	"zh-TW": {
		filterPlaceholder: "過濾…",
		count: (shown: number, total: number) => `${shown} / ${total}`,
		select: (key: string) => `選取 ${key}`,
		selectAll: "全選",
		edit: (column: string, key: string) => `編輯 ${key} 的 ${column}`,
		clearFilter: "清除過濾",
		noMatch: (query: string) => `找不到符合「${query}」的資料。`,
	},
	en: {
		filterPlaceholder: "Filter…",
		count: (shown: number, total: number) => `${shown} / ${total}`,
		select: (key: string) => `Select ${key}`,
		selectAll: "Select all",
		edit: (column: string, key: string) => `Edit ${column} of ${key}`,
		clearFilter: "Clear filter",
		noMatch: (query: string) => `Nothing matches “${query}”.`,
	},
})

/** DataTable's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type DataTableLabels = StringsOf<typeof strings>

/** The column a table is ordered by and which way, or `null` for the rows' own order. */
export type SortState = { col: string; dir: "asc" | "desc" } | null

export type DataTableColumn<Row> = {
	/** Unique among the columns; what `SortState.col` names. */
	id: string
	/** The column's name in the head, and in the edit field's label. */
	header: string
	/** Keys, ids, numbers: the cells in mono. */
	mono?: boolean
	/** The header is a button that cycles ascending → descending → none. */
	sortable?: boolean
	/** Double-click, Enter or F2 on a cell edits it in place; `onCommit` gets the new text. */
	editable?: boolean
	/** The cell as text: what is shown without `cell`, what an edit starts from. */
	value?: (row: Row) => string
	/** Draws the cell instead of `value` (a badge, a link). */
	cell?: (row: Row) => ReactNode
	/** An edit was confirmed with Enter or by leaving the field, and the text changed. */
	onCommit?: (row: Row, next: string) => void
}

export type DataTableProps<Row> = {
	/** The rows to show, already filtered and sorted by the caller. */
	rows: Row[]
	/** Total before filtering, for the "N / M" readout. Defaults to `rows.length`. */
	total?: number
	/** A stable, unique key per row; also what selection holds. */
	rowKey: (row: Row) => string
	/** The columns, in order. */
	columns: DataTableColumn<Row>[]
	/** The table's accessible name (also names its scroll region). */
	label: string
	/** The filter box's text, for a controlled filter. Pair it with `onFilterChange`. */
	filter?: string
	/** The filter box's starting text, for an uncontrolled filter. Giving it shows the filter box. */
	defaultFilter?: string
	/** Called on each edit of the filter box. Giving it shows the filter box. */
	onFilterChange?: (filter: string) => void
	/** @deprecated Use `labels={{ filterPlaceholder }}`. */
	filterPlaceholder?: string
	/** The order, for a controlled table (`null` is no order). Pair it with `onSortChange`. */
	sort?: SortState
	/** The starting order of an uncontrolled table. @default null */
	defaultSort?: SortState
	/** Called when a sortable header is pressed, with the next order. */
	onSortChange?: (sort: SortState) => void
	/** The selected row keys, for controlled selection. Giving it adds the checkbox column. */
	selected?: Set<string>
	/** The keys selected at first, for uncontrolled selection. Giving it adds the checkbox column. */
	defaultSelected?: Set<string>
	/** Called with the whole new set whenever a row or the select-all box is toggled. */
	onSelectedChange?: (selected: Set<string>) => void
	/** What to say when there are no rows, given the filter text. */
	emptyState?: (query: string) => ReactNode
	/** Shows a "clear filter" link in the empty row; it empties the filter, then calls this. */
	onClearFilter?: () => void
	/** Override built-in words for this table; the rest follow `<LocaleProvider>`. */
	labels?: Partial<DataTableLabels>
	/** @deprecated Use `labels={{ count }}`. */
	countLabel?: (shown: number, total: number) => string
	/** @deprecated Use `labels={{ select }}`. */
	selectLabel?: (key: string) => string
	/** @deprecated Use `labels={{ selectAll }}`. */
	selectAllLabel?: string
	/** @deprecated Use `labels={{ edit }}`. */
	editLabel?: (column: string, key: string) => string
	/** @deprecated Use `labels={{ clearFilter }}`. */
	clearLabel?: string
	/** The scroll area's maximum height. @default "20rem" */
	maxHeight?: string | number
	/** An end that scrolls with the rows: "load more" belongs inside the list, not under it. */
	footer?: ReactNode
	sx?: StyleArg
}

// Entering edit mode is a user gesture (double-click), so moving focus into the
// cell is expected — but not via autoFocus, which fires on mount page-wide.
function focusOnMount(node: HTMLInputElement | null) {
	node?.focus()
	node?.select()
}

function cellValue<Row>(column: DataTableColumn<Row>, row: Row): string {
	return column.value?.(row) ?? ""
}

/**
 * A real `<table>` of records: an optional filter box with a live "N / M" count, sortable
 * headers (with `aria-sort`), a checkbox column for selection, and cells edited in place.
 * Filtering and sorting the rows is the caller's job; the table reports what was asked for.
 */
export function DataTable<Row>({
	rows,
	total,
	rowKey,
	columns,
	label,
	filter: filterProp,
	defaultFilter,
	onFilterChange,
	filterPlaceholder,
	sort: sortProp,
	defaultSort = null,
	onSortChange,
	selected: selectedProp,
	defaultSelected,
	onSelectedChange,
	emptyState,
	onClearFilter,
	labels,
	countLabel,
	selectLabel,
	selectAllLabel,
	editLabel,
	clearLabel,
	maxHeight = "20rem",
	footer,
	sx,
}: DataTableProps<Row>) {
	// 舊的單字 props 還認得,而且比 labels 優先(它們只會是呼叫端特地給的)
	const t = useStrings(strings, {
		...labels,
		...(filterPlaceholder !== undefined && { filterPlaceholder }),
		...(countLabel !== undefined && { count: countLabel }),
		...(selectLabel !== undefined && { select: selectLabel }),
		...(selectAllLabel !== undefined && { selectAll: selectAllLabel }),
		...(editLabel !== undefined && { edit: editLabel }),
		...(clearLabel !== undefined && { clearFilter: clearLabel }),
	})
	const [editing, setEditing] = useState<{ key: string; col: string } | null>(null)
	const cancelling = useRef(false)
	const [draft, setDraft] = useState("")
	const [filter, setFilter] = useControllableState(filterProp, defaultFilter ?? "", onFilterChange)
	const [sort, setSort] = useControllableState(sortProp, defaultSort, onSortChange)
	const selectable = selectedProp !== undefined || defaultSelected !== undefined
	const [selectedSet, setSelected] = useControllableState(
		selectedProp,
		defaultSelected ?? new Set<string>(),
		onSelectedChange,
	)
	const selected = selectable ? selectedSet : undefined
	const filtering = onFilterChange != null || defaultFilter !== undefined
	const visible = rows
	const keys = visible.map(rowKey)
	const selectedCount = selected ? keys.filter((key) => selected.has(key)).length : 0
	const allSelected = keys.length > 0 && selectedCount === keys.length
	const someSelected = selectedCount > 0 && !allSelected

	// indeterminate 只能從 DOM 設:ref callback 跟著 someSelected 換 identity,React 重跑它就寫回去
	const selectAll = useCallback(
		(node: HTMLInputElement | null) => {
			if (node) node.indeterminate = someSelected
		},
		[someSelected],
	)

	// A row that disappears while being edited would otherwise strand the draft
	// and re-open with it when the row comes back. Adjusted during render rather
	// than in an effect, so the stale cell never gets painted.
	if (editing != null && !keys.includes(editing.key)) setEditing(null)

	function startEdit(key: string, col: string, value: string) {
		setEditing({ key, col })
		setDraft(value)
	}

	// Returning focus to the cell keeps a keyboard user's place after Enter/Escape,
	// but moving focus off the still-mounted input would fire its blur commit.
	function leaveEdit(cell: HTMLElement | null) {
		cancelling.current = true
		setEditing(null)
		cell?.focus()
		cancelling.current = false
	}

	const commit = useCallback(
		(column: DataTableColumn<Row>, row: Row, next: string, cell: HTMLElement | null) => {
			if (cancelling.current) return
			cancelling.current = true
			setEditing(null)
			cell?.focus()
			cancelling.current = false
			if (next !== cellValue(column, row)) column.onCommit?.(row, next)
		},
		[],
	)

	function toggleSort(column: DataTableColumn<Row>) {
		if (!column.sortable) return
		if (sort?.col !== column.id) setSort({ col: column.id, dir: "asc" })
		else setSort(sort.dir === "asc" ? { col: column.id, dir: "desc" } : null)
	}

	function toggleAll(checked: boolean) {
		const next = new Set(selected ?? [])
		for (const key of keys) {
			if (checked) next.add(key)
			else next.delete(key)
		}
		setSelected(next)
	}

	return (
		<div {...stylex.props(sx)}>
			{filtering && (
				<div {...stylex.props(styles.toolbar)}>
					<div {...stylex.props(styles.filter)}>
						<span {...stylex.props(styles.filterIcon)}>
							<SearchIcon />
						</span>
						<input
							type="search"
							aria-label={t.filterPlaceholder}
							placeholder={t.filterPlaceholder}
							value={filter}
							onChange={(event) => setFilter(event.currentTarget.value)}
							{...stylex.props(styles.filterInput)}
						/>
					</div>
					<span aria-live="polite" {...stylex.props(styles.count)}>
						{t.count(visible.length, total ?? rows.length)}
					</span>
				</div>
			)}
			<div
				tabIndex={0}
				role="region"
				aria-label={label}
				{...stylex.props(styles.wrap, styles.capped(maxHeight))}
			>
				<table aria-label={label} {...stylex.props(styles.table)}>
					<thead>
						<tr>
							{selected != null && (
								<th scope="col" {...stylex.props(styles.th, styles.thCheck)}>
									<input
										ref={selectAll}
										type="checkbox"
										checked={allSelected}
										aria-label={t.selectAll}
										onChange={(event) => toggleAll(event.currentTarget.checked)}
										{...stylex.props(styles.checkbox)}
									/>
								</th>
							)}
							{columns.map((column) => (
								<th
									key={column.id}
									scope="col"
									aria-sort={
										sort?.col === column.id ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
									}
									{...stylex.props(styles.th)}
								>
									{column.sortable ? (
										<button
											type="button"
											onClick={() => toggleSort(column)}
											{...stylex.props(reset.control, styles.sort)}
										>
											{column.header}
											{sort?.col === column.id && (
												<span aria-hidden="true" {...stylex.props(styles.arrow)}>
													{sort.dir === "asc" ? "▲" : "▼"}
												</span>
											)}
										</button>
									) : (
										<span {...stylex.props(styles.plainHeader)}>{column.header}</span>
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{visible.length === 0 ? (
							<tr>
								<td colSpan={columns.length + (selected != null ? 1 : 0)} {...stylex.props(styles.emptyRow)}>
									{emptyState?.(filter) ?? t.noMatch(filter)}
									{onClearFilter != null && (
										<>
											{" "}
											<button
												type="button"
												onClick={() => {
													setFilter("")
													onClearFilter()
												}}
												{...stylex.props(reset.control, styles.clear)}
											>
												{t.clearFilter}
											</button>
										</>
									)}
								</td>
							</tr>
						) : (
							visible.map((row) => {
								const key = rowKey(row)
								const isSelected = selected?.has(key) ?? false
								return (
									<tr key={key} {...stylex.props(styles.row, isSelected && styles.rowSelected)}>
										{selected != null && (
											<td {...stylex.props(styles.td, styles.tdCheck)}>
												<input
													type="checkbox"
													checked={isSelected}
													aria-label={t.select(key)}
													onChange={(event) => {
														const next = new Set(selected)
														if (event.currentTarget.checked) next.add(key)
														else next.delete(key)
														setSelected(next)
													}}
													{...stylex.props(styles.checkbox)}
												/>
											</td>
										)}
										{columns.map((column) => {
											const isEditing = editing?.key === key && editing.col === column.id
											const value = cellValue(column, row)
											return (
												<td
													key={column.id}
													tabIndex={column.editable ? 0 : undefined}
													onDoubleClick={column.editable ? () => startEdit(key, column.id, value) : undefined}
													onKeyDown={
														column.editable && !isEditing
															? (event) => {
																	if (event.key !== "Enter" && event.key !== "F2") return
																	event.preventDefault()
																	startEdit(key, column.id, value)
																}
															: undefined
													}
													{...stylex.props(
														styles.td,
														column.mono && styles.mono,
														column.editable && styles.editable,
													)}
												>
													{isEditing ? (
														<input
															ref={focusOnMount}
															aria-label={t.edit(column.header, key)}
															value={draft}
															onChange={(event) => setDraft(event.currentTarget.value)}
															onBlur={(event) =>
																commit(column, row, draft, event.currentTarget.closest("td"))
															}
															onKeyDown={(event) => {
																const cell = event.currentTarget.closest("td") as HTMLElement | null
																if (event.key === "Enter") {
																	event.preventDefault()
																	commit(column, row, draft, cell)
																} else if (event.key === "Escape") {
																	event.preventDefault()
																	leaveEdit(cell)
																}
															}}
															{...stylex.props(reset.control, styles.cellInput)}
														/>
													) : (
														(column.cell?.(row) ??
														(value === "" ? <span {...stylex.props(styles.empty)}>—</span> : value))
													)}
												</td>
											)
										})}
									</tr>
								)
							})
						)}
					</tbody>
				</table>
				{footer}
			</div>
		</div>
	)
}
