import {
	Badge,
	DataTable,
	type DataTableColumn,
	DiffViewer,
	Dropzone,
	Field,
	FileList,
	FileRow,
	PasswordInput,
	RecoveryKey,
	type SortState,
	UploadList,
	type UploadJob,
	ICON_STROKE,
} from "@anyknown/ui"
import { useMemo, useState } from "react"
import { type DemoEntry, Demo } from "../shell"

const BEFORE = `import { useSyncExternalStore } from "react";
import { capacityStore } from "./memory-capacity-store";

const TIERS = ["ok", "warn", "over"] as const;

export function MemoryPanel() {
  const files = useSyncExternalStore(
    capacityStore.subscribe,
    capacityStore.get,
  );

  return files.map((f) => (
    <CapacityRow key={f.name}>
      <Meter value={f.size} max={f.capacity} tone="gray" />
      <span>{f.size} bytes</span>
    </CapacityRow>
  ));
}
`

const AFTER = `import { useSyncExternalStore } from "react";
import { capacityStore } from "./memory-capacity-store";

const TIERS = ["ok", "warn", "over"] as const;

export function MemoryPanel() {
  const files = useSyncExternalStore(
    capacityStore.subscribe,
    capacityStore.get,
  );

  return files.map((f) => (
    <CapacityRow key={f.name}>
      <Meter value={f.size} max={f.capacity} tone={tierOf(f)} />
      <span>{f.size}/{f.capacity}</span>
      {f.error && <IndexError text={f.error} />}
    </CapacityRow>
  ));
}
`

const MAX_UPLOAD = 10 * 1024 * 1024

type Entry = { key: string; memory: string; scope: string; status: "current" | "stale" | "review" }

const ENTRIES: Entry[] = [
	{ key: "mem.deploy", memory: "Deploys to Cloudflare", scope: "workspace", status: "current" },
	{ key: "mem.pkg", memory: "Prefers pnpm", scope: "personal", status: "current" },
	{ key: "mem.rent", memory: "Rent cap is 25k", scope: "personal", status: "stale" },
	{ key: "mem.release", memory: "Desktop ships first", scope: "workspace", status: "review" },
]

const FILES = [
	{ kind: "folder" as const, name: "Tax documents", mtime: "Aug 20" },
	{ kind: "file" as const, name: "passport-scan.pdf", size: 2_400_000, mtime: "Aug 26" },
	{ kind: "file" as const, name: "family-photo-2025.jpg", size: 11_800_000, mtime: "Aug 12" },
]

function ActionIcon({ d }: { d: string }) {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ICON_STROKE}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d={d} />
		</svg>
	)
}

const RENAME = "M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"
const DELETE = "M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
const DOWNLOAD = "M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"

function PasswordInputDemo() {
	const [passphrase, setPassphrase] = useState("")

	return (
		<Demo
			id="password-input"
			title="password-input"
			note="With meter, the line under the bars states the 12-character minimum while empty, then the strength as you type. confirmOf flags a mismatch on the second field."
		>
			<Field
				label="Vault passphrase"
				help="Your passphrase can't be recovered. If you forget it, only your recovery key gets you back in."
			>
				<PasswordInput meter value={passphrase} onValueChange={setPassphrase} />
			</Field>
			<Field label="Enter the passphrase again">
				<PasswordInput confirmOf={passphrase} />
			</Field>
		</Demo>
	)
}

function RecoveryKeyDemo() {
	const [ack, setAck] = useState(false)

	return (
		<Demo id="recovery-key" title="recovery-key" note="Blurred by default; hover or click to reveal it.">
			<RecoveryKey value="K7PQ-WM2X-9RDF-H4TN-ZC8B-JE6V-A3YS-UG5L" ack={ack} onAckChange={setAck} />
		</Demo>
	)
}

function DropzoneDemo() {
	const [jobs, setJobs] = useState<UploadJob[]>([
		{ id: "1", name: "passport-scan.pdf", size: 2_400_000, state: "uploading", progress: 45 },
		{
			id: "2",
			name: "raw-video.mov",
			size: 40_000_000,
			state: "failed",
			limit: MAX_UPLOAD,
		},
	])

	return (
		<Demo
			id="dropzone"
			title="dropzone"
			note="While files are dragged over it, the dashed seam turns ink and starts marching (it holds still under reduced motion), the icon darkens and the zone shifts to a light grey. Files over 10 MB here are rejected and listed as failed with the limit."
		>
			<Dropzone
				maxSize={MAX_UPLOAD}
				onFiles={(files) =>
					setJobs((current) => [
						...current,
						...files.map((file, index) => ({
							id: `${Date.now()}-${index}`,
							name: file.name,
							size: file.size,
							state: "uploading" as const,
							progress: 12,
						})),
					])
				}
				onReject={(rejections) =>
					setJobs((current) => [
						...current,
						...rejections.map((rejection, index) => ({
							id: `r${Date.now()}-${index}`,
							name: rejection.file.name,
							size: rejection.file.size,
							state: "failed" as const,
							// Only oversized files name the limit; wrong type or count gets the generic failure line
							limit: rejection.reason === "size" ? MAX_UPLOAD : undefined,
						})),
					])
				}
			/>
			<UploadList
				jobs={jobs}
				onCancel={(id) => setJobs((current) => current.filter((job) => job.id !== id))}
			/>
		</Demo>
	)
}

function FileRowDemo() {
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

	return (
		<Demo id="file-row" title="file-row" note="The checkbox and actions show only on hover or when selected.">
			<FileList label="Files">
				{FILES.map((item) => (
					<FileRow
						key={item.name}
						item={item}
						selected={selectedFiles.has(item.name)}
						onSelectChange={(selected) =>
							setSelectedFiles((current) => {
								const next = new Set(current)
								if (selected) next.add(item.name)
								else next.delete(item.name)
								return next
							})
						}
						actions={[
							...(item.kind === "file"
								? [{ icon: <ActionIcon d={DOWNLOAD} />, label: `Download ${item.name}`, onAction: () => {} }]
								: []),
							{ icon: <ActionIcon d={RENAME} />, label: `Rename ${item.name}`, onAction: () => {} },
							{ icon: <ActionIcon d={DELETE} />, label: `Delete ${item.name}`, onAction: () => {} },
						]}
					/>
				))}
			</FileList>
			<FileList label="In progress">
				<FileRow item={{ kind: "file", name: "raw-video.mov" }} state="encrypting" />
				<FileRow item={{ kind: "file", name: "lease-agreement.pdf" }} state="uploading" progress={62} />
			</FileList>
		</Demo>
	)
}

function DiffViewerDemo() {
	return (
		<Demo id="diff-viewer" title="diff-viewer">
			<DiffViewer
				file={{ path: "apps/desktop/src/memory/memory-panel.tsx", before: BEFORE, after: AFTER }}
				collapseContext={3}
			/>
		</Demo>
	)
}

const COLUMNS: DataTableColumn<Entry>[] = [
	{ id: "key", header: "key", mono: true, sortable: true, value: (row) => row.key },
	{ id: "memory", header: "Memory", sortable: true, editable: true, value: (row) => row.memory },
	{ id: "scope", header: "Scope", sortable: true, editable: true, value: (row) => row.scope },
	{
		id: "status",
		header: "Status",
		sortable: true,
		value: (row) => row.status,
		cell: (row) => (
			<Badge variant={row.status === "current" ? "accent" : row.status === "stale" ? "danger" : "neutral"}>
				{row.status}
			</Badge>
		),
	},
]

function DataTableDemo() {
	const [filter, setFilter] = useState("")
	const [sort, setSort] = useState<SortState>(null)
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

	const rows = useMemo(() => {
		const query = filter.toLowerCase()
		const filtered = ENTRIES.filter((row) =>
			[row.key, row.memory, row.scope].some((value) => value.toLowerCase().includes(query)),
		)
		if (!sort) return filtered
		const column = COLUMNS.find((c) => c.id === sort.col)
		return [...filtered].sort((a, b) => {
			const result = (column?.value?.(a) ?? "").localeCompare(column?.value?.(b) ?? "")
			return sort.dir === "asc" ? result : -result
		})
	}, [filter, sort])

	return (
		<Demo
			id="data-table"
			title="data-table"
			note="Sort by a column header, filter as you type, double-click a cell to edit it."
		>
			<DataTable
				label="Memories"
				rows={rows}
				rowKey={(row) => row.key}
				columns={COLUMNS}
				filter={filter}
				onFilterChange={setFilter}
				filterPlaceholder="Filter by key, memory or scope"
				sort={sort}
				onSortChange={setSort}
				selected={selectedKeys}
				onSelectedChange={setSelectedKeys}
				onClearFilter={() => setFilter("")}
				countLabel={(shown, total) => `${shown} of ${total} memories`}
			/>
		</Demo>
	)
}

export const storageDemos: DemoEntry[] = [
	{ id: "password-input", covers: ["password-input"], Component: PasswordInputDemo },
	{ id: "recovery-key", covers: ["recovery-key"], Component: RecoveryKeyDemo },
	{ id: "dropzone", covers: ["dropzone"], Component: DropzoneDemo },
	{ id: "file-row", covers: ["file-row"], Component: FileRowDemo },
	{ id: "diff-viewer", covers: ["diff-viewer"], Component: DiffViewerDemo },
	{ id: "data-table", covers: ["data-table"], Component: DataTableDemo },
]
