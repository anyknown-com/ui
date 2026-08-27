import * as stylex from "@stylexjs/stylex"
import { type DragEvent, type ReactNode, useId, useRef, useState } from "react"
import { formatBytes } from "../../lib/format"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const sew = stylex.keyframes({ to: { strokeDashoffset: -13 } })

const styles = stylex.create({
	zone: {
		position: "relative",
		display: "grid",
		justifyItems: "center",
		gap: space.xs,
		borderRadius: radius.lg,
		paddingBlock: space.xl,
		paddingInline: space.lg,
		textAlign: "center",
		fontFamily: font.body,
		backgroundColor: "transparent",
		transitionProperty: "background-color",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	over: { backgroundColor: color.accentSubtle },
	disabled: { opacity: 0.5, cursor: "not-allowed" },
	stitch: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" },
	seam: {
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
	iconOver: { color: color.accent },
	title: { margin: 0, fontSize: text.sm, color: color.text },
	hint: { color: color.textMuted, fontSize: "0.78rem" },
	pick: {
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: color.border, ":hover": color.borderStrong },
		borderRadius: radius.md,
		color: color.text,
		fontFamily: font.body,
		fontSize: "0.82rem",
		fontWeight: 500,
		lineHeight: 1,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
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
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		overflow: "hidden",
		fontFamily: font.body,
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
		fontSize: text.sm,
		color: color.text,
		":last-child": { borderBottomWidth: 0 },
	},
	jobError: { backgroundColor: color.dangerSubtle },
	name: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	cancel: {
		all: "unset",
		cursor: "pointer",
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		width: "1.4rem",
		height: "1.4rem",
		display: "grid",
		placeItems: "center",
		borderRadius: radius.sm,
		justifySelf: "end",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
	},
	track: {
		gridColumn: "1 / -1",
		height: "0.25rem",
		borderRadius: radius.full,
		backgroundColor: color.border,
		overflow: "hidden",
	},
	fill: (percent: number) => ({ width: `${percent}%` }),
	bar: {
		display: "block",
		height: "100%",
		backgroundColor: color.accent,
		borderRadius: radius.full,
		transitionProperty: "width",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: "linear",
	},
	status: { gridColumn: "1 / -1", fontSize: "0.75rem", color: color.textMuted },
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

export type Rejection = { file: File; reason: "size" }

export type DropzoneProps = {
	onFiles: (files: File[]) => void
	onReject?: (rejections: Rejection[]) => void
	maxSize?: number
	multiple?: boolean
	accept?: string
	disabled?: boolean
	title?: ReactNode
	hint?: ReactNode
	pickLabel?: string
	children?: ReactNode
}

export function Dropzone({
	onFiles,
	onReject,
	maxSize = Number.POSITIVE_INFINITY,
	multiple = true,
	accept,
	disabled = false,
	title = "把檔案拖到這裡上傳",
	hint = "加密在你的裝置上完成,才會離開瀏覽器。",
	pickLabel = "選擇檔案",
	children,
}: DropzoneProps) {
	const inputId = useId()
	const input = useRef<HTMLInputElement>(null)
	const depth = useRef(0)
	const [over, setOver] = useState(false)

	function accepted(files: File[]) {
		const passed = files.filter((file) => file.size <= maxSize)
		const rejected = files.filter((file) => file.size > maxSize)
		if (passed.length > 0) onFiles(passed)
		if (rejected.length > 0) onReject?.(rejected.map((file) => ({ file, reason: "size" as const })))
	}

	return (
		<div
			onDragEnter={(event) => {
				if (disabled || !isFileDrag(event)) return
				event.preventDefault()
				depth.current += 1
				setOver(true)
			}}
			onDragOver={(event) => {
				if (disabled || !isFileDrag(event)) return
				event.preventDefault()
				event.dataTransfer.dropEffect = "copy"
			}}
			onDragLeave={() => {
				depth.current = Math.max(0, depth.current - 1)
				if (depth.current === 0) setOver(false)
			}}
			onDrop={(event) => {
				if (disabled || !isFileDrag(event)) return
				event.preventDefault()
				depth.current = 0
				setOver(false)
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
					rx="11"
					{...stylex.props(styles.seam, over && styles.seamOver)}
				/>
			</svg>
			<UploadIcon over={over} />
			{children ?? (
				<>
					<p {...stylex.props(styles.title)}>{title}</p>
					<small {...stylex.props(styles.hint)}>{hint}</small>
				</>
			)}
			<button
				type="button"
				disabled={disabled}
				onClick={() => input.current?.click()}
				{...stylex.props(styles.pick)}
			>
				{pickLabel}
			</button>
			<input
				id={inputId}
				ref={input}
				type="file"
				tabIndex={-1}
				multiple={multiple}
				accept={accept}
				disabled={disabled}
				aria-label={pickLabel}
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
	id: string
	name: string
	size: number
	state: "queued" | "encrypting" | "uploading" | "done" | "failed"
	progress?: number
	error?: string
}

const JOB_STATE_LABEL: Record<UploadJob["state"], string> = {
	queued: "排隊中",
	encrypting: "加密中",
	uploading: "上傳中",
	done: "完成",
	failed: "失敗",
}

export type UploadListProps = {
	jobs: UploadJob[]
	onCancel?: (id: string) => void
	label?: string
}

export function UploadList({ jobs, onCancel, label = "上傳中的檔案" }: UploadListProps) {
	if (jobs.length === 0) return null
	return (
		<ul aria-live="polite" aria-label={label} {...stylex.props(styles.jobs)}>
			{jobs.map((job) => {
				const failed = job.state === "failed"
				return (
					<li key={job.id} {...stylex.props(styles.job, failed && styles.jobError)}>
						<span {...stylex.props(styles.name)}>{job.name}</span>
						{onCancel != null && job.state !== "done" && (
							<button
								type="button"
								aria-label={`取消上傳 ${job.name}`}
								onClick={() => onCancel(job.id)}
								{...stylex.props(styles.cancel)}
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
								aria-valuetext={`${job.name} ${JOB_STATE_LABEL[job.state]} ${Math.round(job.progress)}%`}
								{...stylex.props(styles.track)}
							>
								<b {...stylex.props(styles.bar, styles.fill(job.progress))} />
							</div>
						)}
						<span {...stylex.props(styles.status, failed && styles.statusError)}>
							{failed
								? (job.error ?? `超過上限(${formatBytes(job.size)}),沒有上傳。`)
								: `${JOB_STATE_LABEL[job.state]} · ${formatBytes(job.size)}`}
						</span>
					</li>
				)
			})}
		</ul>
	)
}
