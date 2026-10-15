// A short voice call that moves a meeting, replayed on a 100ms clock. The transcript is a pure
// function of the clock `t`; mute holds the clock while it is the person's turn, and hanging up
// hands the composer back with the transcript left in the thread.
import {
	Bubble,
	CallBar,
	Composer,
	VoiceIndicator,
	toast,
	type CallStatus,
	type VoiceState,
} from "@anyknown/ui"
import { breakpoint, color, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useCallback, useReducer, useRef } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet, chat, startOnWholeTurn } from "./Sheet"

export const meta: SceneMeta = {
	id: "voice-call",
	title: "Voice call",
	moment:
		"You switch to talking. The composer turns into a call bar, and what you and the agent say lands in the thread as text.",
	decisions: [
		"The call bar takes the composer's place, so the controls stay where your hands already are.",
		"One waveform shows four states: gray while idle, blue while listening, thinking or speaking.",
		"The transcript is ordinary bubbles, so a call reads like the rest of the thread afterwards.",
		"Mute holds the call where it is and the waveform goes gray, so you can tell the agent is not hearing you.",
		"Hanging up gives the composer back in the same place; the mic button in it starts the next call.",
	],
	uses: ["call-bar", "voice-indicator", "bubble", "composer"],
}

const MOBILE = breakpoint.phone

type Line = { from: "user" | "assistant"; text: string }

const HISTORY: Line[] = [
	{ from: "user", text: "What's on my calendar this afternoon?" },
	{
		from: "assistant",
		text: "Two things: a call with Mia at 3 pm about the apartment, and the dentist at 5:30 pm.",
	},
]

const CALL: Line[] = [
	{ from: "user", text: "Can you move my three o'clock with Mia to tomorrow?" },
	{ from: "assistant", text: "Tomorrow at 3 pm is free for both of you. Should I send Mia the new time?" },
	{ from: "user", text: "Yes, and tell her I'll bring the signed lease." },
	{
		from: "assistant",
		text: "Done. Mia's invite now says Thursday at 3 pm, with a note that you're bringing the signed lease.",
	},
]

// The clock, in 100ms ticks: a pause before each of your turns, a think before each reply, and
// both sides speak a word every three ticks.
const WAIT = 10
const THINK = 12
const PER_WORD = 3
const words = (text: string) => text.split(" ")

type Segment = Line & { start: number; end: number }
const SEGMENTS: Segment[] = []
for (const line of CALL) {
	const before = SEGMENTS.at(-1)?.end ?? 0
	const start = before + (line.from === "user" ? WAIT : THINK)
	SEGMENTS.push({ ...line, start, end: start + words(line.text).length * PER_WORD })
}
const END = SEGMENTS.at(-1)?.end ?? 0
const PAUSE_COMPACT = 40

type Stage = { voice: VoiceState; status: CallStatus; yourTurn: boolean }

/** What the call is doing at tick `t`. */
function stageAt(t: number): Stage {
	const now = SEGMENTS.find((segment) => t < segment.end)
	if (now == null) return { voice: "listening", status: "listening", yourTurn: true }
	const speaking = t >= now.start
	if (now.from === "user")
		return speaking
			? { voice: "listening", status: "user-speaking", yourTurn: true }
			: { voice: "listening", status: "listening", yourTurn: true }
	return speaking
		? { voice: "speaking", status: "speaking", yourTurn: false }
		: { voice: "thinking", status: "thinking", yourTurn: false }
}

/** The transcript at tick `t`: every line spoken so far, the current one cut at its last word. */
function transcriptAt(t: number): Line[] {
	return SEGMENTS.filter((segment) => t > segment.start).map((segment) => ({
		from: segment.from,
		text: words(segment.text)
			.slice(0, Math.ceil((t - segment.start) / PER_WORD))
			.join(" "),
	}))
}

type State = { t: number; ticks: number; live: boolean; muted: boolean }
type Action =
	| { type: "tick"; loop: number | null }
	| { type: "mute"; muted: boolean }
	| { type: "hang-up" }
	| { type: "call" }

const START: State = { t: 0, ticks: 0, live: true, muted: false }

function reduce(state: State, action: Action): State {
	switch (action.type) {
		case "tick": {
			if (!state.live) return state
			if (action.loop != null && state.t >= action.loop) return START
			// Muted, nothing you say gets through, so your turn waits; the agent can still finish talking.
			const hold = state.muted && stageAt(state.t).yourTurn
			return { ...state, t: hold ? state.t : state.t + 1, ticks: state.ticks + 1 }
		}
		case "mute":
			return { ...state, muted: action.muted }
		case "hang-up":
			return { ...state, live: false, muted: false }
		case "call":
			return START
	}
}

const clock = (ticks: number) => {
	const seconds = Math.floor(ticks / 10)
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

const styles = stylex.create({
	sheet: { height: { default: "40rem", [MOBILE]: "36rem" } },
	title: {
		margin: 0,
		fontFamily: font.display,
		fontSize: type.t3,
		fontWeight: 600,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	// The same rhythm as Thread: 32px when the speaker changes (every line here), 24px above the first.
	thread: {
		display: "flex",
		flexDirection: "column",
		gap: space.xl,
		paddingBlockStart: { default: space.lg, [MOBILE]: space.md },
		paddingBlockEnd: space.lg,
	},
	line: { maxWidth: "85%" },
	user: { alignSelf: "flex-end" },
	assistant: { alignSelf: "flex-start" },
	marker: {
		alignSelf: "center",
		margin: 0,
		fontSize: type.t2,
		color: color.textMuted,
		fontVariantNumeric: "tabular-nums",
	},
	stack: { display: "grid", gap: space.sm },
	voice: { display: "flex", justifyContent: "center" },
})

function Lines({ lines }: { lines: Line[] }) {
	return lines.map((line, index) => (
		// A transcript only grows at its end, so a line's index is stable.
		<div key={index} {...stylex.props(styles.line, line.from === "user" ? styles.user : styles.assistant)}>
			<Bubble from={line.from}>{line.text}</Bubble>
		</div>
	))
}

export function Scene({ compact }: SceneProps) {
	const [state, dispatch] = useReducer(reduce, START)
	const loop = compact ? END + PAUSE_COMPACT : null
	const run = useCallback(
		(node: HTMLElement | null) => {
			if (node == null) return
			const id = setInterval(() => dispatch({ type: "tick", loop }), 100)
			return () => clearInterval(id)
		},
		[loop],
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

	const stage = stageAt(state.t)
	const voice: VoiceState = state.muted && stage.yourTurn ? "idle" : stage.voice

	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div ref={run} {...stylex.props(chat.header)}>
				<div {...stylex.props(chat.column, chat.headerRow)}>
					<p {...stylex.props(styles.title)}>Afternoon plans</p>
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
					<Part name="bubble">
						<div ref={thread} {...stylex.props(styles.thread)}>
							<Lines lines={HISTORY} />
							<p {...stylex.props(styles.marker)}>Voice call</p>
							<Lines lines={transcriptAt(state.t)} />
							{!state.live && <p {...stylex.props(styles.marker)}>Call ended · {clock(state.ticks)}</p>}
						</div>
					</Part>
				</div>
				<div ref={followBottom} />
			</div>
			<div {...stylex.props(chat.dock)}>
				<div {...stylex.props(chat.column, styles.stack)}>
					{state.live ? (
						<>
							<div {...stylex.props(styles.voice)}>
								<Part name="voice-indicator" inline>
									<VoiceIndicator state={voice} level={stage.status === "user-speaking" ? 0.8 : 0.3} />
								</Part>
							</div>
							<Part name="call-bar">
								<CallBar
									status={stage.status}
									seconds={Math.floor(state.ticks / 10)}
									muted={state.muted}
									onMute={(muted) => dispatch({ type: "mute", muted })}
									onHangUp={() => dispatch({ type: "hang-up" })}
								/>
							</Part>
						</>
					) : (
						<Part name="composer">
							<Composer
								placeholder="Message the agent"
								onMicToggle={() => dispatch({ type: "call" })}
								onSubmit={() =>
									toast("This is a recorded call", {
										description: "Press the mic to start it again. Nothing is sent from ui.anyknown.com.",
									})
								}
							/>
						</Part>
					)}
				</div>
			</div>
		</Sheet>
	)
}
