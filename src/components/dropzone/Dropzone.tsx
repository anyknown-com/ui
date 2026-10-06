import * as stylex from "@stylexjs/stylex"
import { type DragEvent, type ReactNode, useRef, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { press, reset } from "../../lib/styled"
import { formatBytes } from "../../lib/format"
import { color, corner, font, motion, shadow, space, tone, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const sew = stylex.keyframes({ to: { strokeDashoffset: -13 } })

const styles = stylex.create({
	zone: {
		position: "relative",
		display: "grid",
		justifyItems: "center",
		gap: space.xs,
		borderRadius: corner.card,
		paddingBlock: space.xl,
		paddingInline: space.lg,
		textAlign: "center",
		fontFamily: font.body,
		backgroundColor: color.surface,
		transitionProperty: "background-color",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	over: { backgroundColor: color.accentSubtle },
	disabled: { opacity: 0.5, cursor: "not-allowed" },
	stitch: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" },
	// The stitch runs 1.5px inside the zone, so its corner is the zone's less that.
	seam: {
		rx: `calc(${corner.card} - 1.5px)`,
		fill: "none",
		stroke: color.borderStrong,
		strokeWidth: 2,
		strokeDasharray: "7 6",
		transitionProperty: "stroke",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	seamOver: {
		stroke: color.accent,
		animationName: { default: sew, [REDUCED]: "none" },
		animationDuration: "0.5s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	icon: {
		color: color.textFaint,
		transitionProperty: "color",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	iconOver: { color: color.text },
	title: { margin: 0, fontSize: type.t2, color: color.text },
	hint: { color: color.textMuted, fontSize: type.t2 },
	pick: {
		backgroundColor: { default: color.accentSubtle, ":hover": color.layer5 },
		borderWidth: 0,
		borderRadius: corner.pill,
		color: color.text,
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: 1,
		paddingBlock: space.xs,
		paddingInline: space.md,
		cursor: "pointer",
		marginTop: space.xxs,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 1,
	},
	hiddenInput: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	jobs: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		borderRadius: corner.card,
		backgroundColor: tone.railLayer2,
		boxShadow: shadow.rest,
		overflow: "hidden",
		fontFamily: font.body,
	},
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	job: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		gap: `${space.xxs} ${space.xs}`,
		paddingBlock: space.xs,
		paddingInline: space.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		fontSize: type.t2,
		color: color.text,
		":last-child": { borderBottomWidth: 0 },
	},
	jobError: { backgroundColor: color.dangerSubtle },
	name: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	cancel: {
		cursor: "pointer",
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		width: "1.4rem",
		height: "1.4rem",
		display: "grid",
		placeItems: "center",
		borderRadius: corner.small,
		justifySelf: "end",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
	},
	track: {
		gridColumn: "1 / -1",
		height: "0.25rem",
		borderRadius: corner.pill,
		backgroundColor: color.border,
		overflow: "hidden",
	},
	fill: (percent: number) => ({ width: `${percent}%` }),
	bar: {
		display: "block",
		height: "100%",
		backgroundColor: color.accent,
		borderRadius: corner.pill,
		transitionProperty: "width",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: "linear",
	},
	status: { gridColumn: "1 / -1", fontSize: type.t2, color: color.textMuted },
	statusError: { color: color.danger },
})

function UploadIcon({ over }: { over: boolean }) {
	return (
		<svg
			width="30"
			height="30"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			aria-hidden="true"
			{...stylex.props(styles.icon, over && styles.iconOver)}
		>
			<path d="M4 16.2A4.5 4.5 0 0 1 6.6 8a6 6 0 0 1 11.6 1.6A4 4 0 0 1 18 17" />
			<path d="M12 12v9m0-9 3.5 3.5M12 12l-3.5 3.5" />
		</svg>
	)
}

function isFileDrag(event: DragEvent) {
	return Array.from(event.dataTransfer?.types ?? []).includes("Files")
}

const strings = defineStrings({
	"zh-TW": {
		title: "把檔案拖到這裡上傳",
		hint: "加密在你的裝置上完成,才會離開瀏覽器。",
		pick: "選擇檔案",
		uploads: "上傳中的檔案",
		cancel: (name: string) => `取消上傳 ${name}`,
		queued: "排隊中",
		encrypting: "加密中",
		uploading: "上傳中",
		done: "完成",
		failed: "失敗",
		// 唸給螢幕閱讀器的一句:檔名接狀態;狀態字當一句話唸時要句尾
		announce: (name: string, status: string) => `${name}:${status}`,
		sentence: (status: string) => `${status}。`,
		failure: "上傳失敗。再試一次，或換一個檔案。",
		tooBig: (limit: string) => `超過 ${limit} 上限，沒有上傳。換一個小於 ${limit} 的檔案。`,
	},
	en: {
		title: "Drop files here to upload",
		hint: "Files are encrypted on your device before they leave the browser.",
		pick: "Choose files",
		uploads: "Uploads",
		cancel: (name: string) => `Cancel upload of ${name}`,
		queued: "Queued",
		encrypting: "Encrypting",
		uploading: "Uploading",
		done: "Done",
		failed: "Failed",
		announce: (name: string, status: string) => `${name}: ${status}`,
		sentence: (status: string) => `${status}.`,
		failure: "Upload failed. Try again, or pick another file.",
		tooBig: (limit: string) => `Over the ${limit} limit, so it was not uploaded. Pick a file under ${limit}.`,
	},
})

/** Dropzone's and UploadList's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type DropzoneLabels = StringsOf<typeof strings>

/** A file turned away, and why: over `maxSize`, outside `accept`, or a second file when `multiple` is off. */
export type Rejection = { file: File; reason: "size" | "type" | "count" }

export type DropzoneProps = {
	/** The files that passed the checks, from a drop or the picker. */
	onFiles: (files: File[]) => void
	/** The files that did not pass, each with its reason. */
	onReject?: (rejections: Rejection[]) => void
	/** The largest file accepted, in bytes. @default Infinity */
	maxSize?: number
	/** More than one file per drop or pick. @default true */
	multiple?: boolean
	/** Like the input's `accept`: `.pdf`, `image/*`, `application/zip`, comma-separated. Also enforced on drops. */
	accept?: string
	/** Ignores drops and disables the picker. */
	disabled?: boolean
	/** The headline; defaults to the locale's "drop files here". */
	title?: ReactNode
	/** The smaller line under it; defaults to the locale's encryption note. */
	hint?: ReactNode
	/** The picker button's text; defaults to the locale's "choose files". */
	pickLabel?: string
	/** Override built-in words for this zone; the rest follow `<LocaleProvider>`. */
	labels?: Partial<DropzoneLabels>
	/** Replaces the title and hint. */
	children?: ReactNode
}

/**
 * A place to drop files, with a real "choose files" button so dragging is never the only way
 * in. `accept`, `maxSize` and `multiple` are checked on drops too.
 */
export function Dropzone({
	onFiles,
	onReject,
	maxSize = Number.POSITIVE_INFINITY,
	multiple = true,
	accept,
	disabled = false,
	title,
	hint,
	pickLabel,
	labels,
	children,
}: DropzoneProps) {
	const t = useStrings(strings, labels)
	const input = useRef<HTMLInputElement>(null)
	const depth = useRef(0)
	const [over, setOver] = useState(false)

	function matchesAccept(file: File) {
		if (!accept) return true
		return accept
			.split(",")
			.map((pattern) => pattern.trim().toLowerCase())
			.filter(Boolean)
			.some((pattern) => {
				if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern)
				if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1))
				return file.type === pattern
			})
	}

	// Drops bypass the input's own `accept`/`multiple`, so both are enforced here.
	function accepted(files: File[]) {
		const passed: File[] = []
		const rejected: Rejection[] = []
		for (const file of files) {
			if (file.size > maxSize) rejected.push({ file, reason: "size" })
			else if (!matchesAccept(file)) rejected.push({ file, reason: "type" })
			else if (!multiple && passed.length === 1) rejected.push({ file, reason: "count" })
			else passed.push(file)
		}
		if (passed.length > 0) onFiles(passed)
		if (rejected.length > 0) onReject?.(rejected)
	}

	return (
		<div
			onDragEnter={(event) => {
				if (!isFileDrag(event)) return
				event.preventDefault()
				if (disabled) return
				depth.current += 1
				setOver(true)
			}}
			onDragOver={(event) => {
				if (!isFileDrag(event)) return
				// Always prevented: without it the browser handles the drop itself and
				// navigates the window to the file, taking the app's state with it.
				event.preventDefault()
				event.dataTransfer.dropEffect = disabled ? "none" : "copy"
			}}
			onDragLeave={(event) => {
				if (!isFileDrag(event)) return
				depth.current = Math.max(0, depth.current - 1)
				if (depth.current === 0) setOver(false)
			}}
			onDrop={(event) => {
				if (!isFileDrag(event)) return
				event.preventDefault()
				depth.current = 0
				setOver(false)
				if (disabled) return
				accepted(Array.from(event.dataTransfer.files))
			}}
			{...stylex.props(styles.zone, over && styles.over, disabled && styles.disabled)}
		>
			<svg aria-hidden="true" {...stylex.props(styles.stitch)}>
				<rect
					x="1.5"
					y="1.5"
					width="calc(100% - 3px)"
					height="calc(100% - 3px)"
					{...stylex.props(styles.seam, over && styles.seamOver)}
				/>
			</svg>
			<UploadIcon over={over} />
			{children ?? (
				<>
					<p {...stylex.props(styles.title)}>{title ?? t.title}</p>
					<small {...stylex.props(styles.hint)}>{hint ?? t.hint}</small>
				</>
			)}
			<button
				type="button"
				disabled={disabled}
				onClick={() => input.current?.click()}
				{...stylex.props(styles.pick, press.button)}
			>
				{pickLabel ?? t.pick}
			</button>
			<input
				ref={input}
				type="file"
				aria-hidden="true"
				tabIndex={-1}
				multiple={multiple}
				accept={accept}
				disabled={disabled}
				onChange={(event) => {
					accepted(Array.from(event.currentTarget.files ?? []))
					event.currentTarget.value = ""
				}}
				{...stylex.props(styles.hiddenInput)}
			/>
		</div>
	)
}

export type UploadJob = {
	/** Unique among the jobs; what `onCancel` gets. */
	id: string
	/** The file's name. */
	name: string
	/** Bytes. */
	size: number
	/** Where the job is; `failed` shows the reason in danger. */
	state: "queued" | "encrypting" | "uploading" | "done" | "failed"
	/** 0–100; given, a progress bar is drawn. */
	progress?: number
	/** Why it failed, in words; replaces the default copy. */
	error?: string
	/** On a job turned away for its size: the byte limit it went over (the Dropzone's `maxSize`). */
	limit?: number
}

export type UploadListProps = {
	/** The jobs, in order. */
	jobs: UploadJob[]
	/** Shows a cancel button on every job not yet done. */
	onCancel?: (id: string) => void
	/** The list's accessible name; defaults to the locale's "uploads". */
	label?: string
	/** Override built-in words for this list; the rest follow `<LocaleProvider>`. */
	labels?: Partial<DropzoneLabels>
}

function failure(job: UploadJob, t: DropzoneLabels) {
	if (job.error != null) return job.error
	if (job.limit == null) return t.failure
	return t.tooBig(formatBytes(job.limit))
}

/** The uploads under a `Dropzone`: one line each with its state and progress, announced politely. */
export function UploadList({ jobs, onCancel, label, labels }: UploadListProps) {
	const t = useStrings(strings, labels)
	return (
		<>
			{/* 只唸狀態字。live region 包住整張清單的話,裡面的取消鈕在 modal 開著時也還露在外面 */}
			<p role="status" {...stylex.props(styles.srOnly)}>
				{jobs.map((job) => (
					<span key={job.id}>
						{t.announce(job.name, job.state === "failed" ? failure(job, t) : t.sentence(t[job.state]))}
					</span>
				))}
			</p>
			<ul aria-label={label ?? t.uploads} {...stylex.props(styles.jobs, jobs.length === 0 && styles.srOnly)}>
				{jobs.map((job) => {
					const failed = job.state === "failed"
					return (
						<li key={job.id} {...stylex.props(styles.job, failed && styles.jobError)}>
							<span {...stylex.props(styles.name)}>{job.name}</span>
							{onCancel != null && job.state !== "done" && (
								<button
									type="button"
									aria-label={t.cancel(job.name)}
									onClick={() => onCancel(job.id)}
									{...stylex.props(reset.control, styles.cancel)}
								>
									✕
								</button>
							)}
							{!failed && job.progress != null && (
								<div
									role="progressbar"
									aria-valuemin={0}
									aria-valuemax={100}
									aria-valuenow={Math.round(job.progress)}
									aria-label={job.name}
									aria-valuetext={`${job.name} ${t[job.state]} ${Math.round(job.progress)}%`}
									{...stylex.props(styles.track)}
								>
									<b {...stylex.props(styles.bar, styles.fill(job.progress))} />
								</div>
							)}
							<span {...stylex.props(styles.status, failed && styles.statusError)}>
								{failed ? failure(job, t) : `${t[job.state]} · ${formatBytes(job.size)}`}
							</span>
						</li>
					)
				})}
			</ul>
		</>
	)
}
