import * as stylex from "@stylexjs/stylex"
import type { KeyboardEvent, ReactNode } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { reset } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { formatBytes } from "../../lib/format"
import { color, corner, focusRing, font, motion, shadow, space, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
// 觸控裝置沒有 hover:checkbox 與動作鈕一直顯示
const NO_HOVER = "@media (hover: none)"

const spin = stylex.keyframes({ to: { rotate: "360deg" } })

// 清單比這窄時,大小與時間排到檔名下面第二行,動作鈕跨兩行靠右,檔名才有位置
const NARROW = "@container (max-width: 30rem)"

const styles = stylex.create({
	// A rest card on the sheet: `surfaceRaised` (white in light, one step up in dark), the ring is
	// its only edge.
	list: {
		borderRadius: corner.card,
		backgroundColor: color.surfaceRaised,
		boxShadow: shadow.rest,
		overflow: "hidden",
		containerType: "inline-size",
	},
	row: {
		display: "grid",
		gridTemplateColumns: {
			default: "2rem 1.5rem minmax(0, 1fr) 5.5rem 6.5rem 4.6rem",
			[NARROW]: "2rem 1.5rem auto minmax(0, 1fr) auto",
		},
		alignItems: "center",
		columnGap: space.xxs,
		rowGap: { default: space.xxs, [NARROW]: 0 },
		height: { default: "2.6rem", [NARROW]: "auto" },
		paddingBlock: { default: 0, [NARROW]: space.xs },
		paddingInline: space.xxs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.text,
		cursor: "default",
		userSelect: "none",
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		"--ak-row-affordance": { default: "0", ":hover": "1", ":focus-within": "1", [NO_HOVER]: "1" },
		":last-child": { borderBottomWidth: 0 },
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	selected: { backgroundColor: color.accentSubtle, "--ak-row-affordance": "1" },
	busy: { color: color.textMuted, cursor: "progress" },
	checkCell: { display: "grid", placeItems: "center", gridRow: { default: "auto", [NARROW]: "1 / 3" } },
	iconCell: { gridRow: { default: "auto", [NARROW]: "1 / 3" } },
	// 方框 16px,外面包一層 24px 的 label 當可以按的範圍(WCAG 2.5.8)
	hit: {
		display: "grid",
		placeItems: "center",
		minWidth: "max(24px, 1.5rem)",
		minHeight: "max(24px, 1.5rem)",
		cursor: "pointer",
	},
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
	name: {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		gridColumn: { default: "auto", [NARROW]: "3 / 5" },
	},
	size: {
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: 1,
		fontVariantNumeric: "tabular-nums",
		color: color.textMuted,
		textAlign: { default: "end", [NARROW]: "start" },
		gridColumn: { default: "auto", [NARROW]: "3" },
		gridRow: { default: "auto", [NARROW]: "2" },
	},
	mtime: {
		fontSize: type.t1,
		color: color.textMuted,
		gridColumn: { default: "auto", [NARROW]: "4" },
		gridRow: { default: "auto", [NARROW]: "2" },
	},
	actions: {
		gridColumn: { default: "auto", [NARROW]: "5" },
		gridRow: { default: "auto", [NARROW]: "1 / 3" },
		display: "flex",
		justifyContent: "end",
		gap: "0.15rem",
		opacity: { default: "var(--ak-row-affordance, 0)", ":focus-within": 1 },
	},
	action: {
		cursor: "pointer",
		width: "1.6rem",
		height: "1.6rem",
		display: "grid",
		placeItems: "center",
		borderRadius: corner.small,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.surface },
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
	},
	count: {
		fontFamily: font.body,
		fontSize: type.t1,
		color: color.textMuted,
		margin: 0,
		marginTop: space.xxs,
	},
	busyCell: {
		gridColumn: { default: "4 / 7", [NARROW]: "3 / 6" },
		gridRow: { default: "auto", [NARROW]: "2" },
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		fontSize: type.t1,
	},
	track: {
		flex: 1,
		height: "0.2rem",
		borderRadius: corner.pill,
		backgroundColor: color.border,
		overflow: "hidden",
	},
	// 數字變動時寬度不跳:等寬數字,留得下「100%」
	percent: { flex: "none", fontVariantNumeric: "tabular-nums", minWidth: "4ch", textAlign: "end" },
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
		borderRadius: corner.pill,
		animationName: { default: spin, [REDUCED]: "none" },
		animationDuration: "1.2s",
		animationTimingFunction: motion.linear,
		animationIterationCount: "infinite",
	},
})

function FolderIcon() {
	return (
		<Glyph width={16} height={16} {...stylex.props(styles.icon, styles.folderIcon)}>
			<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
		</Glyph>
	)
}

function FileIcon() {
	return (
		<Glyph width={16} height={16} {...stylex.props(styles.icon)}>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
			<path d="M14 2v6h6M8 13h8M8 17h5" />
		</Glyph>
	)
}

const strings = defineStrings({
	"zh-TW": {
		select: (name: string) => `選取 ${name}`,
		encrypting: "加密中",
		uploading: (name: string, percent: number) => `${name} 上傳中 ${percent}%`,
		selected: (count: number) => `已選取 ${count} 個項目`,
	},
	en: {
		select: (name: string) => `Select ${name}`,
		encrypting: "Encrypting",
		uploading: (name: string, percent: number) => `Uploading ${name}, ${percent}%`,
		selected: (count: number) => `${count} selected`,
	},
})

/** FileRow's and FileList's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type FileRowLabels = StringsOf<typeof strings>

/** The file or folder a `FileRow` shows. */
export type FileItem = {
	/** A folder gets the folder glyph and no size. */
	kind: "file" | "folder"
	/** The file's name, truncated in the row with the full name on hover. */
	name: string
	/** Bytes; shown formatted (`1.2 MB`). */
	size?: number
	/** When it last changed, already formatted for reading. */
	mtime?: string
	/** The MIME type, for the caller's own use (icons, previews). */
	mime?: string
}

/** An icon button at the end of a `FileRow`. */
export type FileRowAction = {
	/** The glyph on the button. */
	icon: ReactNode
	/** The button's accessible name. */
	label: string
	/** Pressed; the row's own selection does not change. */
	onAction: () => void
}

export type FileRowProps = {
	/** The file or folder this row stands for. */
	item: FileItem
	/** Whether the row is selected, for a controlled row. Pair it with `onSelectedChange`. */
	selected?: boolean
	/** Whether the row starts selected, for an uncontrolled row. @default false */
	defaultSelected?: boolean
	/** Called with the next selection: a click on the row, its checkbox, or Space. */
	onSelectedChange?: (selected: boolean) => void
	/** @deprecated Use `onSelectedChange`; it is called with the same value. */
	onSelectChange?: (selected: boolean) => void
	/** Double-click or Enter: open the file or go into the folder. */
	onOpen?: () => void
	/** Buttons at the end of the row, shown on hover and focus (always on touch). */
	actions?: FileRowAction[]
	/** `encrypting` and `uploading` replace size, time and actions with progress. @default "idle" */
	state?: "idle" | "encrypting" | "uploading"
	/** Upload progress, 0–100, while `state` is `uploading`. @default 0 */
	progress?: number
	/** Replaces the file or folder glyph. */
	icon?: ReactNode
	/** Override built-in words for this row; the rest follow `<LocaleProvider>`. */
	labels?: Partial<FileRowLabels>
	/** @deprecated Use `labels={{ select }}`. */
	selectLabel?: (name: string) => string
}

/**
 * One file or folder in a `FileList` grid: a click (or Space) toggles selection, a
 * double-click (or Enter) opens it, its actions appear on hover and focus.
 */
export function FileRow({
	item,
	selected: selectedProp,
	defaultSelected = false,
	onSelectedChange,
	onSelectChange,
	onOpen,
	actions = [],
	state = "idle",
	progress = 0,
	icon,
	labels,
	selectLabel,
}: FileRowProps) {
	const t = useStrings(strings, { ...labels, ...(selectLabel !== undefined && { select: selectLabel }) })
	const busy = state !== "idle"
	const percent = Math.round(progress)
	const [selected, setSelected] = useControllableState(selectedProp, defaultSelected, (next: boolean) => {
		onSelectedChange?.(next)
		onSelectChange?.(next)
	})

	function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		// Only the row's own keys; anything bubbling from the checkbox or an
		// action button belongs to that control.
		if (busy || event.target !== event.currentTarget) return
		if (event.key === " ") {
			event.preventDefault()
			setSelected(!selected)
		} else if (event.key === "Enter") {
			event.preventDefault()
			onOpen?.()
		}
	}

	if (busy) {
		return (
			<div
				role="row"
				tabIndex={0}
				aria-busy="true"
				aria-selected={selected}
				{...stylex.props(styles.row, styles.busy)}
			>
				<span role="gridcell" aria-label={t.select(item.name)} {...stylex.props(styles.checkCell)} />
				<span role="gridcell" aria-hidden="true" {...stylex.props(styles.iconCell)}>
					{icon ?? (item.kind === "folder" ? <FolderIcon /> : <FileIcon />)}
				</span>
				<span role="gridcell" title={item.name} {...stylex.props(styles.name)}>
					{item.name}
				</span>
				<span role="gridcell" aria-colspan={3} {...stylex.props(styles.busyCell)}>
					{state === "encrypting" ? (
						<>
							<span aria-hidden="true" {...stylex.props(styles.spinner)} />
							{t.encrypting}
						</>
					) : (
						<>
							<span
								role="progressbar"
								aria-label={item.name}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={percent}
								aria-valuetext={t.uploading(item.name, percent)}
								{...stylex.props(styles.track)}
							>
								<b {...stylex.props(styles.bar, styles.fill(progress))} />
							</span>
							<span {...stylex.props(styles.percent)}>{`${percent}%`}</span>
						</>
					)}
				</span>
			</div>
		)
	}

	return (
		<div
			role="row"
			tabIndex={0}
			aria-selected={selected}
			onClick={(event) => {
				// The second click of a double-click must not undo the first's toggle.
				if (event.detail > 1) return
				// A click on the checkbox's label is the checkbox's own; it toggles through the input.
				if (event.target instanceof Element && event.target.closest("label")) return
				setSelected(!selected)
			}}
			onDoubleClick={() => onOpen?.()}
			onKeyDown={onKeyDown}
			{...stylex.props(styles.row, selected && styles.selected)}
		>
			<span role="gridcell" {...stylex.props(styles.checkCell)}>
				<label {...stylex.props(styles.hit)}>
					<input
						type="checkbox"
						checked={selected}
						aria-label={t.select(item.name)}
						onClick={(event) => event.stopPropagation()}
						onChange={(event) => setSelected(event.currentTarget.checked)}
						{...stylex.props(styles.check)}
					/>
				</label>
			</span>
			<span role="gridcell" aria-hidden="true" {...stylex.props(styles.iconCell)}>
				{icon ?? (item.kind === "folder" ? <FolderIcon /> : <FileIcon />)}
			</span>
			<span role="gridcell" title={item.name} {...stylex.props(styles.name)}>
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
						{...stylex.props(reset.control, styles.action)}
					>
						{action.icon}
					</button>
				))}
			</span>
		</div>
	)
}

export type FileListProps = {
	/** The grid's accessible name ("Files in Taxes"). */
	label: string
	/** How many rows are selected; given, a polite live line under the list says so. */
	selectedCount?: number
	/** Override built-in words for this list; the rest follow `<LocaleProvider>`. */
	labels?: Partial<FileRowLabels>
	/** @deprecated Use `labels={{ selected }}`. */
	selectedLabel?: (count: number) => string
	/** The `FileRow`s. */
	children: ReactNode
}

/** A multi-select grid of `FileRow`s on one rest card, with an optional live selection count. */
export function FileList({ label, selectedCount, labels, selectedLabel, children }: FileListProps) {
	const t = useStrings(strings, {
		...labels,
		...(selectedLabel !== undefined && { selected: selectedLabel }),
	})
	return (
		<>
			<div role="grid" aria-label={label} aria-multiselectable="true" {...stylex.props(styles.list)}>
				{children}
			</div>
			{selectedCount != null && (
				<p aria-live="polite" {...stylex.props(styles.count)}>
					{selectedCount > 0 ? t.selected(selectedCount) : ""}
				</p>
			)}
		</>
	)
}
