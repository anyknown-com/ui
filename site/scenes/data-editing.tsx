// What the agent remembers about you, as a table you correct: sort, filter, fix a memory in
// place, pick a few and forget them together. All state is local; nothing is saved.
import {
	Badge,
	Button,
	DataTable,
	type DataTableColumn,
	EmptyState,
	ICON_STROKE,
	PageHead,
	PageNumber,
	PageSub,
	Segmented,
	type SortState,
	toast,
} from "@anyknown/ui"
import { breakpoint, color, corner, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet } from "./Sheet"

export const meta: SceneMeta = {
	id: "data-editing",
	title: "Edit data",
	moment:
		"You open what the agent remembers about you and your work. You fix a memory that is half right where it stands, then pick the ones that are out of date and forget them together.",
	decisions: [
		"The sorted column says so with an arrow and to screen readers, and the count beside the filter says how many rows are left.",
		"A memory is edited where it stands; fixing one marks it confirmed, so the agent trusts your words over its own guess.",
		"The bulk action shows only while rows are selected and names how many it will forget; Undo in the toast brings them back.",
		"Status is a tinted badge: green only for what you confirmed, a warning dot for what is out of date, gray for what the agent learned alone.",
		"When the filter matches nothing, the empty state offers the next step: search all scopes, or clear the filter.",
	],
	uses: ["page", "segmented", "data-table", "badge", "button", "empty-state"],
}

const MOBILE = breakpoint.phone

type Scope = "personal" | "workspace"
type Status = "confirmed" | "learned" | "outdated"
type Memory = { id: string; text: string; scope: Scope; source: string; used: string; status: Status }

const MEMORIES: Memory[] = [
	{
		id: "m-0412",
		text: "Prefers pnpm over npm in every repo",
		scope: "personal",
		source: "Thread: Set up the i18n repo",
		used: "2026-10-14",
		status: "confirmed",
	},
	{
		id: "m-0398",
		text: "Storage deploys on every push to main",
		scope: "workspace",
		source: "Thread: Ship storage v0.2",
		used: "2026-10-13",
		status: "confirmed",
	},
	{
		id: "m-0441",
		text: "Staging is gone; only local dev and production",
		scope: "workspace",
		source: "Thread: Drop staging",
		used: "2026-10-09",
		status: "learned",
	},
	{
		id: "m-0217",
		text: "Staging lives at staging.anyknown.com",
		scope: "workspace",
		source: "Thread: Set up staging",
		used: "2026-07-21",
		status: "outdated",
	},
	{
		id: "m-0455",
		text: "Writes plans without time estimates",
		scope: "personal",
		source: "You told it",
		used: "2026-10-12",
		status: "confirmed",
	},
	{
		id: "m-0463",
		text: "Wants interface copy in sentence case",
		scope: "personal",
		source: "Thread: Review the ui site",
		used: "2026-10-11",
		status: "learned",
	},
	{
		id: "m-0470",
		text: "The desktop app gets a new version when the API changes",
		scope: "workspace",
		source: "Thread: Fix desktop 0.5.1",
		used: "2026-10-15",
		status: "learned",
	},
	{
		id: "m-0156",
		text: "Rent cap is 25k a month",
		scope: "personal",
		source: "Thread: Compare flats",
		used: "2026-06-02",
		status: "outdated",
	},
	{
		id: "m-0331",
		text: "Call is the voice layer of the desktop app",
		scope: "workspace",
		source: "Thread: Plan voice",
		used: "2026-08-27",
		status: "confirmed",
	},
	{
		id: "m-0389",
		text: "Animations end with ease-out, never a bounce",
		scope: "personal",
		source: "You told it",
		used: "2026-09-30",
		status: "confirmed",
	},
]

// The tile shows the moment just before a bulk forget: a few rows, the two outdated ones picked.
const COMPACT_ROWS = ["m-0412", "m-0217", "m-0455", "m-0156", "m-0398", "m-0463", "m-0331"]
const COMPACT_SELECTED = ["m-0217", "m-0156"]

const SCOPES = [
	{ value: "all", label: "All" },
	{ value: "personal", label: "Personal" },
	{ value: "workspace", label: "Workspace" },
] as const
type ScopeFilter = (typeof SCOPES)[number]["value"]

const SCOPE_NAME: Record<Scope, string> = { personal: "Personal", workspace: "Workspace" }
const STATUS_NAME: Record<Status, string> = {
	confirmed: "Confirmed",
	learned: "Learned",
	outdated: "Out of date",
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const shortDate = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`

function StatusBadgeCell({ status }: { status: Status }) {
	if (status === "confirmed") return <Badge variant="success">{STATUS_NAME.confirmed}</Badge>
	if (status === "outdated") return <Badge dot="warning">{STATUS_NAME.outdated}</Badge>
	return <Badge>{STATUS_NAME.learned}</Badge>
}

function SearchIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ICON_STROKE}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
	)
}

const styles = stylex.create({
	body: {
		display: "flex",
		flexDirection: "column",
		// Two groups: the page head, then the table with its bulk strip. The strip's own height
		// already adds air above its text, so 16px reads as the step between groups.
		gap: space.md,
		paddingBlock: { default: space.lg, [MOBILE]: space.md },
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	compactBody: { paddingBlock: space.lg, paddingInline: space.lg },
	sub: { marginBlock: 0 },
	// The bulk strip belongs to the table under it.
	table: { display: "flex", flexDirection: "column", gap: space.xs },
	bulk: {
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		gap: space.xs,
		minHeight: space.xl,
		paddingBlock: space.xxs,
		borderRadius: corner.control,
		fontSize: type.t2,
		color: color.textMuted,
	},
	// Selected: a recessed strip, so the bulk action reads as a mode of the table, not a page button.
	bulkOn: {
		paddingInlineStart: space.sm,
		paddingInlineEnd: space.xxs,
		backgroundColor: color.surface,
		color: color.text,
	},
	bulkText: { flexGrow: 1, minWidth: 0 },
	wide: { display: { default: "contents", [MOBILE]: "none" } },
	muted: { color: color.textMuted },
})

export function Scene({ compact }: SceneProps) {
	const [memories, setMemories] = useState(() =>
		compact ? COMPACT_ROWS.flatMap((id) => MEMORIES.filter((memory) => memory.id === id)) : MEMORIES,
	)
	const [scope, setScope] = useState<ScopeFilter>("all")
	const [filter, setFilter] = useState("")
	const [sort, setSort] = useState<SortState>(compact ? null : { col: "used", dir: "desc" })
	const [selected, setSelected] = useState<Set<string>>(() => new Set(compact ? COMPACT_SELECTED : []))

	let firstId = ""
	const textOf = (id: string) => memories.find((memory) => memory.id === id)?.text ?? id

	const columns: DataTableColumn<Memory>[] = [
		{
			id: "text",
			header: "Memory",
			sortable: true,
			editable: true,
			value: (row) => row.text,
			onCommit: (row, next) =>
				setMemories((current) =>
					current.map((memory) =>
						memory.id === row.id ? { ...memory, text: next.trim(), status: "confirmed" } : memory,
					),
				),
		},
		{ id: "scope", header: "Scope", sortable: true, value: (row) => SCOPE_NAME[row.scope] },
		...(compact
			? []
			: [
					{
						id: "source",
						header: "Learned from",
						value: (row: Memory) => row.source,
						cell: (row: Memory) => <span {...stylex.props(styles.muted)}>{row.source}</span>,
					},
					{
						id: "used",
						header: "Last used",
						sortable: true,
						value: (row: Memory) => row.used,
						cell: (row: Memory) => shortDate(row.used),
					},
				]),
		{
			id: "status",
			header: "Status",
			sortable: true,
			value: (row) => STATUS_NAME[row.status],
			// Inspect labels the first row's badge only, not one label per row.
			cell: (row) =>
				row.id === firstId ? (
					<Part name="badge" inline>
						<StatusBadgeCell status={row.status} />
					</Part>
				) : (
					<StatusBadgeCell status={row.status} />
				),
		},
	]

	const inScope = memories.filter((memory) => scope === "all" || memory.scope === scope)
	const query = filter.trim().toLowerCase()
	const matched = inScope.filter((memory) =>
		[memory.text, memory.source].some((value) => value.toLowerCase().includes(query)),
	)
	const column = sort == null ? undefined : columns.find((c) => c.id === sort.col)
	const rows =
		sort == null || column?.value == null
			? matched
			: [...matched].sort((a, b) => {
					const result = (column.value?.(a) ?? "").localeCompare(column.value?.(b) ?? "")
					return sort.dir === "asc" ? result : -result
				})

	firstId = rows[0]?.id ?? ""
	const outdated = memories.filter((memory) => memory.status === "outdated").length
	const count = selected.size

	const forget = () => {
		const before = memories
		const gone = selected
		setMemories((current) => current.filter((memory) => !gone.has(memory.id)))
		setSelected(new Set())
		toast(gone.size === 1 ? "Forgot 1 memory" : `Forgot ${gone.size} memories`, {
			description: "The agent won't use them in new threads.",
			action: { label: "Undo", onClick: () => setMemories(before) },
		})
	}

	const kind = scope === "all" ? "" : `${SCOPE_NAME[scope].toLowerCase()} `

	return (
		<Sheet fill={compact}>
			<div {...stylex.props(styles.body, compact && styles.compactBody)}>
				<div>
					<Part name="page">
						<PageHead
							title="Memories"
							lead={
								<>
									<PageNumber>{memories.length}</PageNumber> kept
									{outdated > 0 && (
										<>
											{" · "}
											<PageNumber>{outdated}</PageNumber> out of date
										</>
									)}
								</>
							}
							actions={
								<Part name="segmented" inline>
									<Segmented label="Scope" value={scope} onValueChange={setScope} options={[...SCOPES]} />
								</Part>
							}
						/>
						{!compact && (
							<PageSub sx={styles.sub}>
								The agent reads these at the start of every thread. Double-click a memory to fix it.
							</PageSub>
						)}
					</Part>
				</div>
				<div {...stylex.props(styles.table)}>
					<div {...stylex.props(styles.bulk, count > 0 && styles.bulkOn)}>
						<span aria-live="polite" {...stylex.props(styles.bulkText)}>
							{count === 0 ? "Select memories to forget them together." : `${count} selected`}
						</span>
						{count > 0 && (
							<>
								{/* On a phone the header checkbox clears; the row keeps room for the action. */}
								<span {...stylex.props(styles.wide)}>
									<Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
										Clear selection
									</Button>
								</span>
								<Part name="button" inline>
									<Button variant="dangerGhost" size="sm" onClick={forget}>
										{count === 1 ? "Forget 1 memory" : `Forget ${count} memories`}
									</Button>
								</Part>
							</>
						)}
					</div>
					<Part name="data-table">
						<DataTable
							label="Memories"
							rows={rows}
							total={inScope.length}
							rowKey={(row) => row.id}
							columns={columns}
							filter={filter}
							onFilterChange={compact ? undefined : setFilter}
							sort={sort}
							onSortChange={setSort}
							selected={selected}
							onSelectedChange={setSelected}
							maxHeight={compact ? "40rem" : "26rem"}
							labels={{
								filterPlaceholder: "Filter memories",
								count: (shown, total) => `${shown} of ${total}`,
								select: (id) => `Select “${textOf(id)}”`,
								selectAll: "Select all shown",
								edit: (header, id) => `Edit ${header.toLowerCase()} “${textOf(id)}”`,
							}}
							emptyState={(text) => (
								<Part name="empty-state">
									<EmptyState
										icon={<SearchIcon />}
										title={text === "" ? `No ${kind}memories` : `No ${kind}memory matches “${text}”`}
										description={
											scope !== "all"
												? `It may be kept under ${scope === "personal" ? "Workspace" : "Personal"}.`
												: text === ""
													? "Memories show up here as the agent learns them."
													: "Try a shorter word, or clear the filter to see every memory."
										}
										action={
											scope !== "all" ? (
												<Button variant="secondary" size="sm" onClick={() => setScope("all")}>
													Search all scopes
												</Button>
											) : text === "" ? undefined : (
												<Button variant="secondary" size="sm" onClick={() => setFilter("")}>
													Clear filter
												</Button>
											)
										}
									/>
								</Part>
							)}
						/>
					</Part>
				</div>
			</div>
		</Sheet>
	)
}
