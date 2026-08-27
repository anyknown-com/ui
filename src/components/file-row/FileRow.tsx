import * as stylex from "@stylexjs/stylex"
import type { KeyboardEvent, ReactNode } from "react"
import { formatBytes } from "../../lib/format"
import { color, font, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const spin = stylex.keyframes({ to: { rotate: "360deg" } })

const styles = stylex.create({
	list: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		overflow: "hidden",
	},
	row: {
		display: "grid",
		gridTemplateColumns: "2rem 1.5rem minmax(0, 1fr) 5.5rem 6.5rem 4.6rem",
		alignItems: "center",
		gap: space.xxs,
		height: "2.6rem",
		paddingInline: space.xxs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		fontFamily: font.body,
		fontSize: text.sm,
		color: color.text,
		cursor: "default",
		userSelect: "none",
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		"--ak-row-affordance": { default: "0", ":hover": "1", ":focus-within": "1" },
		":last-child": { borderBottomWidth: 0 },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	selected: { backgroundColor: color.accentSubtle, "--ak-row-affordance": "1" },
	busy: { color: color.textMuted, cursor: "progress" },
	checkCell: { display: "grid", placeItems: "center" },
	check: {
		justifySelf: "center",
		width: "1rem",
		height: "1rem",
		margin: 0,
		accentColor: color.accent,
		opacity: { default: "var(--ak-row-affordance, 0)", ":focus-visible": 1 },
	},
	icon: { color: color.textMuted },
	folderIcon: { color: color.accent },
	name: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	size: {
		fontFamily: font.mono,
		fontSize: "0.78rem",
		lineHeight: 1,
		fontVariantNumeric: "tabular-nums",
		color: color.textMuted,
		textAlign: "end",
	},
	mtime: { fontSize: "0.78rem", color: color.textMuted },
	actions: {
		display: "flex",
		justifyContent: "end",
		gap: "0.15rem",
		opacity: { default: "var(--ak-row-affordance, 0)", ":focus-within": 1 },
	},
	action: {
		all: "unset",
		cursor: "pointer",
		width: "1.6rem",
		height: "1.6rem",
		display: "grid",
		placeItems: "center",
		borderRadius: radius.sm,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.surface },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
	},
	count: {
		fontFamily: font.body,
		fontSize: "0.78rem",
		color: color.textMuted,
		margin: 0,
		marginTop: space.xxs,
	},
	busyCell: {
		gridColumn: "4 / 7",
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		fontSize: "0.75rem",
	},
	track: {
		flex: 1,
		height: "0.2rem",
		borderRadius: radius.full,
		backgroundColor: color.border,
		overflow: "hidden",
	},
	fill: (percent: number) => ({ width: `${percent}%` }),
	bar: { display: "block", height: "100%", backgroundColor: color.accent },
	spinner: {
		width: 12,
		height: 12,
		flex: "none",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: color.border,
		borderTopColor: color.accent,
		borderRadius: radius.full,
		animationName: { default: spin, [REDUCED]: "none" },
		animationDuration: "1.2s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
})

function FolderIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			aria-hidden="true"
			{...stylex.props(styles.icon, styles.folderIcon)}
		>
			<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
		</svg>
	)
}

function FileIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			aria-hidden="true"
			{...stylex.props(styles.icon)}
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
			<path d="M14 2v6h6M8 13h8M8 17h5" />
		</svg>
	)
}

export type FileItem = {
	kind: "file" | "folder"
	name: string
	size?: number
	mtime?: string
	mime?: string
}

export type FileRowAction = {
	icon: ReactNode
	label: string
	onAction: () => void
}

export type FileRowProps = {
	item: FileItem
	selected?: boolean
	onSelectChange?: (selected: boolean) => void
	onOpen?: () => void
	actions?: FileRowAction[]
	state?: "idle" | "encrypting" | "uploading"
	progress?: number
	icon?: ReactNode
	selectLabel?: (name: string) => string
}

export function FileRow({
	item,
	selected = false,
	onSelectChange,
	onOpen,
	actions = [],
	state = "idle",
	progress = 0,
	icon,
	selectLabel = (name) => `選取 ${name}`,
}: FileRowProps) {
	const busy = state !== "idle"

	function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		// Only the row's own keys; anything bubbling from the checkbox or an
		// action button belongs to that control.
		if (busy || event.target !== event.currentTarget) return
		if (event.key === " ") {
			event.preventDefault()
			onSelectChange?.(!selected)
		} else if (event.key === "Enter") {
			event.preventDefault()
			onOpen?.()
		}
	}

	if (busy) {
		return (
			<div role="row" aria-busy="true" {...stylex.props(styles.row, styles.busy)}>
				<span role="gridcell" />
				<span role="gridcell">{icon ?? (item.kind === "folder" ? <FolderIcon /> : <FileIcon />)}</span>
				<span role="gridcell" {...stylex.props(styles.name)}>
					{item.name}
				</span>
				<span role="gridcell" {...stylex.props(styles.busyCell)}>
					{state === "encrypting" ? (
						<>
							<span aria-hidden="true" {...stylex.props(styles.spinner)} />
							加密中
						</>
					) : (
						<>
							<span
								role="progressbar"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={Math.round(progress)}
								aria-valuetext={`${item.name} 上傳中 ${Math.round(progress)}%`}
								{...stylex.props(styles.track)}
							>
								<b {...stylex.props(styles.bar, styles.fill(progress))} />
							</span>
							{`${Math.round(progress)}%`}
						</>
					)}
				</span>
				<span role="gridcell" />
			</div>
		)
	}

	return (
		<div
			role="row"
			tabIndex={0}
			aria-selected={selected}
			onClick={() => onSelectChange?.(!selected)}
			onDoubleClick={() => onOpen?.()}
			onKeyDown={onKeyDown}
			{...stylex.props(styles.row, selected && styles.selected)}
		>
			<span role="gridcell" {...stylex.props(styles.checkCell)}>
				<input
					type="checkbox"
					checked={selected}
					aria-label={selectLabel(item.name)}
					onClick={(event) => event.stopPropagation()}
					onChange={(event) => onSelectChange?.(event.currentTarget.checked)}
					{...stylex.props(styles.check)}
				/>
			</span>
			<span role="gridcell">{icon ?? (item.kind === "folder" ? <FolderIcon /> : <FileIcon />)}</span>
			<span role="gridcell" {...stylex.props(styles.name)}>
				{item.name}
			</span>
			<span role="gridcell" {...stylex.props(styles.size)}>
				{item.kind === "folder" || item.size == null ? "—" : formatBytes(item.size)}
			</span>
			<span role="gridcell" {...stylex.props(styles.mtime)}>
				{item.mtime ?? ""}
			</span>
			<span role="gridcell" {...stylex.props(styles.actions)}>
				{actions.map((action) => (
					<button
						key={action.label}
						type="button"
						aria-label={action.label}
						onClick={(event) => {
							event.stopPropagation()
							action.onAction()
						}}
						{...stylex.props(styles.action)}
					>
						{action.icon}
					</button>
				))}
			</span>
		</div>
	)
}

export type FileListProps = {
	label: string
	selectedCount?: number
	selectedLabel?: (count: number) => string
	children: ReactNode
}

export function FileList({
	label,
	selectedCount,
	selectedLabel = (count) => `已選取 ${count} 個項目`,
	children,
}: FileListProps) {
	return (
		<>
			<div role="grid" aria-label={label} aria-multiselectable="true" {...stylex.props(styles.list)}>
				{children}
			</div>
			{selectedCount != null && (
				<p aria-live="polite" {...stylex.props(styles.count)}>
					{selectedCount > 0 ? selectedLabel(selectedCount) : ""}
				</p>
			)}
		</>
	)
}
