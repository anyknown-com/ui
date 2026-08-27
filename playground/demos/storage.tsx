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
} from "@anyknown/ui"
import { useMemo, useState } from "react"
import { Demo } from "../shell"

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

type Entry = { key: string; zh: string; en: string; status: "ok" | "missing" | "review" }

const ENTRIES: Entry[] = [
	{ key: "nav.projects", zh: "專案", en: "Projects", status: "ok" },
	{ key: "nav.settings", zh: "", en: "Settings", status: "missing" },
	{ key: "thread.handoff", zh: "換班", en: "Handoff", status: "review" },
	{ key: "thread.retry", zh: "重試", en: "Retry", status: "ok" },
]

const FILES = [
	{ kind: "folder" as const, name: "稅務文件", mtime: "8月20日" },
	{ kind: "file" as const, name: "護照掃描.pdf", size: 2_400_000, mtime: "8月26日" },
	{ kind: "file" as const, name: "全家合照-2025.jpg", size: 11_800_000, mtime: "8月12日" },
]

function ActionIcon({ d }: { d: string }) {
	return (
		<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d={d} />
		</svg>
	)
}

export function StorageDemos() {
	const [passphrase, setPassphrase] = useState("")
	const [ack, setAck] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
	const [jobs, setJobs] = useState<UploadJob[]>([
		{ id: "1", name: "護照掃描.pdf", size: 2_400_000, state: "uploading", progress: 45 },
		{
			id: "2",
			name: "raw-video.mov",
			size: 40_000_000,
			state: "failed",
			error: "超過 10 MB 上限,沒有上傳。",
		},
	])
	const [filter, setFilter] = useState("")
	const [sort, setSort] = useState<SortState>(null)
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

	const columns: DataTableColumn<Entry>[] = [
		{ id: "key", header: "key", mono: true, sortable: true, value: (row) => row.key },
		{ id: "zh", header: "zh-TW", sortable: true, editable: true, value: (row) => row.zh },
		{ id: "en", header: "en", sortable: true, editable: true, value: (row) => row.en },
		{
			id: "status",
			header: "狀態",
			sortable: true,
			value: (row) => row.status,
			cell: (row) => (
				<Badge variant={row.status === "ok" ? "accent" : row.status === "missing" ? "danger" : "neutral"}>
					{row.status}
				</Badge>
			),
		},
	]

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
	}, [filter, sort])

	return (
		<>
			<Demo id="password-input" title="password-input">
				<Field label="Vault passphrase" help="passphrase 無法找回,忘了就只能靠復原金鑰。">
					<PasswordInput
						meter
						value={passphrase}
						onValueChange={setPassphrase}
						placeholder="至少 12 個字元"
					/>
				</Field>
				<Field label="再輸入一次 passphrase">
					<PasswordInput confirmOf={passphrase} />
				</Field>
			</Demo>

			<Demo id="recovery-key" title="recovery-key" note="預設模糊,hover 或點一下顯示。">
				<RecoveryKey value="K7PQ-WM2X-9RDF-H4TN-ZC8B-JE6V-A3YS-UG5L" ack={ack} onAckChange={setAck} />
			</Demo>

			<Demo id="dropzone" title="dropzone" note="dragover 時虛線蟻行,像把檔案縫進 vault。">
				<Dropzone
					maxSize={10 * 1024 * 1024}
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
								error: "超過 10 MB 上限,沒有上傳。",
							})),
						])
					}
				/>
				<UploadList
					jobs={jobs}
					onCancel={(id) => setJobs((current) => current.filter((job) => job.id !== id))}
				/>
			</Demo>

			<Demo id="file-row" title="file-row" note="hover 或選取才顯示 checkbox 與動作。">
				<FileList label="檔案">
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
							actions={
								item.kind === "folder"
									? [
											{
												icon: <ActionIcon d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />,
												label: `改名 ${item.name}`,
												onAction: () => {},
											},
											{
												icon: <ActionIcon d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />,
												label: `刪除 ${item.name}`,
												onAction: () => {},
											},
										]
									: [
											{
												icon: <ActionIcon d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />,
												label: `下載 ${item.name}`,
												onAction: () => {},
											},
											{
												icon: <ActionIcon d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />,
												label: `改名 ${item.name}`,
												onAction: () => {},
											},
											{
												icon: <ActionIcon d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />,
												label: `刪除 ${item.name}`,
												onAction: () => {},
											},
										]
							}
						/>
					))}
				</FileList>
				<FileList label="處理中">
					<FileRow item={{ kind: "file", name: "raw-video.mov" }} state="encrypting" />
					<FileRow item={{ kind: "file", name: "合約.pdf" }} state="uploading" progress={62} />
				</FileList>
			</Demo>

			<Demo id="diff-viewer" title="diff-viewer">
				<DiffViewer
					file={{ path: "apps/desktop/src/memory/memory-panel.tsx", before: BEFORE, after: AFTER }}
					collapseContext={3}
				/>
			</Demo>

			<Demo id="data-table" title="data-table" note="欄頭排序、即時過濾、雙擊儲存格編輯。">
				<DataTable
					label="字典"
					rows={rows}
					rowKey={(row) => row.key}
					columns={columns}
					filter={filter}
					onFilterChange={setFilter}
					filterPlaceholder="過濾 key 或譯文"
					sort={sort}
					onSortChange={setSort}
					selected={selectedKeys}
					onSelectedChange={setSelectedKeys}
					onClearFilter={() => setFilter("")}
					countLabel={(shown, total) => `${shown} / ${total} keys`}
				/>
			</Demo>
		</>
	)
}
