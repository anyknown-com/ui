// The reference scene: one recorded run of the agent fixing a bug, replayed on a 100ms clock.
// Every part of the screen is derived from the clock `t`, so the run is a pure function of time.
import {
	ActionBar,
	AssistantMessage,
	Composer,
	LiveDot,
	ReasoningFold,
	StatusBadge,
	SubThreadRow,
	TextPart,
	Thread,
	ToolGroup,
	type ToolGroupCall,
	UserMessage,
	toast,
} from "@anyknown/ui"
import { breakpoint, color, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useCallback, useRef, useState } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet, chat, startOnWholeTurn } from "./Sheet"

export const meta: SceneMeta = {
	id: "agent-working",
	title: "Agent at work",
	moment:
		"You asked the agent to fix a bug and went back to your own work. It reads code, runs tools and sends a helper off to dig, and a glance tells you how far it got.",
	decisions: [
		"Blue marks only what is running right now: the status dot, the badge and a running subagent. Tool calls carry no live state; the status line says what is happening.",
		"Reasoning streams open, then folds itself a second after it ends, so thinking never pushes the answer down.",
		"Calls in a row share one group that counts them, and each call opens to its input and output. A subagent is its own row; it shows its work while it runs and folds to one line when it is done.",
		"The agent's reply runs full width and your own messages sit on the right.",
		"The composer stays usable the whole time; an agent at work never locks you out.",
	],
	uses: [
		"message",
		"reasoning-fold",
		"tool-group",
		"sub-thread",
		"live-dot",
		"status-badge",
		"action-bar",
		"composer",
	],
}

const MOBILE = breakpoint.phone

const REQUEST = "The desktop never shows when the runtime retries after a 429. Find out why and fix it."

const REASONING =
	"The desktop only hears about retries through the SSE stream. Either the runtime never emits a retry event, or the contract drops it before the reducer sees it. Search for the event name first, then read the retry loop."

const SUBAGENT_TASK = "Trace retry events end to end"

const SUBAGENT_TEXT = "Starting where withRetry is called, then following one 429 out to the desktop reducer."

const REPLY =
	"Found it. The retry loop in turn.ts only logged each attempt, and the contract had no session.retrying type, so nothing reached the stream. I added the type to the contract and emit it from withRetry with the attempt and the delay. The desktop reducer already handled it, so the footer now shows “Retrying (2 of 3)” while it waits. Runtime tests pass."

// The clock, in 100ms ticks.
const T = {
	reasoning: 6,
	reasoningEnd: 26,
	search: 28,
	read: 40,
	subagent: 47,
	subagentEnd: 95,
	edit: 97,
	shell: 110,
	reply: 134,
}
const REPLY_PER_TICK = 6
const END = T.reply + Math.ceil(REPLY.length / REPLY_PER_TICK)
const PAUSE = { full: 90, compact: 50 }

// The subagent's own calls, one every 1.6 s while it runs.
const SUBAGENT_CALLS: (ToolGroupCall & { at: number })[] = [
	{
		at: T.subagent,
		id: "sub-retry",
		tool: "read",
		summary: "packages/runtime/src/retry.ts",
		input: { filePath: "packages/runtime/src/retry.ts" },
	},
	{
		at: T.subagent + 16,
		id: "sub-search",
		tool: "search",
		summary: "session.retrying",
		input: { pattern: "session.retrying", path: "packages" },
	},
	{
		at: T.subagent + 32,
		id: "sub-events",
		tool: "read",
		summary: "packages/contract/src/events.ts",
		input: { filePath: "packages/contract/src/events.ts" },
	},
]

type Phase = "queued" | "running" | "done"
const phase = (t: number, start: number, end: number): Phase =>
	t < start ? "queued" : t < end ? "running" : "done"
const streamed = (text: string, t: number, start: number, perTick: number) =>
	text.slice(0, Math.max(0, (t - start) * perTick))

/** What the header says the agent is doing. */
function nowLine(t: number) {
	if (t < T.reasoning) return "Reading your message"
	if (t < T.search) return "Thinking"
	if (t < T.read) return "Searching for session.retrying"
	if (t < T.subagent) return "Reading packages/runtime/src/turn.ts"
	if (t < T.subagentEnd) return "A subagent is tracing retry events"
	if (t < T.shell) return "Editing packages/runtime/src/turn.ts"
	if (t < T.reply) return "Running the runtime tests"
	return "Writing the reply"
}

const styles = stylex.create({
	sheet: { height: { default: "40rem", [MOBILE]: "36rem" } },
	now: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		minWidth: 0,
		fontSize: type.t2,
		color: color.textMuted,
	},
	nowText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	// The sub agent's run body follows the turn rhythm: a block sits 16px under the text.
	subBody: { display: "flex", flexDirection: "column", gap: space.md },
})

export function Scene({ compact }: SceneProps) {
	const [t, setT] = useState(0)
	const [model, setModel] = useState("Opus 5")
	const last = END + (compact ? PAUSE.compact : PAUSE.full)
	const clock = useCallback(
		(node: HTMLElement | null) => {
			if (node == null) return
			const id = setInterval(() => setT((now) => (now >= last ? 0 : now + 1)), 100)
			return () => clearInterval(id)
		},
		[last],
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

	const working = t < END
	const reasoning = phase(t, T.reasoning, T.reasoningEnd)
	const search = phase(t, T.search, T.read)
	const read = phase(t, T.read, T.subagent)
	const subagent = phase(t, T.subagent, T.subagentEnd)
	const edit = phase(t, T.edit, T.shell)
	const shell = phase(t, T.shell, T.reply)
	const subCalls = SUBAGENT_CALLS.filter((call) => t >= call.at)
	// A call shows up in its group when it starts; its output is there once it is done.
	const before: ToolGroupCall[] = [
		{
			id: "search",
			tool: "search",
			summary: "session.retrying",
			input: { pattern: "session.retrying", path: "packages" },
			output:
				search === "done"
					? 'apps/desktop/src/thread/reducer.ts:88  case "session.retrying":\npackages/runtime/src/turn.ts:41  // TODO: surface retries'
					: undefined,
		},
		{
			id: "read",
			tool: "read",
			summary: "packages/runtime/src/turn.ts",
			input: { filePath: "packages/runtime/src/turn.ts" },
		},
	].slice(0, read === "queued" ? 1 : 2)
	const after: ToolGroupCall[] = [
		{
			id: "edit",
			tool: "edit",
			summary: "packages/runtime/src/turn.ts",
			input: {
				filePath: "packages/runtime/src/turn.ts",
				oldString: "onRetry: (e) => log.warn('retrying', e)",
				newString:
					"onRetry: (e) => bus.emit('session.retrying', { sessionID, attempt: e.attempt, delayMs: e.delayMs })",
			},
		},
		{
			id: "shell",
			tool: "shell",
			summary: "pnpm test --filter runtime",
			input: { command: "pnpm test --filter runtime" },
			output:
				shell === "done"
					? "Test Files  9 passed (9)\n     Tests  61 passed (61)\n  Duration  4.18s"
					: undefined,
		},
	].slice(0, shell === "queued" ? 1 : 2)
	const reply = streamed(REPLY, t, T.reply, REPLY_PER_TICK)

	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div ref={clock} {...stylex.props(chat.header)}>
				<div {...stylex.props(chat.column, chat.headerRow)}>
					<span {...stylex.props(styles.now)}>
						{working ? (
							<Part name="live-dot" inline align="start">
								<LiveDot />
							</Part>
						) : null}
						<span {...stylex.props(styles.nowText)}>
							{working ? nowLine(t) : `Finished in ${Math.round(END / 10)} s`}
						</span>
					</span>
					<Part name="status-badge" inline>
						<StatusBadge tone={working ? "live" : "plain"}>{working ? "Agent working" : "Done"}</StatusBadge>
					</Part>
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
							<UserMessage>{REQUEST}</UserMessage>
							{t < T.reasoning ? (
								<AssistantMessage pending />
							) : (
								<AssistantMessage streaming={working}>
									<Part name="reasoning-fold">
										<ReasoningFold
											streaming={reasoning === "running"}
											durationSec={reasoning === "done" ? 2 : undefined}
										>
											{streamed(REASONING, t, T.reasoning, 12)}
										</ReasoningFold>
									</Part>
									{search !== "queued" && (
										<Part name="tool-group">
											<ToolGroup calls={before} />
										</Part>
									)}
									{subagent !== "queued" && (
										<Part name="sub-thread">
											<SubThreadRow
												sx={chat.flush}
												title={SUBAGENT_TASK}
												status={subagent === "running" ? "running" : "done"}
												onOpenRun={() =>
													toast("This is a recorded run", {
														description: "In the app, this opens the subagent's own thread.",
													})
												}
											>
												<div {...stylex.props(styles.subBody)}>
													<TextPart>{SUBAGENT_TEXT}</TextPart>
													<ToolGroup calls={subCalls} />
												</div>
											</SubThreadRow>
										</Part>
									)}
									{edit !== "queued" && <ToolGroup calls={after} />}
									{reply !== "" && <TextPart>{reply}</TextPart>}
									{!working && (
										<Part name="action-bar">
											<ActionBar>
												<ActionBar.Copy />
												<ActionBar.Regenerate onRegenerate={() => setT(0)} />
											</ActionBar>
										</Part>
									)}
								</AssistantMessage>
							)}
						</Thread>
					</Part>
				</div>
				<div ref={followBottom} />
			</div>
			<div {...stylex.props(chat.dock)}>
				<div {...stylex.props(chat.column)}>
					<Part name="composer">
						<Composer
							placeholder="Message the agent"
							models={["Opus 5", "Sonnet 5", "Fable 5"]}
							model={model}
							onModelChange={setModel}
							onSubmit={() =>
								toast("This is a recorded run", {
									description: "Nothing is sent from ui.anyknown.com.",
								})
							}
						/>
					</Part>
				</div>
			</div>
		</Sheet>
	)
}
