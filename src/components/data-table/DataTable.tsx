import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.md },
	filter: { position: "relative", width: "min(18rem, 100%)" },
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
		borderRadius: radius.md,
		color: color.text,
		fontFamily: font.body,
		fontSize: text.sm,
		paddingBlock: space.xxs,
		paddingInlineStart: space.xl,
		paddingInlineEnd: space.xs,
		minHeight: "1.9rem",
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
		"::placeholder": { color: color.textFaint },
	},
	count: { fontFamily: font.mono, fontSize: "0.72rem", lineHeight: 1, color: color.textFaint },
	wrap: {
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		maxHeight: "20rem",
		overflow: "auto",
		marginTop: space.xs,
	},
	table: { width: "100%", borderCollapse: "collapse", fontFamily: font.body, fontSize: text.sm },
	th: {
		position: "sticky",
		insetBlockStart: 0,
		zIndex: 1,
		backgroundColor: color.surface,
		boxShadow: `inset 0 -1px ${color.border}`,
		textAlign: "start",
		padding: 0,
		whiteSpace: "nowrap",
	},
	thCheck: { width: "2rem", paddingBlock: space.xxs, paddingInline: space.xs },
	sort: {
		all: "unset",
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		width: "100%",
		boxSizing: "border-box",
		cursor: "pointer",
		paddingBlock: space.xs,
		paddingInline: space.xs,
		fontFamily: font.mono,
		fontSize: "0.68rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.07em",
		textTransform: "uppercase",
		color: { default: color.textMuted, ":hover": color.text },
		borderRadius: radius.sm,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	plainHeader: {
		display: "block",
		paddingBlock: space.xs,
		paddingInline: space.xs,
		fontFamily: font.mono,
		fontSize: "0.68rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.07em",
		textTransform: "uppercase",
		color: color.textMuted,
	},
	arrow: { color: color.accent, fontSize: "0.6rem" },
	row: {
		backgroundColor: { default: "transparent", ":hover": color.bg },
	},
	rowSelected: { backgroundColor: color.accentSubtle },
	td: {
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		verticalAlign: "middle",
		color: color.text,
	},
	tdCheck: { width: "2rem" },
	mono: { fontFamily: font.mono, fontSize: "0.78rem", color: color.textMuted, whiteSpace: "nowrap" },
	editable: { cursor: "text" },
	empty: { color: color.textFaint },
	cellInput: {
		all: "unset",
		width: "100%",
		fontFamily: font.body,
		fontSize: text.sm,
		boxShadow: `inset 0 0 0 2px ${color.focusRing}`,
		borderRadius: radius.sm,
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
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
	},
	clear: {
		all: "unset",
		color: color.accent,
		cursor: "pointer",
		textDecorationLine: "underline",
		textUnderlineOffset: 2,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
})

function SearchIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
	)
}

export type SortState = { col: string; dir: "asc" | "desc" } | null

export type DataTableColumn<Row> = {
	id: string
	header: string
	mono?: boolean
	sortable?: boolean
	editable?: boolean
	value?: (row: Row) => string
	cell?: (row: Row) => ReactNode
	onCommit?: (row: Row, next: string) => void
}

export type DataTableProps<Row> = {
	rows: Row[]
	/** Total before filtering, for the "N / M" readout. Defaults to `rows.length`. */
	total?: number
	rowKey: (row: Row) => string
	columns: DataTableColumn<Row>[]
	label: string
	filter?: string
	onFilterChange?: (filter: string) => void
	filterPlaceholder?: string
	sort?: SortState
	onSortChange?: (sort: SortState) => void
	selected?: Set<string>
	onSelectedChange?: (selected: Set<string>) => void
	emptyState?: (query: string) => ReactNode
	onClearFilter?: () => void
	countLabel?: (shown: number, total: number) => string
	selectLabel?: (key: string) => string
	selectAllLabel?: string
	editLabel?: (column: string, key: string) => string
	clearLabel?: string
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

export function DataTable<Row>({
	rows,
	total,
	rowKey,
	columns,
	label,
	filter = "",
	onFilterChange,
	filterPlaceholder = "過濾…",
	sort = null,
	onSortChange,
	selected,
	onSelectedChange,
	emptyState,
	onClearFilter,
	countLabel = (shown, total) => `${shown} / ${total}`,
	selectLabel = (key) => `選取 ${key}`,
	selectAllLabel = "全選",
	editLabel = (column, key) => `編輯 ${key} 的 ${column}`,
	clearLabel = "清除過濾",
}: DataTableProps<Row>) {
	const [editing, setEditing] = useState<{ key: string; col: string } | null>(null)
	const cancelling = useRef(false)
	const [draft, setDraft] = useState("")
	const selectAll = useRef<HTMLInputElement>(null)

	const visible = rows
	const keys = visible.map(rowKey)
	const selectedCount = selected ? keys.filter((key) => selected.has(key)).length : 0
	const allSelected = keys.length > 0 && selectedCount === keys.length

	useEffect(() => {
		if (selectAll.current) selectAll.current.indeterminate = selectedCount > 0 && !allSelected
	}, [selectedCount, allSelected])

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
		if (sort?.col !== column.id) onSortChange?.({ col: column.id, dir: "asc" })
		else onSortChange?.(sort.dir === "asc" ? { col: column.id, dir: "desc" } : null)
	}

	function toggleAll(checked: boolean) {
		const next = new Set(selected ?? [])
		for (const key of keys) {
			if (checked) next.add(key)
			else next.delete(key)
		}
		onSelectedChange?.(next)
	}

	return (
		<div>
			<div {...stylex.props(styles.toolbar)}>
				<div {...stylex.props(styles.filter)}>
					<span {...stylex.props(styles.filterIcon)}>
						<SearchIcon />
					</span>
					<input
						type="search"
						aria-label={filterPlaceholder}
						placeholder={filterPlaceholder}
						value={filter}
						onChange={(event) => onFilterChange?.(event.currentTarget.value)}
						{...stylex.props(styles.filterInput)}
					/>
				</div>
				<span aria-live="polite" {...stylex.props(styles.count)}>
					{countLabel(visible.length, total ?? rows.length)}
				</span>
			</div>
			<div tabIndex={0} role="region" aria-label={label} {...stylex.props(styles.wrap)}>
				<table aria-label={label} {...stylex.props(styles.table)}>
					<thead>
						<tr>
							{selected != null && (
								<th scope="col" {...stylex.props(styles.th, styles.thCheck)}>
									<input
										ref={selectAll}
										type="checkbox"
										checked={allSelected}
										aria-label={selectAllLabel}
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
										<button type="button" onClick={() => toggleSort(column)} {...stylex.props(styles.sort)}>
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
									{emptyState?.(filter) ?? `找不到符合「${filter}」的資料。`}
									{onClearFilter != null && (
										<>
											{" "}
											<button type="button" onClick={onClearFilter} {...stylex.props(styles.clear)}>
												{clearLabel}
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
													aria-label={selectLabel(key)}
													onChange={(event) => {
														const next = new Set(selected)
														if (event.currentTarget.checked) next.add(key)
														else next.delete(key)
														onSelectedChange?.(next)
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
															aria-label={editLabel(column.header, key)}
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
															{...stylex.props(styles.cellInput)}
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
			</div>
		</div>
	)
}
