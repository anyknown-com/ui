// A person hands the agent two leases and a floor plan. The run replays on a 100ms clock until the
// person touches anything; from then on the same state is theirs: drop real files, pick them with
// +, remove chips, send, and the agent answers about what it got.
import {
	AssistantMessage,
	AttachButton,
	AttachmentGrid,
	AttachmentTile,
	Composer,
	Dropzone,
	PendingFiles,
	Progress,
	TextPart,
	Thread,
	UserMessage,
	toast,
} from "@anyknown/ui"
import { breakpoint, color, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { Fragment, useCallback, useReducer, useRef, type DragEvent } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet, chat, startOnWholeTurn } from "./Sheet"

export const meta: SceneMeta = {
	id: "hand-over-files",
	title: "Hand over files",
	moment:
		"You drop a few files on the thread so the agent can read them. They wait in the composer until you send, then travel with your message.",
	decisions: [
		"The drop target only shows while something is being dragged; the rest of the time the thread is clean.",
		"Pending files sit in the composer, where you can still remove them before sending.",
		"Upload progress is blue because it is work in progress; it disappears when the files are in.",
		"Sent files become tiles above your message, so the message and what it carried read as one turn.",
		"The + button picks the same files as a drop, so dragging is never the only way in.",
	],
	uses: ["dropzone", "pending-files", "progress", "attach-button", "composer", "attachment", "message"],
}

const MOBILE = breakpoint.phone
const MB = 1024 * 1024
const MAX_SIZE = 25 * MB

type Upload = { id: string; name: string; size: number; sent: number; preview?: string }
type Turn = { id: string; files: Upload[]; text: string; reply: string[]; age: number }
type State = { t: number; auto: boolean; dragging: boolean; pending: Upload[]; draft: string; turns: Turn[] }
type Action =
	| { type: "tick"; first: State; last: number }
	| { type: "drag"; on: boolean }
	| { type: "add"; files: Upload[] }
	| { type: "remove"; id: string }
	| { type: "draft"; value: string }
	| { type: "send"; id: string; text: string }

const HISTORY: Turn = {
	id: "history",
	files: [],
	text: "My landlord sent a new lease for the renewal. I want to know what changed before I sign.",
	reply: ["Send me the current lease and the new draft, and I'll compare them clause by clause."],
	age: Number.POSITIVE_INFINITY,
}

const SCRIPT_FILES: Upload[] = [
	{ id: "lease-2025", name: "lease-2025.pdf", size: 412_000, sent: 0 },
	{ id: "lease-2026", name: "lease-2026-draft.pdf", size: 1_340_000, sent: 0 },
	{ id: "floor-plan", name: "floor-plan.png", size: 2_150_000, sent: 0 },
]

const PROMPT = "What changed between these two? Anything I should push back on?"

const SCRIPT_REPLY = [
	"I read both leases and the floor plan. Three things changed in the 2026 draft.",
	"Rent goes from 24,000 to 25,500 a month, a 6.3% raise. The 2025 lease caps raises at 5%, so you can ask for 25,200.",
	"Clause 9 is new: you would pay for any repair under 3,000. In the 2025 lease the landlord pays for all of them.",
	"The floor plan counts the balcony, so the draft says 28 m² where the 2025 lease says 26 m². I would push back on the raise and on clause 9.",
]

// The clock, in 100ms ticks.
const T = { drag: 8, drop: 26, type: 36, send: 72 }
const TYPE_PER_TICK = 2
const BYTES_PER_TICK = 60_000
const REPLY_WAIT = 8
const REPLY_PER_TICK = 6
const END = T.send + REPLY_WAIT + Math.ceil(SCRIPT_REPLY.join(" ").length / REPLY_PER_TICK)
const PAUSE = { full: 80, compact: 40 }

const INITIAL: State = { t: 0, auto: true, dragging: false, pending: [], draft: "", turns: [HISTORY] }
// A tile skips the drag and opens on the files landing in the composer.
const COMPACT_START: State = { ...INITIAL, t: T.drop - 1 }

const kind = (name: string) => name.split(".").pop()?.toUpperCase() ?? "FILE"
const isImage = (name: string) => /\.(png|jpe?g|gif|webp|heic)$/i.test(name)
const replyLength = (turn: Turn) => turn.reply.join(" ").length
const replyDone = (turn: Turn) => turn.age >= REPLY_WAIT + Math.ceil(replyLength(turn) / REPLY_PER_TICK)

function list(names: string[]) {
	if (names.length <= 2) return names.join(" and ")
	return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
}

/** What the agent says about files it did not see coming. */
function replyAbout(files: Upload[]): string[] {
	if (files.length === 0)
		return [
			"Nothing came with that message. Drop files on the thread or press + to pick them, and I'll read them before I answer.",
		]
	const images = files.filter((file) => isImage(file.name)).length
	const documents = files.length - images
	const parts = [
		documents > 0 ? `${documents} ${documents === 1 ? "document" : "documents"}` : "",
		images > 0 ? `${images} ${images === 1 ? "image" : "images"}` : "",
	].filter(Boolean)
	const them = files.length === 1 ? "it" : "them"
	return [
		`I have ${list(parts)}: ${list(files.map((file) => file.name))}.`,
		`I'll keep ${them} with this thread, so you can ask about ${them} later without sending ${them} again. What should I look for first?`,
	]
}

function send(state: State, id: string, text: string, reply?: string[]): State {
	const files = state.pending.map((file) => ({ ...file, sent: file.size }))
	const turn: Turn = { id, files, text, reply: reply ?? replyAbout(files), age: 0 }
	return { ...state, pending: [], draft: "", dragging: false, turns: [...state.turns, turn] }
}

/** One tick: uploads move, the newest reply streams, and the recorded run takes its next step. */
function tick(state: State, first: State, last: number): State {
	if (state.auto && state.t >= last) return first
	let next = state
	if (next.pending.some((file) => file.sent < file.size))
		next = {
			...next,
			pending: next.pending.map((file) => ({
				...file,
				sent: Math.min(file.size, file.sent + BYTES_PER_TICK),
			})),
		}
	const newest = next.turns.at(-1)
	if (newest != null && !replyDone(newest))
		next = { ...next, turns: [...next.turns.slice(0, -1), { ...newest, age: newest.age + 1 }] }
	if (!next.auto) return next

	const t = next.t + 1
	next = { ...next, t }
	if (t === T.drag) next = { ...next, dragging: true }
	if (t === T.drop) next = { ...next, dragging: false, pending: SCRIPT_FILES }
	if (t >= T.type && t < T.send) next = { ...next, draft: PROMPT.slice(0, (t - T.type) * TYPE_PER_TICK) }
	if (t === T.send) next = send(next, "script", PROMPT, SCRIPT_REPLY)
	return next
}

function reduce(state: State, action: Action): State {
	switch (action.type) {
		case "tick":
			return tick(state, action.first, action.last)
		case "drag":
			return state.dragging === action.on ? state : { ...state, auto: false, dragging: action.on }
		case "add":
			return { ...state, auto: false, dragging: false, pending: [...state.pending, ...action.files] }
		case "remove":
			return { ...state, auto: false, pending: state.pending.filter((file) => file.id !== action.id) }
		case "draft":
			return state.draft === action.value ? state : { ...state, auto: false, draft: action.value }
		case "send":
			return send({ ...state, auto: false }, action.id, action.text)
	}
}

function toUploads(files: File[]): Upload[] {
	return files.map((file) => ({
		id: crypto.randomUUID(),
		name: file.name,
		size: file.size,
		sent: 0,
		preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
	}))
}

/** The reply text as streamed so far, split back into its paragraphs. */
function streamedParagraphs(turn: Turn) {
	let left = Math.max(0, (turn.age - REPLY_WAIT) * REPLY_PER_TICK)
	const out: string[] = []
	for (const paragraph of turn.reply) {
		if (left <= 0) break
		out.push(paragraph.slice(0, left))
		left -= paragraph.length + 1
	}
	return out
}

const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files")

const styles = stylex.create({
	sheet: { height: { default: "42rem", [MOBILE]: "38rem" } },
	stage: {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		minHeight: 0,
	},
	title: {
		margin: 0,
		fontFamily: font.display,
		fontSize: type.t3,
		fontWeight: 600,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	count: { flexShrink: 0, fontSize: type.t2, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
	sent: { display: "flex", flexDirection: "column", gap: space.xs },
	tiles: { display: "flex", justifyContent: "flex-end" },
	// While files are dragged over the scene, the drop target covers the thread on the same paper.
	overlay: {
		position: "absolute",
		inset: 0,
		zIndex: 1,
		display: "grid",
		placeItems: "center",
		padding: { default: space.xl, [MOBILE]: space.md },
		backgroundColor: color.bg,
	},
	drop: { width: "100%", maxWidth: "30rem" },
	stack: { display: "grid", gap: space.xs },
	tray: { display: "grid", gap: space.xs },
	upload: { display: "grid", gap: space.xxs },
	uploadLine: {
		display: "flex",
		justifyContent: "space-between",
		gap: space.sm,
		fontSize: type.t2,
		color: color.textMuted,
		fontVariantNumeric: "tabular-nums",
	},
	row: { display: "flex", alignItems: "flex-end", gap: space.xs },
	attach: { paddingBlockEnd: space.xs, flexShrink: 0 },
	composer: { flexGrow: 1, minWidth: 0 },
})

export function Scene({ compact }: SceneProps) {
	const first = compact ? COMPACT_START : INITIAL
	const [state, dispatch] = useReducer(reduce, first)
	const last = END + (compact ? PAUSE.compact : PAUSE.full)
	const clock = useCallback(
		(node: HTMLElement | null) => {
			if (node == null) return
			const id = setInterval(() => dispatch({ type: "tick", first, last }), 100)
			return () => clearInterval(id)
		},
		[first, last],
	)

	// Keep the newest line in view, unless the person scrolled up to read.
	// A tile has no reader to scroll it, so it always follows, and never opens mid-turn.
	const pinned = useRef(true)
	const thread = useRef<HTMLDivElement>(null)
	const followBottom = (node: HTMLElement | null) => {
		const box = node?.parentElement
		if (box == null || (!compact && !pinned.current)) return
		box.scrollTop = box.scrollHeight
		if (compact) startOnWholeTurn(box, thread.current)
	}

	const add = (files: File[]) => {
		if (files.length > 0) dispatch({ type: "add", files: toUploads(files) })
	}

	const { pending, turns } = state
	const uploading = pending.filter((file) => file.sent < file.size)
	const total = pending.reduce((sum, file) => sum + file.size, 0)
	const percent =
		total === 0 ? 100 : Math.round((pending.reduce((sum, file) => sum + file.sent, 0) / total) * 100)
	const held = turns.reduce((sum, turn) => sum + turn.files.length, 0)

	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div
				ref={clock}
				onDragEnter={(event) => {
					if (hasFiles(event)) dispatch({ type: "drag", on: true })
				}}
				onDragOver={(event) => {
					if (hasFiles(event)) event.preventDefault()
				}}
				onDragLeave={(event) => {
					const to = event.relatedTarget
					if (!(to instanceof Node && event.currentTarget.contains(to))) dispatch({ type: "drag", on: false })
				}}
				onDrop={(event) => {
					// A drop on the Dropzone is handled there; one anywhere else in the scene still counts.
					if (!event.defaultPrevented) add([...event.dataTransfer.files])
					event.preventDefault()
					dispatch({ type: "drag", on: false })
				}}
				{...stylex.props(styles.stage)}
			>
				<div {...stylex.props(chat.header)}>
					<div {...stylex.props(chat.column, chat.headerRow)}>
						<p {...stylex.props(styles.title)}>Lease renewal</p>
						{held > 0 && (
							<span {...stylex.props(styles.count)}>
								{held} {held === 1 ? "file" : "files"} in this thread
							</span>
						)}
					</div>
				</div>
				<div
					onScroll={(event) => {
						const box = event.currentTarget
						pinned.current = box.scrollHeight - box.scrollTop - box.clientHeight < 48
					}}
					{...stylex.props(chat.scroll)}
				>
					<div {...stylex.props(chat.column)}>
						<Part name="message">
							<Thread ref={thread}>
								{turns.map((turn) => {
									const paragraphs = streamedParagraphs(turn)
									const streaming = !replyDone(turn)
									return (
										<Fragment key={turn.id}>
											<div {...stylex.props(styles.sent)}>
												{turn.files.length > 0 && (
													<div {...stylex.props(styles.tiles)}>
														<Part name="attachment">
															<AttachmentGrid>
																{turn.files.map((file) => (
																	<AttachmentTile
																		key={file.id}
																		name={file.name}
																		label={kind(file.name)}
																		preview={file.preview}
																	/>
																))}
															</AttachmentGrid>
														</Part>
													</div>
												)}
												<UserMessage>{turn.text}</UserMessage>
											</div>
											{paragraphs.length === 0 ? (
												<AssistantMessage pending />
											) : (
												<AssistantMessage streaming={streaming}>
													{paragraphs.map((paragraph, index) => (
														<TextPart key={turn.reply[index]}>{paragraph}</TextPart>
													))}
												</AssistantMessage>
											)}
										</Fragment>
									)
								})}
							</Thread>
						</Part>
					</div>
					<div ref={followBottom} />
				</div>
				<div {...stylex.props(chat.dock)}>
					<div {...stylex.props(chat.column, styles.stack)}>
						{pending.length > 0 && (
							<div {...stylex.props(styles.tray)}>
								<Part name="pending-files">
									<PendingFiles files={pending} onRemove={(id) => dispatch({ type: "remove", id })} />
								</Part>
								{uploading.length > 0 && (
									<div {...stylex.props(styles.upload)}>
										<div {...stylex.props(styles.uploadLine)}>
											<span>
												Uploading {uploading.length} of {pending.length}
											</span>
											<span>{percent}%</span>
										</div>
										<Part name="progress">
											<Progress
												value={percent}
												aria-label="Upload files"
												valueText={`${percent}% · uploading ${uploading.length} of ${pending.length} files`}
											/>
										</Part>
									</div>
								)}
							</div>
						)}
						<div {...stylex.props(styles.row)}>
							<div {...stylex.props(styles.attach)}>
								<Part name="attach-button" inline align="start">
									<AttachButton onFiles={add} />
								</Part>
							</div>
							<div {...stylex.props(styles.composer)}>
								<Part name="composer">
									<Composer
										placeholder={pending.length > 0 ? "Ask about these files" : "Message the agent"}
										value={state.draft}
										onValueChange={(value) => dispatch({ type: "draft", value })}
										onSubmit={(text) => dispatch({ type: "send", id: crypto.randomUUID(), text })}
									/>
								</Part>
							</div>
						</div>
					</div>
				</div>
				{state.dragging && (
					<div {...stylex.props(styles.overlay)}>
						<div {...stylex.props(styles.drop)}>
							<Part name="dropzone">
								<Dropzone
									maxSize={MAX_SIZE}
									title="Drop files to hand them to the agent"
									hint="PDFs, images and text files, up to 25 MB each."
									onFiles={add}
									onReject={(rejections) =>
										toast(
											`${rejections.length === 1 ? "A file was" : `${rejections.length} files were`} left out`,
											{
												description: "Each file has to be under 25 MB. Split it or pick a smaller one.",
											},
										)
									}
								/>
							</Part>
						</div>
					</div>
				)}
			</div>
		</Sheet>
	)
}
